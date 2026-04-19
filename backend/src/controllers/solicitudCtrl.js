const pool = require('../db/postgres');

const getSolicitudes = async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT s.*, 
        l.nombre_lugar, 
        lo.nombre_lote, 
        lo.especie,
        p.nombre_completo as nombre_productor
      FROM solicitud_inspeccion s
      LEFT JOIN lugar_produccion l ON s.id_lugar_produccion = l.id_lugar_produccion
      LEFT JOIN lote lo ON s.id_lote = lo.id_lote
      LEFT JOIN productores p ON s.id_productor = p.id_productor
      ORDER BY s.fecha_creacion DESC
    `);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getSolicitudesByProductor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(`
      SELECT s.*, 
        l.nombre_lugar, 
        lo.nombre_lote,
        lo.especie
      FROM solicitud_inspeccion s
      LEFT JOIN lugar_produccion l ON s.id_lugar_produccion = l.id_lugar_produccion
      LEFT JOIN lote lo ON s.id_lote = lo.id_lote
      WHERE s.id_productor = $1
      ORDER BY s.fecha_creacion DESC
    `, [id]);
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createSolicitud = async (req, res) => {
  try {
    const { id_lugar_produccion, id_lote, id_productor, fecha_solicitada, motivo } = req.body;
    const result = await pool.query(
      `INSERT INTO solicitud_inspeccion 
        (id_lugar_produccion, id_lote, id_productor, fecha_solicitada, motivo)
       VALUES ($1,$2,$3,$4,$5) RETURNING *`,
      [id_lugar_produccion, id_lote, id_productor, fecha_solicitada, motivo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const aprobarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE solicitud_inspeccion SET estado='Aprobada' WHERE id_solicitud=$1 RETURNING *`, [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const rechazarSolicitud = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const result = await pool.query(
      `UPDATE solicitud_inspeccion SET estado='Rechazada' WHERE id_solicitud=$1 RETURNING *`, [id]
    );
    res.json({ solicitud: result.rows[0], motivo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getSolicitudes, getSolicitudesByProductor, createSolicitud, aprobarSolicitud, rechazarSolicitud };