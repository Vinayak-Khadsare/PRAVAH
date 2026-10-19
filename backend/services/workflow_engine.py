import time
import hashlib
from typing import Dict, Any, List, Optional, Tuple
from fastapi import HTTPException, status
from backend.database import db_manager

class WorkflowEngine:
    # Allowed transitions map: current_stage -> list of valid target_stages
    TRANSITION_RULES: Dict[int, List[int]] = {
        1: [2],        # Intake Submission -> Scrutiny Committee
        2: [3, 4],     # Scrutiny -> Re-Scrutiny (if deficient) OR EVC (if clean)
        3: [2, 4, 5],  # Re-Scrutiny -> Scrutiny, EVC (if rectified) OR SAC Hearing (if escalated)
        4: [5, 6],     # EVC -> SAC Hearing (if appeal required) OR Decision/LoA (if recommended)
        5: [4, 6],     # SAC Hearing -> Repeat EVC OR Final Decision/LoA
        6: [],         # Final Decision (Terminal state)
    }

    STAGE_LABELS: Dict[int, str] = {
        1: "Stage 01 (Intake Submission)",
        2: "Stage 02 (Preliminary Scrutiny)",
        3: "Stage 03 (Re-Scrutiny & Cure)",
        4: "Stage 04 (EVC Inspection)",
        5: "Stage 05 (Standing Hearing / SAC)",
        6: "Stage 06 (Final Decision / LoA)",
    }

    # Role permissions required to initiate specific transitions
    STAGE_ROLE_PERMISSIONS: Dict[int, List[str]] = {
        2: ["regional_officer", "scrutiny_officer", "aicte_admin", "super_admin"],
        3: ["regional_officer", "scrutiny_officer", "aicte_admin", "super_admin"],
        4: ["regional_officer", "scrutiny_officer", "aicte_admin", "super_admin"],
        5: ["regional_officer", "committee_member", "aicte_admin", "super_admin"],
        6: ["committee_member", "aicte_admin", "super_admin"],
    }

    @classmethod
    def check_prerequisites(cls, application: Dict[str, Any], target_stage: int) -> Tuple[bool, Optional[str]]:
        """
        Verify mandatory regulatory prerequisites before permitting state transition.
        """
        # Transition to Stage 04 (EVC) requires that no critical deficiencies are active
        if target_stage == 4:
            deficiencies = application.get("deficiencies", [])
            for d in deficiencies:
                if d.get("isCritical") and d.get("status") == "deficient":
                    return False, f"Prerequisite Blocked: Critical deficiency '{d.get('title')}' ({d.get('refCode')}) must be rectified before EVC scheduling."
            if application.get("criticalBlocker"):
                return False, f"Prerequisite Blocked: Unresolved regulatory blocker: {application['criticalBlocker'].get('title')}."

        # Transition to Stage 06 (Final Decision) requires that either an EVC report was submitted or SAC clearance was granted
        if target_stage == 6:
            current_stage = application.get("currentStageNumber", 1)
            if current_stage not in [4, 5]:
                return False, "Prerequisite Blocked: LoA decision requires completed EVC or SAC committee outcome."
                
        return True, None

    @classmethod
    async def execute_transition(
        cls,
        application: Dict[str, Any],
        target_stage: int,
        reason: str,
        actor: Dict[str, Any],
        evidence_details: Optional[str] = None
    ) -> Dict[str, Any]:
        """
        Execute an atomic state transition with validation, permission checks, and audit logging.
        """
        app_id = application["id"]
        current_stage = application.get("currentStageNumber", 1)
        actor_role = actor.get("role", "")
        actor_name = actor.get("name", "Unknown Official")

        # 1. Verify transition is allowed in the state machine
        allowed_targets = cls.TRANSITION_RULES.get(current_stage, [])
        if target_stage not in allowed_targets:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Illegal statutory transition: Cannot advance directly from Stage 0{current_stage} to Stage 0{target_stage}.",
            )

        # 2. Verify actor possesses statutory authority for this target stage
        required_roles = cls.STAGE_ROLE_PERMISSIONS.get(target_stage, [])
        if actor_role != "super_admin" and actor_role not in required_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Unauthorized: Role '{actor_role}' does not have authority to move application to Stage 0{target_stage}.",
            )

        # 3. Verify statutory prerequisites
        passed, error_msg = cls.check_prerequisites(application, target_stage)
        if not passed:
            raise HTTPException(
                status_code=status.HTTP_409_CONFLICT,
                detail=error_msg,
            )

        # 4. Determine resulting status enum
        new_status = "in_scrutiny"
        if target_stage == 3:
            new_status = "re_scrutiny"
        elif target_stage == 4:
            new_status = "evc_scheduled"
        elif target_stage == 5:
            new_status = "sac_escalated"
        elif target_stage == 6:
            new_status = "approved" if "approv" in reason.lower() else "rejected"

        # 5. Create cryptographic audit seal
        timestamp = time.strftime("%d %b %Y, %I:%M %p IST")
        prior_hash = "GENESIS_SEAL_NRO_00"
        if application.get("auditLog"):
            prior_hash = application["auditLog"][0].get("sha256", prior_hash)
            
        hasher = hashlib.sha256()
        hasher.update(f"{prior_hash}:{app_id}:{current_stage}:{target_stage}:{timestamp}:{actor_name}:{reason}".encode("utf-8"))
        seal_hash = hasher.hexdigest()[:16].upper()

        audit_entry = {
            "id": f"log-{int(time.time())}",
            "title": f"Statutory Transition: Advanced to Stage 0{target_stage}",
            "timestamp": timestamp,
            "description": f"Application transitioned from Stage 0{current_stage} to Stage 0{target_stage} ({cls.STAGE_LABELS[target_stage]}). Statutory reasoning: {reason}",
            "actor": f"{actor_name} ({actor_role})",
            "type": "decision" if target_stage == 6 else "action",
            "sha256": seal_hash,
            "previousHash": prior_hash,
            "applicationId": app_id
        }

        # 6. Apply updates to the application dictionary
        application["currentStageNumber"] = target_stage
        application["currentStageLabel"] = cls.STAGE_LABELS[target_stage]
        application["status"] = new_status
        application["lastRegistryEvent"] = f"{timestamp} by {actor_name}"
        application.setdefault("auditLog", []).insert(0, audit_entry)

        # 7. Persist to MongoDB Atlas if connected
        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.applications.update_one(
                {"id": app_id},
                {
                    "$set": {
                        "currentStageNumber": target_stage,
                        "currentStageLabel": cls.STAGE_LABELS[target_stage],
                        "status": new_status,
                        "lastRegistryEvent": application["lastRegistryEvent"],
                    },
                    "$push": {
                        "auditLog": {
                            "$each": [audit_entry],
                            "$position": 0
                        }
                    }
                }
            )
            # Record transition log in dedicated collection
            await db_manager.db.workflow_transitions.insert_one({
                "applicationId": app_id,
                "fromStage": current_stage,
                "toStage": target_stage,
                "reason": reason,
                "evidenceDetails": evidence_details,
                "actor": actor_name,
                "actorRole": actor_role,
                "timestamp": timestamp,
                "sha256": seal_hash
            })

        # Update in-memory collections
        db_manager.applications[app_id] = application
        db_manager.audit_events.insert(0, audit_entry)

        return {
            "success": True,
            "applicationId": app_id,
            "previousStage": current_stage,
            "newStage": target_stage,
            "newStatus": new_status,
            "auditEvent": audit_entry
        }
