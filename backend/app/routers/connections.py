from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas import QuoteConnectionCreate, QuoteConnectionUpdate, QuoteConnectionResponse
from app.services.connection_service import connection_service

router = APIRouter(prefix="/connections", tags=["connections"])


@router.post("", response_model=QuoteConnectionResponse, status_code=201)
async def create_connection(data: QuoteConnectionCreate, db: AsyncSession = Depends(get_db)):
    return await connection_service.create(db, data)


@router.get("", response_model=list[QuoteConnectionResponse])
async def list_connections(db: AsyncSession = Depends(get_db)):
    return await connection_service.list_all(db)


@router.put("/{connection_id}", response_model=QuoteConnectionResponse)
async def update_connection(
    connection_id: uuid.UUID,
    data: QuoteConnectionUpdate,
    db: AsyncSession = Depends(get_db)
):
    return await connection_service.update(db, connection_id, data)


@router.delete("/{connection_id}", status_code=204)
async def delete_connection(connection_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await connection_service.delete(db, connection_id)
