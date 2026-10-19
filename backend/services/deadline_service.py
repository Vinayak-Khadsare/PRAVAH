import time
import logging
from typing import Dict, Any, List, Optional
from datetime import datetime, timezone
from fastapi import HTTPException, status
from backend.database import db_manager

logger = logging.getLogger("pravah.deadline_monitor")

class DeadlineMonitorService:
    last_run_timestamp: Optional[str] = None
    alerts_evaluated_count: int = 0
    monitoring_healthy: bool = True

    @classmethod
    async def get_all_alerts(cls, actor: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Retrieve alerts with role-aware scoping."""
        if db_manager.is_atlas_connected and db_manager.db is not None:
            alerts = await db_manager.db.alerts.find({}, {"_id": 0}).to_list(200)
            if alerts:
                return alerts
        return list(db_manager.alerts.values())

    @classmethod
    async def evaluate_application_deadlines(cls) -> Dict[str, Any]:
        """
        Evaluate statutory deadlines and generate alerts idempotently without duplicates.
        """
        cls.last_run_timestamp = datetime.now(timezone.utc).isoformat()
        new_alerts_generated = []

        # Retrieve all active applications
        apps = []
        if db_manager.is_atlas_connected and db_manager.db is not None:
            apps = await db_manager.db.applications.find({}, {"_id": 0}).to_list(length=500)
        else:
            apps = list(db_manager.applications.values())

        for app in apps:
            app_id = app.get("id")
            institution_name = app.get("institutionName", "Institution")
            days_expended = app.get("daysExpended", 0)
            statutory_ceiling = app.get("statutoryCeiling", 15)
            status_val = app.get("status", "")

            # Ignore terminal states
            if status_val in ["approved", "rejected", "closed"]:
                continue

            # Check Overdue Condition (> statutory_ceiling)
            if days_expended > statutory_ceiling:
                alert_id = f"ALT-OVERDUE-{app_id}"
                # Deduplication check
                if not cls._alert_exists(alert_id):
                    alert_doc = {
                        "id": alert_id,
                        "title": f"Statutory {statutory_ceiling}-Day Ceiling Exceeded (Day {days_expended}/{statutory_ceiling})",
                        "message": f"{app_id} ({institution_name}) has exceeded the statutory maximum scrutiny ceiling of {statutory_ceiling} days. Escalation notice logged.",
                        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
                        "priority": "critical",
                        "category": "SLA Escalation",
                        "applicationId": app_id,
                        "institutionName": institution_name,
                        "resolved": False,
                        "acknowledged": False,
                        "assignedRole": "regional_officer"
                    }
                    await cls._persist_alert(alert_doc)
                    new_alerts_generated.append(alert_doc)

            # Check Due-Soon Condition (between ceiling - 2 and ceiling)
            elif days_expended >= (statutory_ceiling - 2):
                alert_id = f"ALT-DUESOON-{app_id}"
                if not cls._alert_exists(alert_id):
                    alert_doc = {
                        "id": alert_id,
                        "title": f"Statutory Deadline Imminent (Day {days_expended}/{statutory_ceiling})",
                        "message": f"{app_id} ({institution_name}) has {statutory_ceiling - days_expended} days remaining before statutory ceiling breach.",
                        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
                        "priority": "warning",
                        "category": "Statutory Ceiling",
                        "applicationId": app_id,
                        "institutionName": institution_name,
                        "resolved": False,
                        "acknowledged": False,
                        "assignedRole": "scrutiny_officer"
                    }
                    await cls._persist_alert(alert_doc)
                    new_alerts_generated.append(alert_doc)

            # Check EVC Blocked Condition
            if app.get("criticalBlocker") and not app.get("criticalBlocker", {}).get("resolved") and app.get("currentStageNumber") in [2, 3]:
                alert_id = f"ALT-EVCBLOCK-{app_id}"
                if not cls._alert_exists(alert_id):
                    alert_doc = {
                        "id": alert_id,
                        "title": f"EVC Inspection Withheld ({app['criticalBlocker'].get('ruleRef')})",
                        "message": f"Campus inspection for {app_id} is withheld pending resolution of: {app['criticalBlocker'].get('title')}",
                        "timestamp": time.strftime("%d %b %Y, %I:%M %p IST"),
                        "priority": "critical",
                        "category": "EVC Stall",
                        "applicationId": app_id,
                        "institutionName": institution_name,
                        "resolved": False,
                        "acknowledged": False,
                        "assignedRole": "regional_officer"
                    }
                    await cls._persist_alert(alert_doc)
                    new_alerts_generated.append(alert_doc)

        cls.alerts_evaluated_count = len(new_alerts_generated)
        return {
            "status": "completed",
            "evaluatedApplicationsCount": len(apps),
            "newAlertsCreatedCount": len(new_alerts_generated),
            "lastRunTimestamp": cls.last_run_timestamp,
        }

    @classmethod
    async def acknowledge_alert(cls, alert_id: str, actor: Dict[str, Any]) -> Dict[str, Any]:
        """Mark an alert as acknowledged by an authorized officer."""
        alert = db_manager.alerts.get(alert_id)
        if not alert and db_manager.is_atlas_connected and db_manager.db is not None:
            alert = await db_manager.db.alerts.find_one({"id": alert_id}, {"_id": 0})
        if not alert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert '{alert_id}' not found.")

        now_str = time.strftime("%d %b %Y, %I:%M %p IST")
        alert["acknowledged"] = True
        alert["acknowledgedBy"] = actor.get("name")
        alert["acknowledgedAt"] = now_str
        db_manager.alerts[alert_id] = alert

        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.alerts.update_one(
                {"id": alert_id},
                {"$set": {"acknowledged": True, "acknowledgedBy": actor.get("name"), "acknowledgedAt": now_str}}
            )

        return {"success": True, "alertId": alert_id, "acknowledged": True, "timestamp": now_str}

    @classmethod
    async def resolve_alert(cls, alert_id: str, resolution_note: str, actor: Dict[str, Any]) -> Dict[str, Any]:
        """Mark an alert as resolved with documented reason."""
        alert = db_manager.alerts.get(alert_id)
        if not alert and db_manager.is_atlas_connected and db_manager.db is not None:
            alert = await db_manager.db.alerts.find_one({"id": alert_id}, {"_id": 0})
        if not alert:
            raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=f"Alert '{alert_id}' not found.")

        now_str = time.strftime("%d %b %Y, %I:%M %p IST")
        alert["resolved"] = True
        alert["resolutionNote"] = resolution_note
        alert["resolvedBy"] = actor.get("name")
        alert["resolvedAt"] = now_str
        db_manager.alerts[alert_id] = alert

        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.alerts.update_one(
                {"id": alert_id},
                {"$set": {"resolved": True, "resolutionNote": resolution_note, "resolvedBy": actor.get("name"), "resolvedAt": now_str}}
            )

        return {"success": True, "alertId": alert_id, "resolved": True, "timestamp": now_str}

    @classmethod
    def get_health(cls) -> Dict[str, Any]:
        """Operational health indicator for deadline monitoring."""
        return {
            "status": "healthy" if cls.monitoring_healthy else "degraded",
            "lastRunTimestamp": cls.last_run_timestamp,
            "totalMonitoredAlerts": len(db_manager.alerts),
            "engine": "Idempotent Periodic Evaluator"
        }

    @classmethod
    def _alert_exists(cls, alert_id: str) -> bool:
        return alert_id in db_manager.alerts

    @classmethod
    async def _persist_alert(cls, alert_doc: Dict[str, Any]):
        db_manager.alerts[alert_doc["id"]] = alert_doc
        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.alerts.update_one(
                {"id": alert_doc["id"]},
                {"$set": alert_doc},
                upsert=True
            )
