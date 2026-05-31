-- Migración: agrega campos de evaluación fitosanitaria ICA a visita_inspeccion
-- Ejecutar una sola vez en la base de datos PostgreSQL

ALTER TABLE visita_inspeccion
  ADD COLUMN IF NOT EXISTS condicion_cultivo      VARCHAR(50),
  ADD COLUMN IF NOT EXISTS riesgo_fitosanitario   VARCHAR(50),
  ADD COLUMN IF NOT EXISTS medidas_recomendadas   TEXT,
  ADD COLUMN IF NOT EXISTS conclusion_inspector   TEXT,
  ADD COLUMN IF NOT EXISTS proxima_visita_sugerida DATE;
