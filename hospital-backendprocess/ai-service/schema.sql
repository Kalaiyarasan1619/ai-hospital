-- Run once on the Postgres used by ai-service (Neon/local).
-- pgvector extension and table for sentence-transformers all-MiniLM-L6-v2 (384 dims).

CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS embeddings (
    id BIGSERIAL PRIMARY KEY,
    content TEXT NOT NULL,
    ref_id BIGINT NOT NULL,
    type TEXT NOT NULL,
    embedding vector(384)
);

-- After you have enough rows, consider an ANN index (ivfflat/hnsw) for faster search.
