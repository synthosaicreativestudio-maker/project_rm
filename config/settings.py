from pydantic_settings import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    BOT_TOKEN: str
    GEMINI_API_KEY: Optional[str] = None
    ADMIN_IDS: list[int] = []
    
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "project_rm"
    POSTGRES_HOST: str = "localhost"
    POSTGRES_PORT: int = 5432
    
    REDIS_HOST: str = "localhost"
    REDIS_PORT: int = 6379
    
    WEBAPP_URL: Optional[str] = None

    # Vertex AI
    VERTEX_PROJECT_ID: str = "marketing-469506"
    VERTEX_LOCATION: str = "us-central1"
    VERTEX_CREDENTIALS_PATH: str = "marketing-469506-95611014aab8.json"

    # Models
    MODELS: Dict[str, str] = {
        "text": "gemini-2.5-flash-lite",
        "image": "imagen-3.0-generate-001",
        "video": "veo-3.1-fast-generate-001"
    }

    @property
    def database_url(self) -> str:
        return f"postgresql+asyncpg://{self.POSTGRES_USER}:{self.POSTGRES_PASSWORD}@{self.POSTGRES_HOST}:{self.POSTGRES_PORT}/{self.POSTGRES_DB}"

    @property
    def redis_url(self) -> str:
        return f"redis://{self.REDIS_HOST}:{self.REDIS_PORT}/0"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"

settings = Settings()
