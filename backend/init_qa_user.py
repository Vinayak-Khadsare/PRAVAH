"""
PRAVAH — Dedicated QA Test User & Deterministic Test Fixture Initialisation
Usage:
    python -m backend.init_qa_user

Safeguards:
    - Strictly blocked in production (ENVIRONMENT=production).
    - Requires PRAVAH_ENABLE_TEST_FIXTURES=true (or explicit CLI override in non-prod).
    - Fails closed if target database is identified as production.
    - Idempotent: reuses existing QA user without overwriting or duplicating.
"""

import os
import sys
import asyncio
import logging
from typing import Dict, Any, Optional

from backend.config import settings
from backend.security import hash_password
from backend.database import db_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pravah.qa_fixture")

QA_USER_ID = "usr-qa-test-01"

async def initialize_qa_account(force: bool = False) -> Dict[str, Any]:
    """
    Idempotently initialize or verify the dedicated QA test account.
    Returns summary dictionary with user status and details.
    """
    # 1. Environment Safeguards
    if settings.ENVIRONMENT == "production":
        logger.error("FATAL: Attempted to initialize QA test fixtures in PRODUCTION environment!")
        raise PermissionError("QA test fixtures are strictly forbidden in production environment.")

    if not settings.ENABLE_TEST_FIXTURES and not force:
        logger.warning(
            "Test fixtures are disabled by default. "
            "Set PRAVAH_ENABLE_TEST_FIXTURES=true or pass --force in non-production environments."
        )
        raise RuntimeError("PRAVAH_ENABLE_TEST_FIXTURES must be enabled to provision test accounts.")

    # 2. Database Target Verification
    db_name = (settings.DATABASE_NAME or "").lower()
    if "prod" in db_name or "production" in db_name:
        logger.error(f"FATAL: Target database '{settings.DATABASE_NAME}' appears to be production. Aborting.")
        raise PermissionError("Cannot initialize test fixtures against a production-named database.")

    # 3. Connect to Database / In-Memory Store
    await db_manager.connect()

    qa_email = settings.QA_TEST_EMAIL.lower().strip()
    qa_role = settings.QA_TEST_ROLE.strip()
    qa_pid = settings.QA_TEST_PID.strip()
    qa_inst = settings.QA_TEST_INSTITUTION.strip()
    qa_name = settings.QA_TEST_NAME.strip()
    qa_office = settings.QA_TEST_REGIONAL_OFFICE.strip()

    # 4. Check if QA User Already Exists
    existing_user: Optional[Dict[str, Any]] = None
    if db_manager.is_atlas_connected and db_manager.db is not None:
        existing_user = await db_manager.db.users.find_one({"email": qa_email}, {"passwordHash": 0})
    else:
        mem_user = db_manager.users.get(qa_email)
        if mem_user:
            existing_user = {k: v for k, v in mem_user.items() if k != "passwordHash"}

    if existing_user:
        logger.info(f"Existing QA test account '{qa_email}' confirmed (ID: {existing_user.get('userId')}).")
        logger.info("Account is persistent and ready for testing. Preserving existing record.")
        user_status = "reused"
    else:
        # 5. Create Deterministic QA User
        logger.info(f"Creating new persistent QA test account: '{qa_email}' ({qa_role})...")
        pw_hash = hash_password(settings.QA_TEST_PASSWORD)
        user_doc = {
            "userId": QA_USER_ID,
            "email": qa_email,
            "passwordHash": pw_hash,
            "name": qa_name,
            "role": qa_role,
            "regionalOffice": qa_office,
            "initials": "QA",
            "institutionPid": qa_pid,
            "institutionName": qa_inst,
            "active": True,
            "verificationStatus": "verified",
            "createdAt": "2026-01-01T00:00:00Z"
        }

        if db_manager.is_atlas_connected and db_manager.db is not None:
            await db_manager.db.users.insert_one(user_doc)
        db_manager.users[qa_email] = user_doc
        logger.info(f"QA test account successfully provisioned with ID '{QA_USER_ID}'.")
        user_status = "created"

    # 6. Ensure Deterministic Test Application Exists for QA User
    await _ensure_qa_test_application(qa_pid, qa_inst, qa_office)

    result = {
        "status": user_status,
        "userId": QA_USER_ID,
        "email": qa_email,
        "role": qa_role,
        "institutionPid": qa_pid,
        "institutionName": qa_inst,
        "regionalOffice": qa_office,
        "database": {
            "connected": db_manager.is_atlas_connected,
            "name": settings.DATABASE_NAME
        }
    }
    return result

async def _ensure_qa_test_application(pid: str, inst_name: str, office: str):
    """
    Idempotently ensure a dedicated test application record exists for the QA test PID.
    """
    app_id = f"APP-QA-{pid.replace('-', '')}"

    app_exists = False
    if db_manager.is_atlas_connected and db_manager.db is not None:
        app_exists = (await db_manager.db.applications.find_one({"id": app_id})) is not None
    else:
        app_exists = app_id in db_manager.applications

    if app_exists:
        return

    qa_app = {
        "id": app_id,
        "pid": pid,
        "institutionName": inst_name,
        "address": "Plot 42-B, Knowledge Park III, Greater Noida",
        "city": "Greater Noida",
        "state": "Uttar Pradesh",
        "pin": "201310",
        "regionalOffice": office,
        "geoTag": "28.4744° N, 77.4912° E",
        "applicationType": "New Technical Inst.",
        "programDetails": "UG Engg (4 Progs / 360 Seats)",
        "academicSession": "AY 2026-2027",
        "currentStageNumber": 2,
        "currentStageLabel": "Stage 02 (Scrutiny Desk & Document Audit)",
        "status": "in_scrutiny",
        "slaStatus": "compliant",
        "daysExpended": 5,
        "statutoryCeiling": 15,
        "overdueText": "SLA Compliant (10d Remaining)",
        "assignedOfficer": {
            "name": "Dr. P. K. Verma",
            "role": "Senior Scrutiny Officer",
            "authId": "NRO-092"
        },
        "institutionProfile": {
            "managingSociety": "PRAVAH QA Society",
            "societyRegNo": "QA/2026/001",
            "principalDesignate": "Dr. QA Principal",
            "officialEmail": settings.QA_TEST_EMAIL,
            "campusPhone": "+91 120 2329800",
            "affiliatingUniversity": "AKTU (Proposed)"
        },
        "deficiencies": [
            {
                "id": "def-qa-01",
                "orderNum": "01",
                "title": "30-Year Registered Land Lease Deed",
                "isCritical": True,
                "refCode": "REF: LD-2026-QA-01",
                "status": "deficient",
                "requirement": "Registered 30-year lease deed with Sub-Registrar seal.",
                "officerName": "Dr. P. K. Verma",
                "officerRole": "Senior Scrutiny Officer",
                "officerComment": "Seal verification pending.",
                "officerDate": "15 Feb 2026, 10:00 AM"
            }
        ],
        "undertakings": [],
        "documents": [],
        "auditLog": [
            {
                "id": f"log-qa-init",
                "title": "Application Registered for QA Testing",
                "timestamp": "01 Jan 2026, 10:00 AM IST",
                "description": "Deterministic test application initialised for automated E2E testing.",
                "actor": "System QA Fixture",
                "type": "system"
            }
        ]
    }

    if db_manager.is_atlas_connected and db_manager.db is not None:
        await db_manager.db.applications.insert_one(qa_app)
    db_manager.applications[app_id] = qa_app
    logger.info(f"Deterministic QA test application '{app_id}' initialised.")

async def main():
    force_flag = "--force" in sys.argv or "-f" in sys.argv
    try:
        summary = await initialize_qa_account(force=force_flag)
        logger.info("=" * 60)
        logger.info("PRAVAH QA Account Initialisation Summary:")
        logger.info(f"  • Status:            {summary['status'].upper()}")
        logger.info(f"  • User ID:           {summary['userId']}")
        logger.info(f"  • Email:             {summary['email']}")
        logger.info(f"  • Role:              {summary['role']}")
        logger.info(f"  • Institution PID:   {summary['institutionPid']}")
        logger.info(f"  • Database Mode:     {'MongoDB' if summary['database']['connected'] else 'In-Memory Store'}")
        logger.info("=" * 60)
        logger.info("Initialisation complete. Test runner can now authenticate with this account.")
        await db_manager.disconnect()
        return 0
    except Exception as e:
        logger.error(f"Failed to initialise QA test account: {e}")
        await db_manager.disconnect()
        return 1

if __name__ == "__main__":
    sys.exit(asyncio.run(main()))
