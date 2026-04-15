import uuid
from datetime import datetime
from sqlalchemy import (
    Column, String, Text, Boolean, DateTime, ForeignKey, UniqueConstraint
)
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship, Mapped, mapped_column
try:
    from pgvector.sqlalchemy import Vector
    _PGVECTOR_AVAILABLE = True
except Exception:
    _PGVECTOR_AVAILABLE = False
from app.db import Base


class Tag(Base):
    __tablename__ = "tags"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    color: Mapped[str] = mapped_column(String(7), nullable=False, default="#8B7355")

    quotes: Mapped[list["Quote"]] = relationship(
        "Quote", secondary="quote_tags", back_populates="tags"
    )


class QuoteTag(Base):
    __tablename__ = "quote_tags"

    quote_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotes.id", ondelete="CASCADE"), primary_key=True
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("tags.id", ondelete="CASCADE"), primary_key=True
    )


class Quote(Base):
    __tablename__ = "quotes"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    text: Mapped[str] = mapped_column(Text, nullable=False)
    author: Mapped[str] = mapped_column(String(255), nullable=False)
    work: Mapped[str | None] = mapped_column(String(255), nullable=True)
    reflection: Mapped[str | None] = mapped_column(Text, nullable=True)
    is_favorite: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    tags: Mapped[list["Tag"]] = relationship(
        "Tag", secondary="quote_tags", back_populates="quotes"
    )
    embedding: Mapped["QuoteEmbedding"] = relationship(
        "QuoteEmbedding", back_populates="quote", uselist=False, cascade="all, delete-orphan"
    )
    connections_as_source: Mapped[list["QuoteConnection"]] = relationship(
        "QuoteConnection", foreign_keys="QuoteConnection.source_id",
        back_populates="source", cascade="all, delete-orphan"
    )
    connections_as_target: Mapped[list["QuoteConnection"]] = relationship(
        "QuoteConnection", foreign_keys="QuoteConnection.target_id",
        back_populates="target", cascade="all, delete-orphan"
    )


class QuoteEmbedding(Base):
    __tablename__ = "quote_embeddings"

    quote_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotes.id", ondelete="CASCADE"), primary_key=True
    )
    if _PGVECTOR_AVAILABLE:
        embedding = Column(Vector(384), nullable=False)
    else:
        embedding = Column(Text, nullable=True)

    quote: Mapped["Quote"] = relationship("Quote", back_populates="embedding")


class QuoteConnection(Base):
    __tablename__ = "quote_connections"

    id: Mapped[uuid.UUID] = mapped_column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    source_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False
    )
    target_id: Mapped[uuid.UUID] = mapped_column(
        UUID(as_uuid=True), ForeignKey("quotes.id", ondelete="CASCADE"), nullable=False
    )
    label: Mapped[str | None] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=datetime.utcnow, nullable=False)

    source: Mapped["Quote"] = relationship("Quote", foreign_keys=[source_id], back_populates="connections_as_source")
    target: Mapped["Quote"] = relationship("Quote", foreign_keys=[target_id], back_populates="connections_as_target")

    __table_args__ = (UniqueConstraint("source_id", "target_id", name="uq_quote_connections"),)
