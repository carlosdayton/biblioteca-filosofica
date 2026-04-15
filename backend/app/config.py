from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    database_url: str = "postgresql+asyncpg://journal:journal@localhost:5432/philosophical_journal"
    cors_origins: str = "http://localhost:5173"
    api_key: Optional[str] = None  # Deixe None para desabilitar autenticação

    @property
    def cors_origins_list(self) -> list[str]:
        return [origin.strip() for origin in self.cors_origins.split(",")]


settings = Settings()
