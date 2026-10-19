import logging
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings
from backend.mock_data import INITIAL_APPLICATIONS, INITIAL_EVC, INITIAL_COMPLIANCE, INITIAL_ALERTS

logger = logging.getLogger("pravah.database")

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_atlas_connected: bool = False
    
    # In-memory storage fallback for local demonstration
    memory_apps: List[Dict[str, Any]] = []
    memory_evc: List[Dict[str, Any]] = []
    memory_compliance: List[Dict[str, Any]] = []
    memory_alerts: List[Dict[str, Any]] = []

    async def connect(self):
        # Initialize memory store regardless as reliable fallback
        self.memory_apps = [dict(a) for a in INITIAL_APPLICATIONS]
        self.memory_evc = [dict(e) for e in INITIAL_EVC]
        self.memory_compliance = [dict(c) for c in INITIAL_COMPLIANCE]
        self.memory_alerts = [dict(al) for al in INITIAL_ALERTS]

        if settings.MONGODB_URI and not settings.MONGODB_URI.startswith("mongodb+srv://<username>"):
            try:
                logger.info("Connecting to MongoDB Atlas cluster...")
                self.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
                # verify connection ping
                await self.client.admin.command('ping')
                self.db = self.client[settings.DATABASE_NAME]
                self.is_atlas_connected = True
                logger.info(f"Connected to MongoDB Atlas: {settings.DATABASE_NAME}")

                # Seed initial applications if collection is empty
                count = await self.db.applications.count_documents({})
                if count == 0:
                    logger.info("Seeding initial applications into MongoDB Atlas...")
                    await self.db.applications.insert_many(INITIAL_APPLICATIONS)
                    await self.db.evc.insert_many(INITIAL_EVC)
                    await self.db.compliance.insert_many(INITIAL_COMPLIANCE)
                    await self.db.alerts.insert_many(INITIAL_ALERTS)
            except Exception as e:
                logger.warning(f"MongoDB Atlas connection unavailable ({e}). Running in demonstration memory mode.")
                self.is_atlas_connected = False
        else:
            logger.info("No MongoDB Atlas URI provided. Running in persistent demonstration memory mode.")
            self.is_atlas_connected = False

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB Atlas connection.")

db_manager = DatabaseManager()
