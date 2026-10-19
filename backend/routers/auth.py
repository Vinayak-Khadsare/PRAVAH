import time
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, status
from backend.models import UserCreate, UserLogin, UserResponse, TokenResponse
from backend.security import hash_password, verify_password, create_access_token
from backend.database import db_manager
from backend.dependencies import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication & Access Control"])

@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def register(req: UserCreate):
    """
    Register a new user account with validated fields, duplicate checking, and bcrypt password hashing.
    """
    email_clean = req.email.lower().strip()
    
    # Check duplicate in DB or memory
    if db_manager.is_atlas_connected and db_manager.db is not None:
        existing = await db_manager.db.users.find_one({"email": email_clean})
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this official email already exists.")
    else:
        if email_clean in db_manager.users:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this official email already exists.")
            
    # Generate user ID
    user_id = f"usr-{int(time.time())}"
    initials = "".join([part[0].upper() for part in req.name.split()[:2]]) or "UR"
    
    user_doc = {
        "userId": user_id,
        "email": email_clean,
        "passwordHash": hash_password(req.password),
        "name": req.name,
        "role": req.role.value,
        "regionalOffice": req.regionalOffice,
        "initials": initials,
        "institutionPid": req.institutionPid,
        "active": True,
        "createdAt": datetime.now(timezone.utc).isoformat()
    }
    
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.users.insert_one(user_doc)
    
    # Also update in-memory dict
    db_manager.users[email_clean] = user_doc
    
    return UserResponse(
        userId=user_id,
        email=email_clean,
        name=req.name,
        role=req.role.value,
        regionalOffice=req.regionalOffice,
        initials=initials,
        institutionPid=req.institutionPid,
        active=True
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
        active=user.get("active", True),
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
        active=current_user.get("active", True),
    )

@router.post("/logout")
async def logout(current_user: dict = Depends(get_current_user)):
    """
    Log out active user session.
    """
    return {"success": True, "message": "Session terminated successfully."}
