import pytest
import io
from fastapi import UploadFile
from backend.services.document_service import DocumentService
from backend.database import db_manager

@pytest.mark.asyncio
async def test_document_format_validation():
    """Unsupported file formats (.exe, .sh) must be rejected."""
    fake_file = UploadFile(
        filename="malicious_payload.exe",
        file=io.BytesIO(b"binary execution test")
    )
    actor = {"name": "Test Signatory", "role": "institution_rep", "institutionPid": "1-4392811"}

    with pytest.raises(Exception) as exc_info:
        await DocumentService.upload_document(
            application_id="APP-2026-00124",
            category="Land Registry",
            file=fake_file,
            actor=actor
        )
    assert "Unsupported file format" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_valid_document_upload_and_sha256():
    """Valid PDF document calculates SHA-256 hash and records versioning."""
    pdf_bytes = b"%PDF-1.4 Official Land Conveyance Deed Clause 2.4 - Sealed AICTE 2026"
    fake_file = UploadFile(
        filename="registered_land_deed_v2.pdf",
        file=io.BytesIO(pdf_bytes)
    )
    actor = {"name": "Dr. Arvind Sharma", "role": "institution_rep", "institutionPid": "1-4392811"}

    res = await DocumentService.upload_document(
        application_id="APP-2026-00124",
        category="Land Ownership Deeds",
        file=fake_file,
        actor=actor
    )
    assert res["success"] is True
    assert "DOC-1-4392811-LAN" in res["documentId"]
    assert len(res["sha256"]) == 64  # Full SHA-256 hex string
    assert res["version"] >= 1

@pytest.mark.asyncio
async def test_document_cross_institution_protection():
    """Institutions cannot download documents belonging to other institutions."""
    doc_id = "DOC-TEST-OTHER-INST"
    db_manager.documents[doc_id] = {
        "id": doc_id,
        "applicationId": "APP-OTHER-999",
        "storagePath": "uploads/fake.pdf"
    }
    db_manager.applications["APP-OTHER-999"] = {
        "id": "APP-OTHER-999",
        "pid": "PID-FOREIGN-999",
        "institutionName": "Foreign Institute"
    }

    unauthorized_actor = {"name": "Intruder", "role": "institution_rep", "institutionPid": "1-4392811"}

    with pytest.raises(Exception) as exc_info:
        DocumentService.get_document_path(doc_id, unauthorized_actor)
    assert "Access denied" in str(exc_info.value.detail)

@pytest.mark.asyncio
async def test_document_scrutiny_review():
    """Scrutiny officer can mark document verified with remarks."""
    doc_id = "DOC-REVIEW-TEST"
    test_app = {
        "id": "APP-REV-01",
        "pid": "1-4392811",
        "institutionName": "Dronacharya",
        "documents": [
            {"id": doc_id, "name": "sample.pdf", "status": "pending"}
        ]
    }
    db_manager.applications["APP-REV-01"] = test_app
    db_manager.documents[doc_id] = {"id": doc_id, "applicationId": "APP-REV-01"}

    so_actor = {"name": "Dr. P. K. Verma", "role": "scrutiny_officer"}
    res = await DocumentService.review_document(doc_id, "verified", "All Sub-Registrar seals authenticated.", so_actor)
    assert res["success"] is True
    assert res["status"] == "verified"
