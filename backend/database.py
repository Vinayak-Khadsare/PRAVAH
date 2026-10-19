import logging
import copy
from typing import Optional, List, Dict, Any
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from backend.config import settings
from backend.security import hash_password
from backend.mock_data import INITIAL_APPLICATIONS, INITIAL_EVC, INITIAL_COMPLIANCE, INITIAL_ALERTS

logger = logging.getLogger("pravah.database")

# Initial seeded users with secure bcrypt hashes
INITIAL_USERS = [
    {
        "userId": "usr-ro-01",
        "email": "r.srivastava@aicte-india.org",
        "passwordHash": hash_password("Password@123"),
        "name": "Dr. R. K. Srivastava",
        "role": "regional_officer",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "initials": "RS",
        "institutionPid": None,
        "active": True,
        "createdAt": "2026-02-01T10:00:00Z"
    },
    {
        "userId": "usr-so-01",
        "email": "p.verma@aicte-india.org",
        "passwordHash": hash_password("Password@123"),
        "name": "Dr. P. K. Verma",
        "role": "scrutiny_officer",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "initials": "PV",
        "institutionPid": None,
        "active": True,
        "createdAt": "2026-02-01T10:00:00Z"
    },
    {
        "userId": "usr-inst-01",
        "email": "admin@dronacharya-engg.ac.in",
        "passwordHash": hash_password("Password@123"),
        "name": "Dr. Arvind Sharma",
        "role": "institution_rep",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "initials": "AS",
        "institutionPid": "1-4392811",
        "active": True,
        "createdAt": "2026-02-10T09:00:00Z"
    },
    {
        "userId": "usr-admin-01",
        "email": "admin@aicte-india.org",
        "passwordHash": hash_password("AdminPassword@123"),
        "name": "Central AICTE Administrator",
        "role": "aicte_admin",
        "regionalOffice": "Central Bureau / Member Secretary Desk",
        "initials": "AD",
        "institutionPid": None,
        "active": True,
        "createdAt": "2026-01-15T09:00:00Z"
    },
    {
        "userId": "usr-evc-01",
        "email": "s.sen@iitr.ac.in",
        "passwordHash": hash_password("Password@123"),
        "name": "Prof. S. Sen",
        "role": "evc_member",
        "regionalOffice": "Northern Regional Office (NRO) - Kanpur",
        "initials": "SS",
        "institutionPid": None,
        "active": True,
        "createdAt": "2026-02-15T12:00:00Z"
    },
    {
        "userId": "usr-auditor-01",
        "email": "auditor@aicte-india.org",
        "passwordHash": hash_password("AuditorPassword@123"),
        "name": "CAG Regulatory Auditor",
        "role": "auditor",
        "regionalOffice": "Central Bureau / Member Secretary Desk",
        "initials": "AU",
        "institutionPid": None,
        "active": True,
        "createdAt": "2026-02-01T10:00:00Z"
    }
]

INITIAL_POLICIES = [
    {
        "versionId": "APH-2026-27-v1.0",
        "title": "Approval Process Handbook (APH) 2026-2027",
        "effectiveDate": "2026-01-01",
        "scrutinyCeilingDays": 15,
        "graceNoticeMaxHours": 48,
        "formBCureWindowDays": 7,
        "changeSummary": "Enforcement of 15-day maximum statutory scrutiny ceiling and mandatory 30-year registered land deed verification per Chapter II Section 2.4.",
        "active": True
    }
]

class DatabaseManager:
    client: Optional[AsyncIOMotorClient] = None
    db: Optional[AsyncIOMotorDatabase] = None
    is_atlas_connected: bool = False
    
    # In-memory storage for demonstration / local fallback mode
    # Deep copied on startup
    users: Dict[str, Dict[str, Any]] = {}
    applications: Dict[str, Dict[str, Any]] = {}
    evc: Dict[str, Dict[str, Any]] = {}
    compliance: Dict[str, Dict[str, Any]] = {}
    alerts: Dict[str, Dict[str, Any]] = {}
    audit_events: List[Dict[str, Any]] = []
    documents: Dict[str, Dict[str, Any]] = {}
    policies: Dict[str, Dict[str, Any]] = {}

    @property
    def memory_apps(self) -> List[Dict[str, Any]]:
        return list(self.applications.values())

    @property
    def memory_evc(self) -> List[Dict[str, Any]]:
        return list(self.evc.values())

    @property
    def memory_compliance(self) -> List[Dict[str, Any]]:
        return list(self.compliance.values())

    @property
    def memory_alerts(self) -> List[Dict[str, Any]]:
        return list(self.alerts.values())

    async def connect(self):
        """Establish MongoDB Atlas connection or initialize persistent demo store."""
        # Initialize in-memory repository with deepcopy
        self._init_memory_store()

        if settings.MONGODB_URI and not settings.MONGODB_URI.startswith("mongodb+srv://<username>"):
            try:
                logger.info("Connecting to MongoDB Atlas cluster...")
                self.client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=3000)
                await self.client.admin.command('ping')
                self.db = self.client[settings.DATABASE_NAME]
                self.is_atlas_connected = True
                logger.info(f"Connected to MongoDB Atlas: {settings.DATABASE_NAME}")

                # Ensure indexes and seed initial records idempotently
                await self._create_indexes()
                await self._seed_atlas()
            except Exception as e:
                logger.warning(f"MongoDB Atlas connection failed ({e}). Operating in explicit local fallback mode.")
                self.is_atlas_connected = False
        else:
            logger.info("No active MongoDB Atlas URI provided. Running in explicit local demonstration persistence mode.")
            self.is_atlas_connected = False

    def _init_memory_store(self):
        """Populate memory store with deep copies of initial data."""
        self.users = {u["email"]: copy.deepcopy(u) for u in INITIAL_USERS}
        self.applications = {a["id"]: copy.deepcopy(a) for a in INITIAL_APPLICATIONS}
        self.evc = {e["id"]: copy.deepcopy(e) for e in INITIAL_EVC}
        self.compliance = {c["id"]: copy.deepcopy(c) for c in INITIAL_COMPLIANCE}
        self.alerts = {al["id"]: copy.deepcopy(al) for al in INITIAL_ALERTS}
        self.policies = {p["versionId"]: copy.deepcopy(p) for p in INITIAL_POLICIES}
        
        self.audit_events = []
        for app in self.applications.values():
            for log in app.get("auditLog", []):
                self.audit_events.append({**log, "applicationId": app["id"]})
                
        self.documents = {}
        for app in self.applications.values():
            for doc in app.get("documents", []):
                self.documents[doc["id"]] = {**doc, "applicationId": app["id"], "institution": app["institutionName"]}

    async def _create_indexes(self):
        """Create database indexes idempotently on MongoDB Atlas."""
        if not self.db:
            return
        try:
            await self.db.users.create_index("email", unique=True)
            await self.db.applications.create_index("id", unique=True)
            await self.db.applications.create_index("pid")
            await self.db.applications.create_index("status")
            await self.db.applications.create_index("regionalOffice")
            await self.db.evc.create_index("id", unique=True)
            await self.db.evc.create_index("applicationId")
            await self.db.compliance.create_index("id", unique=True)
            await self.db.compliance.create_index("applicationId")
            await self.db.alerts.create_index("id", unique=True)
            await self.db.alerts.create_index("applicationId")
            await self.db.audit_events.create_index("id", unique=True)
            await self.db.audit_events.create_index("timestamp")
            logger.info("MongoDB Atlas indexes verified/created successfully.")
        except Exception as e:
            logger.warning(f"Error creating indexes: {e}")

    async def _seed_atlas(self):
        """Idempotently seed initial documents if collections are empty."""
        if not self.db:
            return
        try:
            if await self.db.users.count_documents({}) == 0:
                await self.db.users.insert_many(INITIAL_USERS)
            if await self.db.applications.count_documents({}) == 0:
                await self.db.applications.insert_many(INITIAL_APPLICATIONS)
            if await self.db.evc.count_documents({}) == 0:
                await self.db.evc.insert_many(INITIAL_EVC)
            if await self.db.compliance.count_documents({}) == 0:
                await self.db.compliance.insert_many(INITIAL_COMPLIANCE)
            if await self.db.alerts.count_documents({}) == 0:
                await self.db.alerts.insert_many(INITIAL_ALERTS)
            if await self.db.policies.count_documents({}) == 0:
                await self.db.policies.insert_many(INITIAL_POLICIES)
            logger.info("MongoDB Atlas initial seed check complete.")
        except Exception as e:
            logger.warning(f"Error seeding MongoDB Atlas: {e}")

    async def disconnect(self):
        if self.client:
            self.client.close()
            logger.info("Closed MongoDB Atlas connection.")

db_manager = DatabaseManager()
