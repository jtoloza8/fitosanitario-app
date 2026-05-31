-- Migración: agrega campo cultivos_afectados a la tabla plaga
-- Ejecutar una sola vez en PostgreSQL

ALTER TABLE plaga
  ADD COLUMN IF NOT EXISTS cultivos_afectados TEXT DEFAULT '';

-- Ejemplos de actualización para cultivos comunes de Colombia:
-- UPDATE plaga SET cultivos_afectados = 'mango,aguacate' WHERE nombre_plaga ILIKE '%trips%';
-- UPDATE plaga SET cultivos_afectados = 'café' WHERE nombre_plaga ILIKE '%broca%';
-- UPDATE plaga SET cultivos_afectados = 'café' WHERE nombre_plaga ILIKE '%roya%';
-- UPDATE plaga SET cultivos_afectados = 'cítricos,limón,naranja,mandarina' WHERE nombre_plaga ILIKE '%minador%';
-- UPDATE plaga SET cultivos_afectados = 'tomate,papa,pimiento' WHERE nombre_plaga ILIKE '%mosca blanca%';
