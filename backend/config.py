import os
from pathlib import Path
from dotenv import load_dotenv

# Search for .env in current working dir, backend directory, or project root
for p in [Path.cwd() / ".env", Path(__file__).resolve().parent / ".env", Path(__file__).resolve().parent.parent / ".env"]:
    if p.exists():
        load_dotenv(p, override=True)
        break
else:
    load_dotenv(override=True)

class Settings:
    PROJECT_NAME: str = "PRAVAH AICTE Approval Operations Platform"
    VERSION: str = "2.5.0"
    API_PREFIX: str = "/api"
    ENVIRONMENT: str = os.getenv("ENVIRONMENT", "development")
    
    # MongoDB Connection URI (Defaults to local MongoDB instance on port 27017)
    MONGODB_URI: str = os.getenv("MONGODB_URI", "mongodb://127.0.0.1:27017/pravah_aicte_db")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "pravah_aicte_db")
    
    # JWT and Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "pravah-aicte-secure-key-2026-production-token-sih-eval")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    # Upload storage directory
    UPLOAD_DIR: str = os.getenv("UPLOAD_DIR", os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads"))
    MAX_FILE_SIZE_BYTES: int = int(os.getenv("MAX_FILE_SIZE_BYTES", str(25 * 1024 * 1024))) # 25MB
    
    # Automated Monitoring Scheduler
    ENABLE_DEADLINE_SCHEDULER: bool = os.getenv("ENABLE_DEADLINE_SCHEDULER", "true").lower() == "true"
    DEADLINE_CHECK_INTERVAL_SECONDS: int = int(os.getenv("DEADLINE_CHECK_INTERVAL_SECONDS", "60"))
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

settings = Settings()

# Enforce strong environment-provided secret in production
if settings.ENVIRONMENT == "production":
    raw_secret = os.getenv("JWT_SECRET")
    if not raw_secret or raw_secret == "pravah-aicte-secure-key-2026-production-token-sih-eval" or len(raw_secret) < 32:
        raise ValueError("Production deployment requires a strong, environment-provided JWT_SECRET (minimum 32 characters).")

# Ensure uploads directory exists
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
