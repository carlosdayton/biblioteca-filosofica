from __future__ import annotations

import uuid
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas import (
    QuoteCreate, QuoteUpdate, QuoteResponse, PaginatedQuotes,
    QuoteSearchResult,
)
from app.services.quote_service import quote_service

router = APIRouter(prefix="/quotes", tags=["quotes"])


# ── Static-path endpoints (must come before /{quote_id}) ─────────────────────

@router.get("/search", response_model=list[QuoteResponse] | list[QuoteSearchResult])
async def search_quotes(
    q: str = Query(default=""),
    mode: str = Query(default="text"),
    db: AsyncSession = Depends(get_db),
):
    if not q or not q.strip():
        raise HTTPException(status_code=422, detail="Query parameter 'q' cannot be empty")
    if mode not in ("text", "semantic"):
        raise HTTPException(
            status_code=422,
            detail="Parameter 'mode' must be 'text' or 'semantic'",
        )

    if mode == "text":
        quotes = await quote_service.search_text(db, q)
        return quotes
    else:
        return await quote_service.search_semantic(db, q)


@router.get("/daily", response_model=QuoteResponse)
async def daily_quote(db: AsyncSession = Depends(get_db)):
    return await quote_service.get_daily(db)


@router.get("/export")
async def export_quotes(
    format: str = Query(default="json"),
    db: AsyncSession = Depends(get_db),
):
    if format not in ("json", "markdown"):
        raise HTTPException(
            status_code=422,
            detail="Parameter 'format' must be 'json' or 'markdown'",
        )
    return await quote_service.export(db, format)


# ── CRUD endpoints ────────────────────────────────────────────────────────────

@router.post("", response_model=QuoteResponse, status_code=201)
async def create_quote(
    data: QuoteCreate,
    db: AsyncSession = Depends(get_db),
):
    quote = await quote_service.create(db, data)
    return quote


@router.get("", response_model=PaginatedQuotes)
async def list_quotes(
    page: int = Query(default=1, ge=1),
    db: AsyncSession = Depends(get_db),
):
    return await quote_service.get_paginated(db, page)


@router.get("/{quote_id}", response_model=QuoteResponse)
async def get_quote(
    quote_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    return await quote_service.get_by_id(db, quote_id)


@router.put("/{quote_id}", response_model=QuoteResponse)
async def update_quote(
    quote_id: uuid.UUID,
    data: QuoteUpdate,
    db: AsyncSession = Depends(get_db),
):
    return await quote_service.update(db, quote_id, data)


@router.delete("/{quote_id}", status_code=204)
async def delete_quote(
    quote_id: uuid.UUID,
    db: AsyncSession = Depends(get_db),
):
    await quote_service.delete(db, quote_id)
