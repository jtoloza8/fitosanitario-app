-- Migración: agrega id_lote a visita_inspeccion para que el inspector sepa qué lote inspeccionar
-- Ejecutar una sola vez en la base de datos PostgreSQL

ALTER TABLE visita_inspeccion
  ADD COLUMN IF NOT EXISTS id_lote INT REFERENCES lote(id_lote);
