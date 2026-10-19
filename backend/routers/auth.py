from fastapi import APIRouter, HTTPException
from backend.models import LoginRequest

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/login")
async def login(req: LoginRequest):
    # Demonstration authentication verification
    is_verma = "verma" in req.email.lower()
    
    role = "Senior Scrutiny Officer" if is_verma else "Member Secretary (RO Auth)"
    name = "Dr. P. K. Verma" if is_verma else "Dr. R. K. Srivastava"
    initials = "PV" if is_verma else "RS"

    return {
        "access_token": f"pravah_token_{req.email.replace('@', '_')}",
        "token_type": "bearer",
        "user": {
            "userId": req.email,
            "name": name,
            "role": role,
            "regionalOffice": req.office,
            "initials": initials,
        }
    }

@router.get("/me")
async def get_current_user():
    return {
        "userId": "r.srivastava@aicte-india.org",
        "name": "Dr. R. K. Srivastava",
        "role": "Member Secretary (RO Auth)",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "initials": "RS",
    }
