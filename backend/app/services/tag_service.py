from __future__ import annotations

import uuid

from fastapi import HTTPException
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import QuoteTag, Tag
from app.schemas import TagCreate, TagResponse


class TagService:
    async def create(self, db: AsyncSession, data: TagCreate) -> Tag:
        existing = await db.execute(select(Tag).where(Tag.name == data.name))
        if existing.scalar_one_or_none():
            raise HTTPException(status_code=409, detail=f"Tag with name '{data.name}' already exists")

        tag = Tag(name=data.name, color=data.color)
        db.add(tag)
        await db.flush()
        await db.refresh(tag)
        return tag

    async def list_all(self, db: AsyncSession) -> list[TagResponse]:
        result = await db.execute(
            select(
                Tag.id,
                Tag.name,
                Tag.color,
                func.count(QuoteTag.quote_id).label("quote_count"),
            )
            .outerjoin(QuoteTag, QuoteTag.tag_id == Tag.id)
            .group_by(Tag.id)
            .order_by(Tag.name)
        )
        rows = result.all()
        return [
            TagResponse(id=row.id, name=row.name, color=row.color, quote_count=row.quote_count)
            for row in rows
        ]

    async def delete(self, db: AsyncSession, tag_id: uuid.UUID) -> None:
        tag = await db.get(Tag, tag_id)
        if not tag:
            raise HTTPException(status_code=404, detail="Tag not found")
        await db.delete(tag)


tag_service = TagService()
