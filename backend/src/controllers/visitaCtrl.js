const pool = require('../db/postgres');

const getVisitas = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT v.*, f.nombre_completo as nombre_inspector, l.nombre_lugar
      FROM visita_inspeccion v
      LEFT JOIN funcionario_ica f ON v.id_inspector = f.id_funcionario
      LEFT JOIN lugar_produccion l ON v.id_lugar_produccion = l.id_lugar_produccion
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getVisitaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `SELECT v.*, f.nombre_completo as nombre_inspector, l.nombre_lugar
       FROM visita_inspeccion v
       LEFT JOIN funcionario_ica f ON v.id_inspector = f.id_funcionario
       LEFT JOIN lugar_produccion l ON v.id_lugar_produccion = l.id_lugar_produccion
       WHERE v.id_visita_inspeccion = $1`, [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Visita no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createVisita = async (req, res) => {
  try {
    const { fecha, hora_inicio, hora_fin, periodo_reportado, id_inspector, id_lugar_produccion } = req.body;
    const result = await pool.query(
      `INSERT INTO visita_inspeccion 
        (fecha, hora_inicio, hora_fin, periodo_reportado, id_inspector, id_lugar_produccion, estado)
       VALUES ($1,$2,$3,$4,$5,$6,'Pendiente') RETURNING *`,
      [fecha, hora_inicio, hora_fin, periodo_reportado, id_inspector, id_lugar_produccion]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateVisita = async (req, res) => {
  try {
    const { id } = req.params;
    const { fecha, hora_inicio, hora_fin, periodo_reportado } = req.body;
    const result = await pool.query(
      `UPDATE visita_inspeccion SET
        fecha=$1, hora_inicio=$2, hora_fin=$3, periodo_reportado=$4
       WHERE id_visita_inspeccion=$5 RETURNING *`,
      [fecha, hora_inicio, hora_fin, periodo_reportado, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Visita no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteVisita = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM visita_inspeccion WHERE id_visita_inspeccion=$1 RETURNING *', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Visita no encontrada' });
    res.json({ mensaje: 'Visita eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const aprobarVisita = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacion_admin } = req.body;
    const result = await pool.query(
      `UPDATE visita_inspeccion SET estado='Aprobada', observacion_admin=$1
       WHERE id_visita_inspeccion=$2 RETURNING *`,
      [observacion_admin, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rechazarVisita = async (req, res) => {
  try {
    const { id } = req.params;
    const { observacion_admin } = req.body;
    const result = await pool.query(
      `UPDATE visita_inspeccion SET estado='Rechazada', observacion_admin=$1
       WHERE id_visita_inspeccion=$2 RETURNING *`,
      [observacion_admin, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getVisitas, getVisitaById, createVisita, updateVisita, deleteVisita, aprobarVisita, rechazarVisita };