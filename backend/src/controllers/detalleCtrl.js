const pool = require('../db/postgres');

const getDetalles = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM detalle_inspeccion');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getDetalleById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM detalle_inspeccion WHERE id_detalle_inspeccion = $1', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createDetalle = async (req, res) => {
  try {
    const {
      especie_muestreadas,
      especie_afectadas,
      estado_aprobacion,
      area_registrada,
      informacion_de_produccion,
      id_lote,
      id_plaga,
      id_visita_inspeccion
    } = req.body;

    // Calcula porcentaje automáticamente
    const porcentaje_incidencia = (especie_afectadas / especie_muestreadas) * 100;

    const result = await pool.query(
      `INSERT INTO detalle_inspeccion 
        (especie_muestreadas, especie_afectadas, porcentaje_incidencia,
         estado_aprobacion, area_registrada, informacion_de_produccion,
         id_lote, id_plaga, id_visita_inspeccion)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
      [
        especie_muestreadas, especie_afectadas, porcentaje_incidencia,
        estado_aprobacion, area_registrada, informacion_de_produccion,
        id_lote, id_plaga, id_visita_inspeccion
      ]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      especie_muestreadas,
      especie_afectadas,
      estado_aprobacion,
      area_registrada,
      informacion_de_produccion
    } = req.body;

    const porcentaje_incidencia = (especie_afectadas / especie_muestreadas) * 100;

    const result = await pool.query(
      `UPDATE detalle_inspeccion SET
        especie_muestreadas=$1, especie_afectadas=$2,
        porcentaje_incidencia=$3, estado_aprobacion=$4,
        area_registrada=$5, informacion_de_produccion=$6
       WHERE id_detalle_inspeccion=$7 RETURNING *`,
      [
        especie_muestreadas, especie_afectadas, porcentaje_incidencia,
        estado_aprobacion, area_registrada, informacion_de_produccion, id
      ]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteDetalle = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM detalle_inspeccion WHERE id_detalle_inspeccion=$1 RETURNING *', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Detalle no encontrado' });
    res.json({ mensaje: 'Detalle eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getDetalles, getDetalleById, createDetalle, updateDetalle, deleteDetalle };