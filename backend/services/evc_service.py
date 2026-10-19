import time
import hashlib
from typing import Dict, Any, List, Optional
from fastapi import HTTPException, status
from backend.database import db_manager

class EvcService:
    @classmethod
    async def get_all_schedules(cls) -> List[Dict[str, Any]]:
        """Retrieve all EVC schedules."""
        if db_manager.is_atlas_connected and db_manager.db is not None:
            schedules = await db_manager.db.evc.find({}, {"_id": 0}).to_list(100)
            if schedules:
                return schedules
        return list(db_manager.evc.values())

    @classmethod
    async def schedule_visit(
        cls,
        application_id: str,
        visit_date: str,
        panel_convener: str,
        panel_members: List[str],
        actor: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Schedule an EVC inspection visit with eligibility checking and panel conflict detection.
        """
        # 1. Retrieve application
        app = None
        if db_manager.is_atlas_connected and db_manager.db is not None:
            app = await db_manager.db.applications.find_one({"id": application_id}, {"_id": 0})
        else:
            app = db_manager.applications.get(application_id)

        if not app:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Application '{application_id}' not found.")

        # 2. Check eligibility: No critical deficiencies or blockers
        deficiencies = app.get("deficiencies", [])
        for d in deficiencies:
            if d.get("isCritical") and d.get("status") == "deficient":
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail=f"EVC Scheduling Ineligible: Application has unresolved critical deficiency '{d.get('title')}'.",
                )
        if app.get("criticalBlocker") and not app.get("criticalBlocker", {}).get("resolved"):
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=f"EVC Scheduling Ineligible: Active regulatory blocker '{app['criticalBlocker'].get('title')}'.",
            )

        # 3. Detect panel member conflicts for the requested date
        existing_schedules = list(db_manager.evc.values())
        if db_manager.is_atlas_connected and db_manager.db is not None:
            existing_schedules = await db_manager.db.evc.find({"visitDate": visit_date}, {"_id": 0}).to_list(100)

        proposed_roster = [panel_convener] + panel_members
        for sched in existing_schedules:
            if sched.get("visitDate") == visit_date and sched.get("status") not in ["Cancelled", "Completed"]:
                booked_members = [sched.get("panelConvener")] + sched.get("panelMembers", [])
                conflicts = set(proposed_roster).intersection(set(booked_members))
                if conflicts:
                    conflict_names = ", ".join(conflicts)
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Panel Conflict Detected: Panelist(s) [{conflict_names}] already scheduled for visit at '{sched.get('institutionName')}' on {visit_date}.",
                    )

        # 4. Generate security token & roster record
        evc_id = f"EVC-2026-{int(time.time()) % 1000:03d}"
        token_hasher = hashlib.sha256()
        token_hasher.update(f"{evc_id}:{application_id}:{visit_date}:{panel_convener}".encode("utf-8"))
        security_token = f"EVC-SEC-{token_hasher.hexdigest()[:12].upper()}"

        evc_record = {
            "id": evc_id,
            "applicationId": application_id,
            "institutionName": app["institutionName"],
            "location": f"{app['city']}, {app['state']}",
            "regionalOffice": app["regionalOffice"],
            "visitDate": visit_date,
            "panelConvener": panel_convener,
            "panelMembers": panel_members,
            "status": "Scheduled",
            "inspectionType": "Physical Campus Audit",
            "slaDaysRemaining": 5,
            "securityToken": security_token,
            "reportSubmitted": False,
            "reportSummary": None,
            "dispatched": False,
            "dispatchTimestamp": None
        }

        # 5. Persist record
        db_manager.evc[evc_id] = evc_record
        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.evc.insert_one(evc_record)
            await db_manager.db.applications.update_one(
                {"id": application_id},
                {"$set": {"status": "evc_scheduled", "currentStageNumber": 4, "currentStageLabel": "Stage 04 (EVC Inspection)"}}
            )

        # Update in-memory app status as well
        app["status"] = "evc_scheduled"
        app["currentStageNumber"] = 4
        app["currentStageLabel"] = "Stage 04 (EVC Inspection)"
        db_manager.applications[application_id] = app

        return {
            "success": True,
            "evcRecord": evc_record,
            "message": f"EVC inspection panel successfully constituted and scheduled for {visit_date}."
        }

    @classmethod
    async def dispatch_biometric_token(cls, evc_id: str, actor: Dict[str, Any]) -> Dict[str, Any]:
        """
        Record verified biometric dispatch for the inspection panel.
        """
        sched = db_manager.evc.get(evc_id)
        if not sched and db_manager.is_atlas_connected and db_manager.db is not None:
            sched = await db_manager.db.evc.find_one({"id": evc_id}, {"_id": 0})
        if not sched:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"EVC schedule '{evc_id}' not found.")

        now_str = time.strftime("%d %b %Y, %I:%M %p IST")
        sched["dispatched"] = True
        sched["dispatchTimestamp"] = now_str
        sched["status"] = "Dispatched"

        # Update persistent stores
        db_manager.evc[evc_id] = sched
        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.evc.update_one(
                {"id": evc_id},
                {"$set": {"dispatched": True, "dispatchTimestamp": now_str, "status": "Dispatched"}}
            )

        # Add audit log to application
        app_id = sched["applicationId"]
        app = db_manager.applications.get(app_id)
        if app:
            audit_entry = {
                "id": f"log-{int(time.time())}",
                "title": f"EVC Panel Dispatched: {evc_id}",
                "timestamp": now_str,
                "description": f"Biometric token transmitted to Convener {sched.get('panelConvener')}. Geofenced GPS validation enabled.",
                "actor": f"{actor.get('name', 'RO Official')} ({actor.get('role', 'regional_officer')})",
                "type": "action",
                "applicationId": app_id
            }
            app.setdefault("auditLog", []).insert(0, audit_entry)

        return {
            "success": True,
            "evcId": evc_id,
            "securityToken": sched.get("securityToken"),
            "dispatchTimestamp": now_str,
            "message": f"Biometric token and geofencing credentials transmitted for {evc_id}."
        }

    @classmethod
    async def reschedule_visit(
        cls,
        evc_id: str,
        new_date: str,
        reason: str,
        actor: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Reschedule an existing inspection visit with conflict checks."""
        sched = db_manager.evc.get(evc_id)
        if not sched and db_manager.is_atlas_connected and db_manager.db is not None:
            sched = await db_manager.db.evc.find_one({"id": evc_id}, {"_id": 0})
        if not sched:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"EVC schedule '{evc_id}' not found.")

        old_date = sched.get("visitDate")
        # Check conflict on new_date
        all_schedules = list(db_manager.evc.values())
        proposed_roster = [sched.get("panelConvener")] + sched.get("panelMembers", [])
        for s in all_schedules:
            if s.get("id") != evc_id and s.get("visitDate") == new_date and s.get("status") not in ["Cancelled", "Completed"]:
                booked = [s.get("panelConvener")] + s.get("panelMembers", [])
                conflicts = set(proposed_roster).intersection(set(booked))
                if conflicts:
                    raise HTTPException(
                        status_code=status.HTTP_409_CONFLICT,
                        detail=f"Conflict on new date {new_date}: Panelist(s) [{', '.join(conflicts)}] already booked.",
                    )

        now_str = time.strftime("%d %b %Y, %I:%M %p IST")
        sched["visitDate"] = new_date
        sched["rescheduledReason"] = reason
        sched["rescheduledAt"] = now_str
        db_manager.evc[evc_id] = sched

        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.evc.update_one(
                {"id": evc_id},
                {"$set": {"visitDate": new_date, "rescheduledReason": reason, "rescheduledAt": now_str}}
            )

        return {
            "success": True,
            "evcId": evc_id,
            "oldDate": old_date,
            "newDate": new_date,
            "message": f"EVC visit rescheduled to {new_date}. Reason: {reason}"
        }

    @classmethod
    async def cancel_visit(
        cls,
        evc_id: str,
        reason: str,
        actor: Dict[str, Any]
    ) -> Dict[str, Any]:
        """Cancel an EVC visit with documented regulatory reason."""
        sched = db_manager.evc.get(evc_id)
        if not sched and db_manager.is_atlas_connected and db_manager.db is not None:
            sched = await db_manager.db.evc.find_one({"id": evc_id}, {"_id": 0})
        if not sched:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"EVC schedule '{evc_id}' not found.")

        now_str = time.strftime("%d %b %Y, %I:%M %p IST")
        sched["status"] = "Cancelled"
        sched["cancellationReason"] = reason
        sched["cancelledAt"] = now_str
        db_manager.evc[evc_id] = sched

        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.evc.update_one(
                {"id": evc_id},
                {"$set": {"status": "Cancelled", "cancellationReason": reason, "cancelledAt": now_str}}
            )

        return {
            "success": True,
            "evcId": evc_id,
            "status": "Cancelled",
            "message": f"EVC inspection cancelled. Reason: {reason}"
        }

    @classmethod
    async def submit_visit_report(
        cls,
        evc_id: str,
        findings_summary: str,
        recommended_for_approval: bool,
        actor: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Record completed EVC inspection findings and report.
        """
        sched = db_manager.evc.get(evc_id)
        if not sched and db_manager.is_atlas_connected and db_manager.db is not None:
            sched = await db_manager.db.evc.find_one({"id": evc_id}, {"_id": 0})
        if not sched:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"EVC schedule '{evc_id}' not found.")

        now_str = time.strftime("%d %b %Y, %I:%M %p IST")
        sched["status"] = "Completed"
        sched["reportSubmitted"] = True
        sched["reportSummary"] = findings_summary

        app_id = sched["applicationId"]
        app = db_manager.applications.get(app_id)
        if app:
            app["status"] = "evc_completed"
            audit_entry = {
                "id": f"log-{int(time.time())}",
                "title": "EVC Campus Inspection Report Submitted",
                "timestamp": now_str,
                "description": f"Panel convener {sched['panelConvener']} submitted inspection findings: {findings_summary}. Recommendation: {'Favorable' if recommended_for_approval else 'Deficiencies Noted'}.",
                "actor": f"{actor.get('name', 'EVC Convener')} ({actor.get('role', 'evc_member')})",
                "type": "action",
                "sha256": hashlib.sha256(f"{evc_id}:{findings_summary}".encode()).hexdigest()[:16].upper(),
                "applicationId": app_id
            }
            app.setdefault("auditLog", []).insert(0, audit_entry)

        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.evc.update_one({"id": evc_id}, {"$set": sched})

        return {"success": True, "message": "Inspection findings and report recorded durably."}
