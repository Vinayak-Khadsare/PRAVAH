import os
from dotenv import load_dotenv

load_dotenv()

class Settings:
    PROJECT_NAME: str = "PRAVAH AICTE Approval Operations Platform"
    VERSION: str = "2.4.1"
    API_PREFIX: str = "/api"
    
    # MongoDB Atlas Connection URI
    # Kept exclusively in environment variables for security
    MONGODB_URI: str = os.getenv("MONGODB_URI", "")
    DATABASE_NAME: str = os.getenv("DATABASE_NAME", "pravah_aicte_db")
    
    # JWT and Security
    JWT_SECRET: str = os.getenv("JWT_SECRET", "pravah-aicte-secure-key-2026-production-token")
    JWT_ALGORITHM: str = os.getenv("JWT_ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", "480"))
    
    # CORS
    CORS_ORIGINS: list = [
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:8000",
        "http://127.0.0.1:8000",
    ]

settings = Settings()
