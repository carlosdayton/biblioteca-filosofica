from __future__ import annotations

import uuid

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from app.db import get_db
from app.schemas import TagCreate, TagResponse
from app.services.tag_service import tag_service

router = APIRouter(prefix="/tags", tags=["tags"])


@router.post("", response_model=TagResponse, status_code=201)
async def create_tag(data: TagCreate, db: AsyncSession = Depends(get_db)):
    tag = await tag_service.create(db, data)
    return TagResponse(id=tag.id, name=tag.name, color=tag.color, quote_count=0)


@router.get("", response_model=list[TagResponse])
async def list_tags(db: AsyncSession = Depends(get_db)):
    return await tag_service.list_all(db)


@router.delete("/{tag_id}", status_code=204)
async def delete_tag(tag_id: uuid.UUID, db: AsyncSession = Depends(get_db)):
    await tag_service.delete(db, tag_id)
