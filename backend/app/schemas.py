from __future__ import annotations
import uuid
from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator, ConfigDict


# ── Tag schemas ──────────────────────────────────────────────────────────────

class TagBase(BaseModel):
    name: str
    color: str = "#8B7355"

    @field_validator("color")
    @classmethod
    def validate_color(cls, v: str) -> str:
        import re
        if not re.match(r"^#[0-9A-Fa-f]{6}$", v):
            raise ValueError("color must be a valid hex color in #RRGGBB format")
        return v


class TagCreate(TagBase):
    pass


class TagResponse(TagBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    quote_count: int = 0


# ── Quote schemas ─────────────────────────────────────────────────────────────

class QuoteBase(BaseModel):
    text: str
    author: str
    work: Optional[str] = None
    reflection: Optional[str] = None
    is_favorite: bool = False

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("text cannot be empty")
        if len(v) > 2000:
            raise ValueError("text cannot exceed 2000 characters")
        return v

    @field_validator("author")
    @classmethod
    def validate_author(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("author cannot be empty")
        return v


class QuoteCreate(QuoteBase):
    tag_ids: list[uuid.UUID] = []


class QuoteUpdate(BaseModel):
    text: Optional[str] = None
    author: Optional[str] = None
    work: Optional[str] = None
    reflection: Optional[str] = None
    is_favorite: Optional[bool] = None
    tag_ids: Optional[list[uuid.UUID]] = None

    @field_validator("text")
    @classmethod
    def validate_text(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            if not v.strip():
                raise ValueError("text cannot be empty")
            if len(v) > 2000:
                raise ValueError("text cannot exceed 2000 characters")
        return v

    @field_validator("author")
    @classmethod
    def validate_author(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("author cannot be empty")
        return v


class QuoteResponse(QuoteBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    tags: list[TagResponse] = []
    created_at: datetime
    updated_at: datetime


# ── Connection schemas ────────────────────────────────────────────────────────

class QuoteConnectionBase(BaseModel):
    source_id: uuid.UUID
    target_id: uuid.UUID
    label: Optional[str] = None


class QuoteConnectionCreate(QuoteConnectionBase):
    pass


class QuoteConnectionUpdate(BaseModel):
    label: Optional[str] = None


class QuoteConnectionResponse(QuoteConnectionBase):
    model_config = ConfigDict(from_attributes=True)

    id: uuid.UUID
    created_at: datetime


# ── Search / pagination schemas ───────────────────────────────────────────────

class QuoteSearchResult(BaseModel):
    quote: QuoteResponse
    score: float


class PaginatedQuotes(BaseModel):
    items: list[QuoteResponse]
    total: int
    page: int
    pages: int
