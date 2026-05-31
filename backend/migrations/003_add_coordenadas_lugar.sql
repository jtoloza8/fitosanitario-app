-- Migración: agrega coordenadas GPS al lugar de producción
ALTER TABLE lugar_produccion
  ADD COLUMN IF NOT EXISTS latitud  NUMERIC(10,6),
  ADD COLUMN IF NOT EXISTS longitud NUMERIC(10,6);
