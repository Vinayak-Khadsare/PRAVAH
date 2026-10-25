import os
from pathlib import Path
from typing import List
from dotenv import load_dotenv

# Search for .env in current working dir, backend directory, or project root
_search_paths = [
    Path.cwd() / ".env",
    Path(__file__).resolve().parent / ".env",
    Path(__file__).resolve().parent.parent / ".env"
]
for p in _search_paths:
    if p.exists():
        load_dotenv(p, override=True)
        break
else:
    load_dotenv(override=True)

class Settings:
    PROJECT_NAME: str = "PRAVAH AICTE Approval Operations Platform"
    VERSION: str = "2.5.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development").lower()
    HOST: str = os.getenv("HOST", "127.0.0.1")
    PORT: int = int(os.getenv("PORT", "8000"))
    
    # MongoDB Connection URI (Defaults to local MongoDB instance on port 27017)
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/pravah_aicte_db")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "pravah_aicte_db")
    
    # JWT and Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "pravah-aicte-secure-key-2026-production-token-sih-eval")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    # Upload storage directory (resolve cross-platform path)
    _default_upload = Path(__file__).resolve().parent / "uploads"
    UPLOAD_DIR: Path = Path(os.getenv("UPLOAD_DIR", str(_default_upload))).resolve()
    MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(25 * 1024 * 1024))) # 25MB
    
    # Automated Monitoring Scheduler
    ENABLE_DEADLINE_SCHEDULER: bool = os.getenv("ENABLE_DEADLINE_SCHEDULER", "true").lower() == "true"
    DEADLINE_CHECK_INTERVAL_SECONDS: int = int(os.getenv("DEADLINE_CHECK_INTERVAL_SECONDS", "60"))
    
    # QA & E2E Automated Testing Fixtures (strictly disabled by default)
    ENABLE_TEST_FIXTURES: bool = os.getenv("PRAVAH_ENABLE_TEST_FIXTURES", "false").lower() in ("true", "1", "yes")
    QA_TEST_EMAIL: str = os.getenv("QA_TEST_EMAIL", "pravah.qa@example.test")
    QA_TEST_NAME: str = os.getenv("QA_TEST_NAME", "PRAVAH QA Test User")
    QA_TEST_PASSWORD: str = os.getenv("QA_TEST_PASSWORD", "QaTestingPassword@2026")
    QA_TEST_ROLE: str = os.getenv("QA_TEST_ROLE", "institution_rep")
    QA_TEST_PID: str = os.getenv("QA_TEST_PID", "1-4392811")
    QA_TEST_INSTITUTION: str = os.getenv("QA_TEST_INSTITUTION", "Dronacharya Institute of Engineering & Technology")
    QA_TEST_REGIONAL_OFFICE: str = os.getenv("QA_TEST_REGIONAL_OFFICE", "Northern Regional Office (NRO) - Kanpur")
    
    # CORS Origins (parses comma-separated env var or falls back to safe local & container origins)
    @property
    def CORS_ORIGINS(self) -> List[str]:
        raw = os.getenv("CORS_ORIGINS", "").strip()
        if raw:
            return [origin.strip() for origin in raw.split(",") if origin.strip()]
        return [
            "http://localhost:3000",
            "http://127.0.0.1:3000",
            "http://localhost:8000",
            "http://127.0.0.1:8000",
            "http://frontend:3000",
            "http://backend:8000",
        ]

settings = Settings()

# Enforce strong environment-provided secret in production
if settings.ENVIRONMENT == "production":
    raw_secret = os.getenv("JWT_SECRET")
    if not raw_secret or raw_secret == "pravah-aicte-secure-key-2026-production-token-sih-eval" or len(raw_secret) < 32:
        raise ValueError("Production deployment requires a strong, environment-provided JWT_SECRET (minimum 32 characters).")

# Ensure uploads directory exists
settings.UPLOAD_DIR.mkdir(parents=True, exist_ok=True)

# In test or development environments, permit RFC 2606 reserved test domains (.test, .example)
if settings.ENVIRONMENT != "production":
    try:
        import email_validator
        email_validator.TEST_ENVIRONMENT = True
    except ImportError:
        pass
