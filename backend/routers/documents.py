from fastapi import APIRouter, Depends, UploadFile, File, Form, HTTPException, status
from fastapi.responses import FileResponse
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from backend.dependencies import get_current_user, require_roles
from backend.services.document_service import DocumentService

router = APIRouter(prefix="/documents", tags=["Documents"])

class ReviewDocumentRequest(BaseModel):
    status: str  # 'verified' | 'rejected'
    remarks: str

@router.get("")
async def get_documents(user: Dict[str, Any] = Depends(get_current_user)):
    """Retrieve all documents scoped to user role."""
    return await DocumentService.get_all_documents(actor=user)

@router.post("/upload")
async def upload_document(
    applicationId: str = Form(...),
    category: str = Form(...),
    file: UploadFile = File(...),
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Upload and cryptographically seal an application document."""
    return await DocumentService.upload_document(
        application_id=applicationId,
        category=category,
        file=file,
        actor=user
    )

@router.get("/{document_id}/download")
async def download_document(document_id: str, user: Dict[str, Any] = Depends(get_current_user)):
    """Securely download a document with authorization check."""
    storage_path = DocumentService.get_document_path(document_id=document_id, actor=user)
    return FileResponse(
        path=storage_path,
        filename=f"{document_id}.pdf",
        media_type="application/octet-stream"
    )

@router.post("/{document_id}/review", dependencies=[Depends(require_roles(["scrutiny_officer", "regional_officer", "aicte_admin", "super_admin"]))])
async def review_document(
    document_id: str,
    req: ReviewDocumentRequest,
    user: Dict[str, Any] = Depends(get_current_user)
):
    """Record verification review status on document."""
    return await DocumentService.review_document(
        document_id=document_id,
        review_status=req.status,
        remarks=req.remarks,
        actor=user
    )
