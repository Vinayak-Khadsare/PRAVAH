import time
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from backend.models import UserRegistrationRequest, UserLogin, UserResponse, TokenResponse
from backend.security import hash_password, verify_password, create_access_token
from backend.database import db_manager
from backend.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserRegistrationRequest):
    """
    Public registration endpoint.
    Strictly restricted to Institution Representatives (`institution_rep`).
    Any attempt to register with a privileged role is ignored and blocked.
    """
    # 1. Validate password confirmation
    if req.password != req.confirmPassword:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match. Please ensure both passwords are identical."
        )

    if len(req.password) < 8:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Password must be at least 8 characters long."
        )

    email_clean = req.email.lower().strip()
    pid_clean = req.institutionPid.strip()
    inst_name_clean = req.institutionName.strip()

    # 2. Check for duplicate account
    if db_manager.is_atlas_connected and db_manager.db is not None:
        existing = await db_manager.db.users.find_one({"email": email_clean})
        if existing:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this official email already exists."
            )
    else:
        if email_clean in db_manager.users:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail="An account with this official email already exists."
            )

    # 3. Institutional PID Verification Policy:
    # Check if PID corresponds to an approved/registered technical institution
    is_known_pid = False
    known_apps = []
    if db_manager.is_atlas_connected and db_manager.db is not None:
        known_apps = await db_manager.db.applications.find({"pid": pid_clean}, {"_id": 0}).to_list(10)
    else:
        known_apps = [a for a in db_manager.applications.values() if a.get("pid") == pid_clean]

    if known_apps or pid_clean in ["1-4392811", "1-4392812"]:
        verification_status = "verified"
    else:
        # Unverified PIDs require Directorate review before unrestricted clearance
        verification_status = "pending"

    # 4. Generate unique ID and initials
    user_id = f"usr-inst-{int(time.time())}-{hashlib.md5(email_clean.encode()).hexdigest()[:4]}"
    initials = "".join([part[0].upper() for part in req.name.split()[:2]]) or "IR"
    created_at = datetime.now(timezone.utc).isoformat()

    # Enforce institution_rep role server-side; do not trust role from client
    user_doc = {
        "userId": user_id,
        "email": email_clean,
        "passwordHash": hash_password(req.password),
        "name": req.name.strip(),
        "role": "institution_rep",
        "regionalOffice": req.regionalOffice or "Northern Regional Office (NRO) - Kanpur",
        "initials": initials,
        "institutionPid": pid_clean,
        "institutionName": inst_name_clean,
        "active": True,
        "verificationStatus": verification_status,
        "createdAt": created_at
    }

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.users.insert_one(user_doc)

    # Update in-memory dict
    db_manager.users[email_clean] = user_doc

    # Log regulatory audit entry
    audit_seal = hashlib.sha256(f"{user_id}:{email_clean}:{pid_clean}:{created_at}".encode()).hexdigest()[:16].upper()
    audit_entry = {
        "id": f"log-auth-{int(time.time())}",
        "title": "New Institution Representative Registered",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"Institution representative '{req.name}' registered for PID '{pid_clean}' ({inst_name_clean}). Status: {verification_status}.",
        "actor": f"{req.name} (Institution Representative)",
        "type": "action",
        "sha256": audit_seal,
        "applicationId": known_apps[0]["id"] if known_apps else None
    }
    db_manager.audit_events.insert(0, audit_entry)
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.audit_events.insert_one(dict(audit_entry))

    return UserResponse(
        userId=user_id,
        email=email_clean,
        name=req.name.strip(),
        role="institution_rep",
        regionalOffice=req.regionalOffice or "Northern Regional Office (NRO) - Kanpur",
        initials=initials,
        institutionPid=pid_clean,
        institutionName=inst_name_clean,
        active=True,
        verificationStatus=verification_status,
        createdAt=created_at
    )

@router.post("/login", response_model=TokenResponse)
async def login(req: UserLogin):
    """
    Authenticate official credentials, verify bcrypt hash, and issue a signed JWT session token.
    """
    email_clean = req.email.lower().strip()
    
    # Retrieve user record
    user = None
    if db_manager.is_atlas_connected and db_manager.db is not None:
        user = await db_manager.db.users.find_one({"email": email_clean})
    else:
        user = db_manager.users.get(email_clean)
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Official email or password incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not verify_password(req.password, user.get("passwordHash", "")):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid credentials. Official email or password incorrect.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account suspended or deactivated. Contact Regional Directorate.",
        )
        
    # Generate signed JWT
    access_token = create_access_token(
        data={
            "sub": user["email"],
            "userId": user["userId"],
            "role": user["role"],
            "regionalOffice": user["regionalOffice"],
            "institutionPid": user.get("institutionPid"),
        }
    )
    
    # If regional office override was requested and user is authorized, update session context
    user_office = req.office if (req.office and user["role"] in ["regional_officer", "super_admin", "aicte_admin"]) else user["regionalOffice"]
    
    user_res = UserResponse(
        userId=user["userId"],
        email=user["email"],
        name=user["name"],
        role=user["role"],
        regionalOffice=user_office,
        initials=user["initials"],
        institutionPid=user.get("institutionPid"),
        institutionName=user.get("institutionName"),
        active=user.get("active", True),
        verificationStatus=user.get("verificationStatus", "verified"),
        createdAt=user.get("createdAt"),
    )
    
    return TokenResponse(
        access_token=access_token,
        token_type="bearer",
        user=user_res
    )

@router.get("/me", response_model=UserResponse)
async def get_current_user_profile(current_user: dict = Depends(get_current_user)):
    """
    Return sanitized profile of currently authenticated session user.
    """
    return UserResponse(
        userId=current_user["userId"],
        email=current_user["email"],
        name=current_user["name"],
        role=current_user["role"],
        regionalOffice=current_user["regionalOffice"],
        initials=current_user["initials"],
        institutionPid=current_user.get("institutionPid"),
        institutionName=current_user.get("institutionName"),
        active=current_user.get("active", True),
        verificationStatus=current_user.get("verificationStatus", "verified"),
        createdAt=current_user.get("createdAt"),
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Log out active user session.
    """
    return {"success": True, "message": "Session terminated successfully."}
