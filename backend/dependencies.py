from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from typing import List, Dict, Any, Optional
from backend.security import decode_access_token
from backend.database import db_manager

security = HTTPBearer(auto_error=False)

async def get_current_user(credentials: Optional[HTTPAuthorizationCredentials] = Depends(security)) -> Dict[str, Any]:
    """
    Authenticate request via Bearer JWT token.
    Raises 401 if token is missing, invalid, expired, or user is inactive.
    """
    if not credentials or not credentials.credentials:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication credentials required. Please provide a valid Bearer token.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    token = credentials.credentials
    try:
        payload = decode_access_token(token)
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid authentication token: {str(e)}",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_email = payload.get("sub")
    if not user_email:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Malformed token payload: missing subject claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    # Check user in DB or memory store
    user = None
    if db_manager.is_atlas_connected and db_manager.db is not None:
        user = await db_manager.db.users.find_one({"email": user_email}, {"_id": 0})
    else:
        user = db_manager.users.get(user_email)
        
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account no longer exists.",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    if not user.get("active", True):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account has been deactivated. Contact Regional Directorate.",
        )
        
    if user.get("verificationStatus") == "rejected":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User account verification was rejected by Regional Directorate.",
        )
        
    return user

def require_roles(allowed_roles: List[str]):
    """
    RBAC dependency factory.
    Verifies that the authenticated user possesses one of the authorized statutory roles.
    """
    async def role_checker(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
        user_role = current_user.get("role")
        # super_admin has universal access
        if user_role == "super_admin":
            return current_user
            
        if user_role not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Access denied. Required role in {allowed_roles}, but current role is '{user_role}'.",
            )
        return current_user
    return role_checker

def prevent_auditor_mutation(current_user: Dict[str, Any] = Depends(get_current_user)) -> Dict[str, Any]:
    """
    Ensure auditor accounts cannot execute write/mutation operations.
    """
    if current_user.get("role") == "auditor":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Auditor role is strictly read-only and cannot mutate regulatory records.",
        )
    return current_user

def verify_institution_scope(application: Any, current_user: Dict[str, Any]):
    """
    Ensure an institution user cannot access or mutate records belonging to a different institution.
    """
    if current_user.get("role") == "institution_rep":
        user_pid = current_user.get("institutionPid")
        app_pid = application.get("pid") if isinstance(application, dict) else application
        if not user_pid or user_pid != app_pid:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Access restricted: You may only access regulatory records belonging to your assigned institution.",
            )

def verify_regional_scope(regional_office: Optional[str], current_user: Dict[str, Any]):
    """
    Ensure regional officers only access records within their assigned regional jurisdiction.
    """
    if current_user.get("role") == "regional_officer":
        user_office = current_user.get("regionalOffice")
        if user_office and regional_office and "Central Bureau" not in user_office:
            # Check regional office match
            u_norm = user_office.lower().replace("office", "").strip()
            r_norm = regional_office.lower().replace("office", "").strip()
            if u_norm not in r_norm and r_norm not in u_norm:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access restricted: Regional officer may only access records within jurisdiction '{user_office}'.",
                )
