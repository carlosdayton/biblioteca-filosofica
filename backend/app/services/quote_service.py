from __future__ import annotations

import json
import uuid
from typing import Optional

from fastapi import HTTPException
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy import select, func, delete, or_, text
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.orm import selectinload

from app.models import Quote, Tag, QuoteTag, QuoteEmbedding
from app.schemas import (
    QuoteCreate, QuoteUpdate, QuoteResponse, PaginatedQuotes,
    QuoteSearchResult, TagResponse,
)
from app.services.embedding_service import embedding_service

PAGE_SIZE = 20
SIMILARITY_THRESHOLD = 0.3
SEMANTIC_LIMIT = 10


class QuoteService:

    async def _validate_tag_ids(
        self, db: AsyncSession, tag_ids: list[uuid.UUID]
    ) -> list[Tag]:
        if not tag_ids:
            return []
        result = await db.execute(select(Tag).where(Tag.id.in_(tag_ids)))
        found = result.scalars().all()
        if len(found) != len(tag_ids):
            found_ids = {t.id for t in found}
            missing = [str(tid) for tid in tag_ids if tid not in found_ids]
            raise HTTPException(
                status_code=422,
                detail=f"Tag IDs not found: {', '.join(missing)}",
            )
        return list(found)

    async def create(self, db: AsyncSession, data: QuoteCreate) -> Quote:
        tags = await self._validate_tag_ids(db, data.tag_ids)

        quote = Quote(
            text=data.text,
            author=data.author,
            work=data.work,
            reflection=data.reflection,
            is_favorite=data.is_favorite,
        )
        db.add(quote)
        await db.flush()  # get quote.id

        for tag in tags:
            db.add(QuoteTag(quote_id=quote.id, tag_id=tag.id))

        # Generate and persist embedding (only if embedding service is ready)
        try:
            embed_text = data.text
            if data.reflection:
                embed_text = f"{data.text} {data.reflection}"
            vector = embedding_service.generate(embed_text)
            db.add(QuoteEmbedding(quote_id=quote.id, embedding=vector))
        except Exception:
            pass  # embedding is optional

        await db.flush()
        await db.refresh(quote, ["tags"])
        return quote

    async def get_paginated(
        self, db: AsyncSession, page: int
    ) -> PaginatedQuotes:
        offset = (page - 1) * PAGE_SIZE

        count_result = await db.execute(select(func.count()).select_from(Quote))
        total = count_result.scalar_one()

        result = await db.execute(
            select(Quote)
            .options(selectinload(Quote.tags))
            .order_by(Quote.created_at.desc())
            .offset(offset)
            .limit(PAGE_SIZE)
        )
        items = result.scalars().all()

        pages = max(1, (total + PAGE_SIZE - 1) // PAGE_SIZE)
        return PaginatedQuotes(
            items=list(items),
            total=total,
            page=page,
            pages=pages,
        )

    async def get_by_id(self, db: AsyncSession, quote_id: uuid.UUID) -> Quote:
        result = await db.execute(
            select(Quote)
            .options(selectinload(Quote.tags))
            .where(Quote.id == quote_id)
        )
        quote = result.scalar_one_or_none()
        if quote is None:
            raise HTTPException(status_code=404, detail="Quote not found")
        return quote

    async def update(
        self, db: AsyncSession, quote_id: uuid.UUID, data: QuoteUpdate
    ) -> Quote:
        quote = await self.get_by_id(db, quote_id)

        needs_reembed = False

        if data.text is not None:
            quote.text = data.text
            needs_reembed = True
        if data.author is not None:
            quote.author = data.author
        if data.work is not None:
            quote.work = data.work
        if data.reflection is not None:
            quote.reflection = data.reflection
            needs_reembed = True
        if data.is_favorite is not None:
            quote.is_favorite = data.is_favorite

        if data.tag_ids is not None:
            tags = await self._validate_tag_ids(db, data.tag_ids)
            await db.execute(
                delete(QuoteTag).where(QuoteTag.quote_id == quote_id)
            )
            for tag in tags:
                db.add(QuoteTag(quote_id=quote.id, tag_id=tag.id))

        if needs_reembed:
            try:
                embed_text = quote.text
                if quote.reflection:
                    embed_text = f"{quote.text} {quote.reflection}"
                vector = embedding_service.generate(embed_text)

                emb_result = await db.execute(
                    select(QuoteEmbedding).where(QuoteEmbedding.quote_id == quote_id)
                )
                existing_emb = emb_result.scalar_one_or_none()
                if existing_emb:
                    existing_emb.embedding = vector
                else:
                    db.add(QuoteEmbedding(quote_id=quote.id, embedding=vector))
            except Exception:
                pass  # embedding is optional

        await db.flush()
        await db.refresh(quote, ["tags"])
        return quote

    async def delete(self, db: AsyncSession, quote_id: uuid.UUID) -> None:
        quote = await self.get_by_id(db, quote_id)
        await db.delete(quote)

    # ── Search ────────────────────────────────────────────────────────────────

    async def search_text(self, db: AsyncSession, q: str) -> list[Quote]:
        pattern = f"%{q}%"
        result = await db.execute(
            select(Quote)
            .options(selectinload(Quote.tags))
            .where(
                or_(
                    Quote.text.ilike(pattern),
                    Quote.author.ilike(pattern),
                    Quote.reflection.ilike(pattern),
                )
            )
            .order_by(Quote.created_at.desc())
        )
        return list(result.scalars().all())

    async def search_semantic(
        self, db: AsyncSession, q: str
    ) -> list[QuoteSearchResult]:
        if not embedding_service.is_ready():
            raise HTTPException(
                status_code=503,
                detail="Embedding service initializing, try again in a few seconds",
            )

        query_vector = embedding_service.generate(q)
        # pgvector cosine distance: <=> gives distance, score = 1 - distance
        stmt = text(
            """
            SELECT q.id, 1 - (e.embedding <=> CAST(:vec AS vector)) AS score
            FROM quotes q
            JOIN quote_embeddings e ON e.quote_id = q.id
            ORDER BY e.embedding <=> CAST(:vec AS vector)
            LIMIT :lim
            """
        )
        rows = await db.execute(
            stmt,
            {"vec": str(query_vector), "lim": SEMANTIC_LIMIT},
        )
        rows = rows.fetchall()

        results: list[QuoteSearchResult] = []
        for row in rows:
            score = float(row.score)
            if score < SIMILARITY_THRESHOLD:
                continue
            quote = await self.get_by_id(db, row.id)
            results.append(QuoteSearchResult(quote=QuoteResponse.model_validate(quote), score=score))
        return results

    # ── Daily quote ───────────────────────────────────────────────────────────

    async def get_daily(self, db: AsyncSession) -> Quote:
        # Try favorites first
        result = await db.execute(
            select(Quote)
            .options(selectinload(Quote.tags))
            .where(Quote.is_favorite.is_(True))
            .order_by(func.random())
            .limit(1)
        )
        quote = result.scalar_one_or_none()
        if quote is not None:
            return quote

        # Fallback: any quote
        result = await db.execute(
            select(Quote)
            .options(selectinload(Quote.tags))
            .order_by(func.random())
            .limit(1)
        )
        quote = result.scalar_one_or_none()
        if quote is None:
            raise HTTPException(status_code=404, detail="No quotes found")
        return quote

    # ── Export ────────────────────────────────────────────────────────────────

    async def export(self, db: AsyncSession, fmt: str):
        # Load all quotes with tags
        result = await db.execute(
            select(Quote)
            .options(selectinload(Quote.tags))
            .order_by(Quote.author)
        )
        quotes = result.scalars().all()

        # Group by tag; quotes with no tags go under "Sem tag"
        grouped: dict[str, list[Quote]] = {}
        for quote in quotes:
            if quote.tags:
                for tag in quote.tags:
                    grouped.setdefault(tag.name, []).append(quote)
            else:
                grouped.setdefault("Sem tag", []).append(quote)

        if fmt == "json":
            output: dict = {}
            for tag_name, tag_quotes in sorted(grouped.items()):
                output[tag_name] = [
                    {
                        "id": str(q.id),
                        "text": q.text,
                        "author": q.author,
                        "work": q.work,
                        "reflection": q.reflection,
                        "is_favorite": q.is_favorite,
                        "tags": [t.name for t in q.tags],
                    }
                    for q in tag_quotes
                ]
            return JSONResponse(content=output)

        else:  # markdown
            lines = ["# Diário Filosófico\n"]
            for tag_name, tag_quotes in sorted(grouped.items()):
                lines.append(f"## {tag_name}\n")
                for q in tag_quotes:
                    lines.append(f"> {q.text}")
                    author_line = f"— {q.author}"
                    if q.work:
                        author_line += f", *{q.work}*"
                    lines.append(author_line)
                    lines.append("")
                    if q.reflection:
                        lines.append(f"**Reflexão:** {q.reflection}")
                        lines.append("")
            content = "\n".join(lines)
            return PlainTextResponse(content=content, media_type="text/markdown")


quote_service = QuoteService()
