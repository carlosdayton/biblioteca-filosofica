from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from sentence_transformers import SentenceTransformer

_MODEL_NAME = "all-MiniLM-L6-v2"
_MAX_TEXT_LENGTH = 512
_EMBEDDING_DIM = 384


class EmbeddingService:
    """Singleton service for generating sentence embeddings.

    The model is loaded lazily on the first call to `generate()`.
    """

    def __init__(self) -> None:
        self._model: "SentenceTransformer | None" = None

    def _load_model(self) -> "SentenceTransformer":
        if self._model is None:
            from sentence_transformers import SentenceTransformer
            self._model = SentenceTransformer(_MODEL_NAME)
        return self._model

    def generate(self, text: str) -> list[float]:
        """Generate a normalized embedding vector for the given text.

        Truncates text to the first 512 characters if longer.
        Returns a list of 384 floats with L2 norm == 1.0.
        """
        if len(text) > _MAX_TEXT_LENGTH:
            text = text[:_MAX_TEXT_LENGTH]

        model = self._load_model()
        embedding = model.encode(text, normalize_embeddings=True)
        return embedding.tolist()

    def is_ready(self) -> bool:
        """Return True if the model has already been loaded into memory."""
        return self._model is not None


# Module-level singleton exported for use in routers
embedding_service = EmbeddingService()
