from typing import Dict, Any, List, Optional
from datetime import datetime
from fastapi import HTTPException, status
from backend.database import db_manager

class PolicyService:
    @classmethod
    async def get_all_policies(cls) -> List[Dict[str, Any]]:
        """Retrieve all regulatory policy / APH handbook versions."""
        if db_manager.is_atlas_connected and db_manager.db is not None:
            policies = await db_manager.db.policies.find({}, {"_id": 0}).to_list(100)
            if policies:
                return policies
        return list(db_manager.policies.values())

    @classmethod
    async def get_active_policy(cls) -> Dict[str, Any]:
        """Get the current active statutory APH handbook policy."""
        policies = await cls.get_all_policies()
        for p in policies:
            if p.get("active", False):
                return p
        if policies:
            return policies[0]
        # Default handbook baseline
        return {
            "versionId": "APH-2026-27-v1.0",
            "title": "Approval Process Handbook (APH) 2026-2027",
            "effectiveDate": "2026-01-01",
            "scrutinyCeilingDays": 15,
            "graceNoticeMaxHours": 48,
            "formBCureWindowDays": 7,
            "changeSummary": "Enforcement of 15-day maximum statutory scrutiny ceiling and mandatory 30-year registered land deed verification per Chapter II Section 2.4.",
            "active": True
        }

    @classmethod
    async def create_or_update_policy(
        cls,
        version_id: str,
        title: str,
        effective_date: str,
        scrutiny_ceiling_days: int,
        grace_notice_max_hours: int,
        form_b_cure_window_days: int,
        change_summary: str,
        actor: Dict[str, Any]
    ) -> Dict[str, Any]:
        """
        Record a new policy handbook revision (Admin only).
        """
        if actor.get("role") not in ["super_admin", "aicte_admin"]:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: Only Central AICTE Administrators can configure APH regulatory policy versions."
            )

        policy_record = {
            "versionId": version_id,
            "title": title,
            "effectiveDate": effective_date,
            "scrutinyCeilingDays": scrutiny_ceiling_days,
            "graceNoticeMaxHours": grace_notice_max_hours,
            "formBCureWindowDays": form_b_cure_window_days,
            "changeSummary": change_summary,
            "updatedBy": actor.get("name", "AICTE Administrator"),
            "active": True
        }

        # Update in-memory
        db_manager.policies[version_id] = policy_record

        # Persist to Atlas
        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.policies.update_one(
                {"versionId": version_id},
                {"$set": policy_record},
                upsert=True
            )

        return policy_record

    @classmethod
    async def analyze_policy_impact(
        cls,
        new_scrutiny_ceiling_days: int,
        new_cure_window_days: int
    ) -> Dict[str, Any]:
        """
        Analyze which live applications would be impacted by tightening or changing SLA/scrutiny parameters.
        """
        apps = []
        if db_manager.is_atlas_connected and db_manager.db is not None:
            apps = await db_manager.db.applications.find({}, {"_id": 0}).to_list(500)
        else:
            apps = list(db_manager.applications.values())

        affected_apps = []
        for app in apps:
            if app.get("status") in ["approved", "rejected", "closed"]:
                continue
            days_expended = app.get("daysExpended", 0)
            
            # If current days expended would breach the new ceiling
            if days_expended > new_scrutiny_ceiling_days:
                affected_apps.append({
                    "applicationId": app["id"],
                    "institutionName": app["institutionName"],
                    "currentDaysExpended": days_expended,
                    "previousCeiling": app.get("statutoryCeiling", 15),
                    "newCeiling": new_scrutiny_ceiling_days,
                    "impactCategory": "Immediate Breach Escalation",
                    "reason": f"Under the proposed {new_scrutiny_ceiling_days}-day ceiling, this case is immediately in statutory violation (expended: {days_expended}d)."
                })
            elif days_expended >= (new_scrutiny_ceiling_days - 2):
                affected_apps.append({
                    "applicationId": app["id"],
                    "institutionName": app["institutionName"],
                    "currentDaysExpended": days_expended,
                    "previousCeiling": app.get("statutoryCeiling", 15),
                    "newCeiling": new_scrutiny_ceiling_days,
                    "impactCategory": "Due Soon Risk",
                    "reason": f"Within 48 hours of new ceiling cutoff."
                })

        return {
            "proposedScrutinyCeilingDays": new_scrutiny_ceiling_days,
            "proposedCureWindowDays": new_cure_window_days,
            "totalActiveApplicationsEvaluated": len([a for a in apps if a.get("status") not in ["approved", "rejected", "closed"]]),
            "impactedApplicationsCount": len(affected_apps),
            "affectedApplications": affected_apps,
            "recommendation": "Deploy with 30-day grace transition buffer for regional offices with pending scrutinies." if len(affected_apps) > 0 else "Low regulatory friction: No live cases violate proposed thresholds."
        }
