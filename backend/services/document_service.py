import os
import time
import hashlib
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, UploadFile, status
from backend.config import settings
from backend.database import db_manager

ALLOWED_EXTENSIONS = {".pdf", ".jpg", ".jpeg", ".png"}

class DocumentService:
    @classmethod
    async def get_all_documents(cls, actor: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Retrieve all documents with role scoping."""
        docs = []
        inst_pid = actor.get("institutionPid") if actor.get("role") == "institution_rep" else None

        apps = []
        if db_manager.is_atlas_connected and db_manager.db is not None:
            apps = await db_manager.db.applications.find({}, {"_id": 0}).to_list(200)
        else:
            apps = list(db_manager.applications.values())

        for app in apps:
            if inst_pid and app.get("pid") != inst_pid:
                continue
            for d in app.get("documents", []):
                docs.append({
                    **d,
                    "applicationId": app.get("id"),
                    "institution": app.get("institutionName"),
                    "pid": app.get("pid")
                })
        return docs

    @classmethod
    async def upload_document(
        cls,
        application_id: str,
        category: str,
        file: UploadFile,
        actor: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Validate, store, cryptographically hash, and version an uploaded institutional document.
        """
        # 1. Retrieve application
        app = None
        if db_manager.is_atlas_connected and db_manager.db is not None:
            app = await db_manager.db.applications.find_one({"id": application_id}, {"_id": 0})
        else:
            app = db_manager.applications.get(application_id)

        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{application_id}' not found.")

        # Check institution scope
        if actor.get("role") == "institution_rep":
            if actor.get("institutionPid") and actor.get("institutionPid") != app.get("pid"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Cannot upload documents for another institution.")

        # 2. Validate file extension
        filename = file.filename or "uploaded_document.pdf"
        ext = os.path.splitext(filename)[1].lower()
        if ext not in ALLOWED_EXTENSIONS:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Unsupported file format '{ext}'. Permitted formats: {', '.join(ALLOWED_EXTENSIONS)}.",
            )

        # 3. Read content and validate size limit
        content = await file.read()
        file_size = len(content)
        if file_size > settings.MAX_FILE_SIZE_BYTES:
            raise HTTPException(
                status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
                detail=f"File exceeds maximum allowed size of {settings.MAX_FILE_SIZE_BYTES // (1024 * 1024)} MB.",
            )

        # 4. Calculate cryptographic SHA-256 hash
        sha256_hash = hashlib.sha256(content).hexdigest().upper()

        # 5. Determine versioning (check if category document already exists)
        existing_docs = [d for d in app.get("documents", []) if d.get("category") == category]
        version = len(existing_docs) + 1

        doc_id = f"DOC-{app.get('pid', '0')}-{category[:3].upper()}{version}"
        safe_disk_filename = f"{doc_id}_{int(time.time())}{ext}"
        os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
        save_path = os.path.join(settings.UPLOAD_DIR, safe_disk_filename)

        # Write to storage
        with open(save_path, "wb") as f:
            f.write(content)

        formatted_size = f"{file_size / (1024 * 1024):.1f} MB" if file_size >= 1024 * 1024 else f"{file_size / 1024:.1f} KB"

        doc_record = {
            "id": doc_id,
            "name": filename,
            "size": formatted_size,
            "uploadDate": time.strftime("%d %b %Y, %I:%M %p"),
            "status": "pending",
            "category": category,
            "sha256": sha256_hash,
            "version": version,
            "storagePath": save_path,
            "uploadedBy": actor.get("name", "Institution Signatory")
        }

        # Persist document metadata
        app.setdefault("documents", []).append(doc_record)
        db_manager.documents[doc_id] = {
            **doc_record,
            "applicationId": application_id,
            "institution": app["institutionName"]
        }

        # Add audit log event
        audit_entry = {
            "id": f"log-{int(time.time())}",
            "title": f"Document Uploaded: {category} (v{version})",
            "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
            "description": f"Uploaded file '{filename}' ({formatted_size}) under category '{category}'. SHA-256 Seal: {sha256_hash}",
            "actor": f"{actor.get('name', 'Applicant')} ({actor.get('role', 'institution_rep')})",
            "type": "upload",
            "sha256": sha256_hash,
            "applicationId": application_id
        }
        app.setdefault("auditLog", []).insert(0, audit_entry)

        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.applications.update_one(
                {"id": application_id},
                {
                    "$push": {
                        "documents": doc_record,
                        "auditLog": {"$each": [audit_entry], "$position": 0}
                    }
                }
            )

        return {
            "success": True,
            "documentId": doc_id,
            "filename": filename,
            "version": version,
            "sha256": sha256_hash,
            "status": "pending"
        }

    @classmethod
    def get_document_path(cls, document_id: str, actor: Dict[str, Any]) -> str:
        """
        Verify access permissions and return local storage path for retrieval.
        """
        doc = db_manager.documents.get(document_id)
        if not doc:
            # Check in memory_apps documents
            for a in db_manager.applications.values():
                for d in a.get("documents", []):
                    if d.get("id") == document_id:
                        doc = {**d, "applicationId": a.get("id"), "pid": a.get("pid")}
                        break
                if doc:
                    break

        if not doc:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document '{document_id}' not found.")

        # Check cross-institution scoping
        if actor.get("role") == "institution_rep":
            app_id = doc.get("applicationId")
            app = db_manager.applications.get(app_id)
            if app and actor.get("institutionPid") != app.get("pid"):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Access denied: Cannot retrieve document from other institutions.")

        storage_path = doc.get("storagePath")
        if not storage_path or not os.path.exists(storage_path):
            # In demo mode, if physical file doesn't exist yet on disk, create a placeholder
            if storage_path:
                os.makedirs(os.path.dirname(storage_path), exist_ok=True)
                with open(storage_path, "wb") as f:
                    f.write(b"%PDF-1.4 Demonstration Digital Record Seal - AICTE PRAVAH")
            else:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Physical document file missing from storage repository.")

        return storage_path

    @classmethod
    async def review_document(
        cls,
        document_id: str,
        review_status: str,  # 'verified' | 'rejected'
        remarks: str,
        actor: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Record official scrutiny review outcome on a document."""
        if actor.get("role") not in ["scrutiny_officer", "regional_officer", "aicte_admin", "super_admin"]:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized to review documents.")

        doc_found = False
        target_app = None
        for app in db_manager.applications.values():
            for d in app.get("documents", []):
                if d.get("id") == document_id:
                    d["status"] = review_status
                    d["reviewedBy"] = actor.get("name")
                    d["reviewRemarks"] = remarks
                    doc_found = True
                    target_app = app
                    break
            if doc_found:
                break

        if not doc_found:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Document '{document_id}' not found.")

        now_str = time.strftime("%d %b %Y, %I:%M %p IST")
        audit_entry = {
            "id": f"log-{int(time.time())}",
            "title": f"Document Review Recorded: {document_id} ({review_status.upper()})",
            "timestamp": now_str,
            "description": f"Official document verification completed. Remarks: {remarks}",
            "actor": f"{actor.get('name')} ({actor.get('role')})",
            "type": "decision",
            "applicationId": target_app.get("id") if target_app else None
        }
        if target_app:
            target_app.setdefault("auditLog", []).insert(0, audit_entry)

        if db_manager.is_atlas_connected and db_manager.db is not None and target_app:
            await db_manager.db.applications.update_one(
                {"id": target_app["id"]},
                {
                    "$set": {"documents": target_app.get("documents", [])},
                    "$push": {"auditLog": {"$each": [audit_entry], "$position": 0}}
                }
            )

        return {
            "success": True,
            "documentId": document_id,
            "status": review_status,
            "message": f"Document has been marked as {review_status}."
        }
