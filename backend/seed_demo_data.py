"""
PRAVAH — Idempotent Demo Data Initialisation Script
Usage:
    python -m backend.seed_demo_data

This script safely and idempotently seeds initial demonstration records
(Users, Applications, EVC schedules, Compliance items, Alerts, Policies)
into MongoDB without creating duplicates or overwriting existing user data.
"""

import sys
import asyncio
import logging
from backend.config import settings
from backend.database import db_manager

logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")
logger = logging.getLogger("pravah.seed")

async def main():
    logger.info("Initializing PRAVAH Demo Data Seed Check...")
    logger.info(f"Target Database: {settings.DATABASE_NAME}")
    logger.info(f"Environment: {settings.ENVIRONMENT}")

    await db_manager.connect()

    if not db_manager.is_atlas_connected:
        logger.warning("MongoDB is not connected. In-memory demo data was initialized in memory only.")
        logger.info("To persist records, ensure a local or Atlas MongoDB instance is running.")
        return 0

    logger.info("Connected to MongoDB. Running idempotent verification and seed...")
    await db_manager._create_indexes()
    await db_manager._seed_atlas()

    user_count = await db_manager.db.users.count_documents({})
    app_count = await db_manager.db.applications.count_documents({})
    evc_count = await db_manager.db.evc.count_documents({})
    alert_count = await db_manager.db.alerts.count_documents({})

    logger.info("=" * 60)
    logger.info("PRAVAH Database Status Summary:")
    logger.info(f"  • Registered Users:     {user_count}")
    logger.info(f"  • Active Applications:  {app_count}")
    logger.info(f"  • EVC Schedules:        {evc_count}")
    logger.info(f"  • Active Alerts:        {alert_count}")
    logger.info("=" * 60)
    logger.info("Seed verification completed successfully. Safe to rerun at any time.")
    await db_manager.disconnect()
    return 0

if __name__ == "__main__":
    try:
        sys.exit(asyncio.run(main()))
    except Exception as e:
        logger.error(f"Seed script error: {e}")
        sys.exit(1)
