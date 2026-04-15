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

# API Key middleware desabilitado temporariamente
# app.add_middleware(APIKeyMiddleware)


app.include_router(quotes.router)
app.include_router(tags.router)
app.include_router(connections.router)


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/seed")
async def seed_database():
    """Endpoint temporário para popular o banco de dados"""
    from app.db import get_db
    from app.models import Quote, Tag
    
    async for db in get_db():
        # Verificar se já tem dados
        from sqlalchemy import select
        result = await db.execute(select(Quote))
        if result.scalars().first():
            return {"message": "Database already has data"}
        
        # Dados de exemplo
        quotes_data = [
            {
                "text": "A vida não examinada não vale a pena ser vivida.",
                "author": "Sócrates",
                "work": "Apologia de Sócrates",
                "tags": ["autoconhecimento", "filosofia", "vida"]
            },
            {
                "text": "Penso, logo existo.",
                "author": "René Descartes",
                "work": "Discurso do Método",
                "tags": ["existência", "razão", "filosofia"]
            },
            {
                "text": "O homem é condenado a ser livre.",
                "author": "Jean-Paul Sartre",
                "work": "O Existencialismo é um Humanismo",
                "tags": ["liberdade", "existencialismo", "responsabilidade"]
            },
            {
                "text": "Conhece-te a ti mesmo.",
                "author": "Sócrates",
                "work": "Oráculo de Delfos",
                "tags": ["autoconhecimento", "sabedoria", "filosofia"]
            },
            {
                "text": "A felicidade é o bem supremo.",
                "author": "Aristóteles",
                "work": "Ética a Nicômaco",
                "tags": ["felicidade", "ética", "bem"]
            }
        ]
        
        # Tentar importar embedding service (pode não estar disponível)
        try:
            from app.services.embedding_service import EmbeddingService
            embedding_service = EmbeddingService()
            use_embeddings = True
        except ImportError:
            use_embeddings = False
        
        for quote_data in quotes_data:
            # Criar quote
            quote = Quote(
                text=quote_data["text"],
                author=quote_data["author"],
                work=quote_data["work"]
            )
            
            # Adicionar embedding se disponível
            if use_embeddings:
                embedding = embedding_service.generate_embedding(quote_data["text"])
                quote.embedding = embedding
            
            db.add(quote)
            await db.flush()
            
            # Criar tags
            for tag_name in quote_data["tags"]:
                result = await db.execute(select(Tag).where(Tag.name == tag_name))
                tag = result.scalars().first()
                if not tag:
                    tag = Tag(name=tag_name)
                    db.add(tag)
                    await db.flush()
                quote.tags.append(tag)
        
        await db.commit()
        
        message = "Database seeded successfully"
        if not use_embeddings:
            message += " (without embeddings - search functionality limited)"
        
        return {"message": message, "quotes_added": len(quotes_data)}

