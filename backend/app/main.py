from fastapi import FastAPI, Request, Response
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from app.config import settings
from app.routers import quotes, tags, connections


# ── API Key middleware ────────────────────────────────────────────────────────

class APIKeyMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        if settings.api_key:
            key = request.headers.get("X-API-Key")
            if not key:
                return Response(
                    content='{"detail":"Missing X-API-Key header"}',
                    status_code=401,
                    media_type="application/json",
                )
            if key != settings.api_key:
                return Response(
                    content='{"detail":"Invalid API key"}',
                    status_code=403,
                    media_type="application/json",
                )
        return await call_next(request)


# ── App factory ───────────────────────────────────────────────────────────────

app = FastAPI(title="Philosophical Journal API", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.add_middleware(APIKeyMiddleware)


app.include_router(quotes.router)
app.include_router(tags.router)
app.include_router(connections.router)


@app.get("/health")
async def health():
    return {"status": "ok"}
