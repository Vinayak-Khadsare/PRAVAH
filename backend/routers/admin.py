import time
import hashlib
from datetime import datetime, timezone
from fastapi import APIRouter, HTTPException, Depends, Query, status
from typing import Dict, Any, List, Optional
from backend.models import (
    UserResponse, AdminUserCreateRequest, UserStatusUpdateRequest,
    UserVerificationUpdateRequest, UserRoleUpdateRequest
)
from backend.security import hash_password
from backend.database import db_manager
from backend.dependencies import get_current_user, require_roles

router = APIRouter(prefix="/admin/users", tags=["Account Management & Governance"])

@router.get("", response_model=List[UserResponse], dependencies=[Depends(require_roles(["super_admin", "aicte_admin"]))])
async def list_users(
    role: Optional[str] = None,
    active: Optional[bool] = None,
    verification: Optional[str] = None,
    q: Optional[str] = None,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Retrieve registered accounts with regulatory governance filters (Admin only).
    """
    users_raw = []
    if db_manager.is_atlas_connected and db_manager.db is not None:
        query: Dict[str, Any] = {}
        if role:
            query["role"] = role
        if active is not None:
            query["active"] = active
        if verification:
            query["verificationStatus"] = verification
        if q:
            query["$or"] = [
                {"name": {"$regex": q, "$options": "i"}},
                {"email": {"$regex": q, "$options": "i"}},
                {"institutionPid": {"$regex": q, "$options": "i"}},
                {"institutionName": {"$regex": q, "$options": "i"}}
            ]
        users_raw = await db_manager.db.users.find(query, {"passwordHash": 0, "_id": 0}).to_list(500)
    else:
        users_raw = list(db_manager.users.values())
        if role:
            users_raw = [u for u in users_raw if u.get("role") == role]
        if active is not None:
            users_raw = [u for u in users_raw if u.get("active") == active]
        if verification:
            users_raw = [u for u in users_raw if u.get("verificationStatus") == verification]
        if q:
            term = q.lower()
            users_raw = [
                u for u in users_raw
                if term in u.get("name", "").lower()
                or term in u.get("email", "").lower()
                or term in str(u.get("institutionPid", "")).lower()
                or term in str(u.get("institutionName", "")).lower()
            ]

    result = []
    for u in users_raw:
        result.append(UserResponse(
            userId=u["userId"],
            email=u["email"],
            name=u["name"],
            role=u["role"],
            regionalOffice=u["regionalOffice"],
            initials=u.get("initials", "UR"),
            institutionPid=u.get("institutionPid"),
            institutionName=u.get("institutionName"),
            active=u.get("active", True),
            verificationStatus=u.get("verificationStatus", "verified"),
            createdAt=u.get("createdAt")
        ))
    return result

@router.post("", response_model=UserResponse, status_code=status.HTTP_201_CREATED, dependencies=[Depends(require_roles(["super_admin", "aicte_admin"]))])
async def create_privileged_user(
    req: AdminUserCreateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Authorized administrative provisioning of privileged accounts (Officers, Auditors, Admins).
    Never exposed publicly.
    """
    email_clean = req.email.lower().strip()

    if db_manager.is_atlas_connected and db_manager.db is not None:
        existing = await db_manager.db.users.find_one({"email": email_clean})
        if existing:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists.")
    else:
        if email_clean in db_manager.users:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="An account with this email already exists.")

    user_id = f"usr-adm-{int(time.time())}-{hashlib.md5(email_clean.encode()).hexdigest()[:4]}"
    initials = "".join([part[0].upper() for part in req.name.split()[:2]]) or "AU"
    created_at = datetime.now(timezone.utc).isoformat()

    user_doc = {
        "userId": user_id,
        "email": email_clean,
        "passwordHash": hash_password(req.password),
        "name": req.name.strip(),
        "role": req.role.value,
        "regionalOffice": req.regionalOffice,
        "initials": initials,
        "institutionPid": req.institutionPid.strip() if req.institutionPid else None,
        "institutionName": req.institutionName.strip() if req.institutionName else None,
        "active": True,
        "verificationStatus": "verified",
        "createdAt": created_at
    }

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.users.insert_one(user_doc)

    db_manager.users[email_clean] = user_doc

    # Log regulatory audit entry
    audit_entry = {
        "id": f"log-adm-{int(time.time())}",
        "title": "Privileged Account Provisioned",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"Admin '{current_user.get('name')}' provisioned privileged account '{req.name}' with role '{req.role.value}' for '{req.regionalOffice}'.",
        "actor": f"{current_user.get('name')} ({current_user.get('role')})",
        "type": "decision",
        "sha256": hashlib.sha256(f"{user_id}:{req.role.value}:{created_at}".encode()).hexdigest()[:16].upper()
    }
    db_manager.audit_events.insert(0, audit_entry)
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.audit_events.insert_one(dict(audit_entry))

    return UserResponse(
        userId=user_id,
        email=email_clean,
        name=req.name.strip(),
        role=req.role.value,
        regionalOffice=req.regionalOffice,
        initials=initials,
        institutionPid=user_doc["institutionPid"],
        institutionName=user_doc["institutionName"],
        active=True,
        verificationStatus="verified",
        createdAt=created_at
    )

@router.post("/{user_id}/status", dependencies=[Depends(require_roles(["super_admin", "aicte_admin"]))])
async def update_user_status(
    user_id: str,
    req: UserStatusUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Activate or deactivate an account (cannot deactivate self).
    """
    if current_user.get("userId") == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot deactivate their own session account."
        )

    target_user = None
    if db_manager.is_atlas_connected and db_manager.db is not None:
        target_user = await db_manager.db.users.find_one({"userId": user_id})
    else:
        for u in db_manager.users.values():
            if u.get("userId") == user_id:
                target_user = u
                break

    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User account '{user_id}' not found.")

    target_user["active"] = req.active
    action_text = "activated" if req.active else "deactivated"

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.users.update_one({"userId": user_id}, {"$set": {"active": req.active}})

    db_manager.users[target_user["email"]] = target_user

    audit_entry = {
        "id": f"log-adm-stat-{int(time.time())}",
        "title": f"User Account {action_text.capitalize()}",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"User '{target_user['name']}' ({target_user['email']}) was {action_text} by {current_user.get('name')}. Reason: {req.reason or 'Administrative policy review.'}",
        "actor": f"{current_user.get('name')} ({current_user.get('role')})",
        "type": "decision"
    }
    db_manager.audit_events.insert(0, audit_entry)
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.audit_events.insert_one(dict(audit_entry))

    return {"success": True, "userId": user_id, "active": req.active, "message": f"User account has been {action_text}."}

@router.post("/{user_id}/verify", dependencies=[Depends(require_roles(["super_admin", "aicte_admin", "regional_officer"]))])
async def verify_institution_user(
    user_id: str,
    req: UserVerificationUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Verify or reject a pending institution account.
    """
    target_user = None
    if db_manager.is_atlas_connected and db_manager.db is not None:
        target_user = await db_manager.db.users.find_one({"userId": user_id})
    else:
        for u in db_manager.users.values():
            if u.get("userId") == user_id:
                target_user = u
                break

    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User account '{user_id}' not found.")

    target_user["verificationStatus"] = req.verificationStatus
    if req.verificationStatus == "rejected":
        target_user["active"] = False

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.users.update_one(
            {"userId": user_id},
            {"$set": {"verificationStatus": req.verificationStatus, "active": target_user["active"]}}
        )

    db_manager.users[target_user["email"]] = target_user

    audit_entry = {
        "id": f"log-adm-ver-{int(time.time())}",
        "title": f"Institution Account Verification: {req.verificationStatus.capitalize()}",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"Institution rep '{target_user['name']}' PID '{target_user.get('institutionPid')}' marked {req.verificationStatus} by {current_user.get('name')}. Remarks: {req.remarks or 'Regulatory checks completed.'}",
        "actor": f"{current_user.get('name')} ({current_user.get('role')})",
        "type": "decision"
    }
    db_manager.audit_events.insert(0, audit_entry)
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.audit_events.insert_one(dict(audit_entry))

    return {
        "success": True,
        "userId": user_id,
        "verificationStatus": req.verificationStatus,
        "active": target_user["active"],
        "message": f"Institution account has been {req.verificationStatus}."
    }

@router.post("/{user_id}/role", dependencies=[Depends(require_roles(["super_admin", "aicte_admin"]))])
async def update_user_role(
    user_id: str,
    req: UserRoleUpdateRequest,
    current_user: Dict[str, Any] = Depends(get_current_user)
):
    """
    Assign privileged roles or reassign regional office scope (Admin only).
    """
    if current_user.get("userId") == user_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Administrators cannot modify their own role assignment directly."
        )

    target_user = None
    if db_manager.is_atlas_connected and db_manager.db is not None:
        target_user = await db_manager.db.users.find_one({"userId": user_id})
    else:
        for u in db_manager.users.values():
            if u.get("userId") == user_id:
                target_user = u
                break

    if not target_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"User account '{user_id}' not found.")

    old_role = target_user.get("role")
    target_user["role"] = req.role.value
    if req.regionalOffice:
        target_user["regionalOffice"] = req.regionalOffice
    if req.institutionPid is not None:
        target_user["institutionPid"] = req.institutionPid
    if req.institutionName is not None:
        target_user["institutionName"] = req.institutionName

    updates: Dict[str, Any] = {
        "role": req.role.value,
        "regionalOffice": target_user["regionalOffice"],
        "institutionPid": target_user.get("institutionPid"),
        "institutionName": target_user.get("institutionName")
    }

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.users.update_one({"userId": user_id}, {"$set": updates})

    db_manager.users[target_user["email"]] = target_user

    audit_entry = {
        "id": f"log-adm-role-{int(time.time())}",
        "title": "User Role & Scope Modified",
        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
        "description": f"Role for '{target_user['name']}' changed from '{old_role}' to '{req.role.value}' by {current_user.get('name')}. Scope: {target_user['regionalOffice']}. Reason: {req.reason or 'Administrative reallocation.'}",
        "actor": f"{current_user.get('name')} ({current_user.get('role')})",
        "type": "decision"
    }
    db_manager.audit_events.insert(0, audit_entry)
    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.audit_events.insert_one(dict(audit_entry))

    return {
        "success": True,
        "userId": user_id,
        "newRole": req.role.value,
        "regionalOffice": target_user["regionalOffice"],
        "message": "User role and jurisdiction updated successfully."
    }
