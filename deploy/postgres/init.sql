-- Extensiones útiles para el marketplace
CREATE EXTENSION IF NOT EXISTS "pg_trgm";        -- búsqueda difusa en texto
CREATE EXTENSION IF NOT EXISTS "unaccent";        -- búsqueda sin tildes
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";       -- UUIDs nativos si se necesitan

-- Búsqueda full-text optimizada para productos (se usará desde la API)
-- CREATE INDEX CONCURRENTLY IF NOT EXISTS products_fts_idx
--   ON products USING GIN (to_tsvector('spanish', name || ' ' || description));
