from __future__ import annotations

import uuid

from fastapi import HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Quote, QuoteConnection
from app.schemas import QuoteConnectionCreate, QuoteConnectionUpdate


class ConnectionService:
    async def create(self, db: AsyncSession, data: QuoteConnectionCreate) -> QuoteConnection:
        if data.source_id == data.target_id:
            raise HTTPException(status_code=422, detail="source_id and target_id must be different")

        source = await db.get(Quote, data.source_id)
        if not source:
            raise HTTPException(status_code=422, detail=f"Quote with id '{data.source_id}' not found")

        target = await db.get(Quote, data.target_id)
        if not target:
            raise HTTPException(status_code=422, detail=f"Quote with id '{data.target_id}' not found")

        existing = await db.execute(
            select(QuoteConnection).where(
                QuoteConnection.source_id == data.source_id,
                QuoteConnection.target_id == data.target_id,
            )
        )
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail="Connection already exists")

        connection = QuoteConnection(
            source_id=data.source_id,
            target_id=data.target_id,
            label=data.label,
        )
        db.add(connection)
        await db.flush()
        await db.refresh(connection)
        return connection

    async def list_all(self, db: AsyncSession) -> list[QuoteConnection]:
        result = await db.execute(select(QuoteConnection).order_by(QuoteConnection.created_at))
        return list(result.scalars().all())

    async def update(self, db: AsyncSession, connection_id: uuid.UUID, data: QuoteConnectionUpdate) -> QuoteConnection:
        connection = await db.get(QuoteConnection, connection_id)
        if not connection:
            raise HTTPException(status_code=404, detail="Connection not found")
        
        if data.label is not None:
            connection.label = data.label
        
        await db.flush()
        await db.refresh(connection)
        return connection

    async def delete(self, db: AsyncSession, connection_id: uuid.UUID) -> None:
        connection = await db.get(QuoteConnection, connection_id)
        if not connection:
            raise HTTPException(status_code=404, detail="Connection not found")
        await db.delete(connection)


connection_service = ConnectionService()
