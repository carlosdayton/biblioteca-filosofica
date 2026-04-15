"""Initial schema

Revision ID: 0001
Revises:
Create Date: 2024-01-01 00:00:00.000000
"""
from alembic import op
import sqlalchemy as sa

revision = "0001"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable pgvector extension (Requirement 10.4)
    op.execute("CREATE EXTENSION IF NOT EXISTS vector")

    op.create_table(
        "quotes",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
        sa.Column("author", sa.String(255), nullable=False),
        sa.Column("work", sa.String(255), nullable=True),
        sa.Column("reflection", sa.Text(), nullable=True),
        sa.Column("is_favorite", sa.Boolean(), server_default=sa.text("false"), nullable=False),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.Column("updated_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
    )

    op.create_table(
        "tags",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("name", sa.String(100), nullable=False),
        sa.Column("color", sa.String(7), server_default=sa.text("'#8B7355'"), nullable=False),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("name"),
    )

    op.create_table(
        "quote_tags",
        sa.Column("quote_id", sa.UUID(), nullable=False),
        sa.Column("tag_id", sa.UUID(), nullable=False),
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["tag_id"], ["tags.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("quote_id", "tag_id"),
    )

    op.create_table(
        "quote_embeddings",
        sa.Column("quote_id", sa.UUID(), nullable=False),
        sa.Column("embedding", sa.Text(), nullable=False),  # stored as vector(384) via raw DDL below
        sa.ForeignKeyConstraint(["quote_id"], ["quotes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("quote_id"),
    )

    # Replace the text column with a proper vector(384) column
    op.execute("ALTER TABLE quote_embeddings DROP COLUMN embedding")
    op.execute("ALTER TABLE quote_embeddings ADD COLUMN embedding vector(384) NOT NULL")

    # ivfflat index for cosine similarity search
    op.execute(
        "CREATE INDEX ON quote_embeddings USING ivfflat (embedding vector_cosine_ops)"
    )

    op.create_table(
        "quote_connections",
        sa.Column("id", sa.UUID(), server_default=sa.text("gen_random_uuid()"), nullable=False),
        sa.Column("source_id", sa.UUID(), nullable=False),
        sa.Column("target_id", sa.UUID(), nullable=False),
        sa.Column("label", sa.String(255), nullable=True),
        sa.Column("created_at", sa.TIMESTAMP(timezone=True), server_default=sa.text("NOW()"), nullable=False),
        sa.ForeignKeyConstraint(["source_id"], ["quotes.id"], ondelete="CASCADE"),
        sa.ForeignKeyConstraint(["target_id"], ["quotes.id"], ondelete="CASCADE"),
        sa.PrimaryKeyConstraint("id"),
        sa.UniqueConstraint("source_id", "target_id"),
    )


def downgrade() -> None:
    op.drop_table("quote_connections")
    op.drop_table("quote_embeddings")
    op.drop_table("quote_tags")
    op.drop_table("tags")
    op.drop_table("quotes")
    op.execute("DROP EXTENSION IF EXISTS vector")
