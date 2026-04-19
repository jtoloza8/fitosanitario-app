const pool = require('../db/postgres');

// Obtener todos los lugares
const getLugares = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM lugar_produccion');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un lugar por ID
const getLugarById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM lugar_produccion WHERE id_lugar_produccion = $1', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lugar no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear un lugar
const createLugar = async (req, res) => {
  try {
    const { nombre_lugar, numero_registroica, municipio, departamento, area_total_m2, fecha_proxima_visita, id_productor } = req.body;
    const result = await pool.query(
      `INSERT INTO lugar_produccion 
        (nombre_lugar, numero_registroica, municipio, departamento, area_total_m2, fecha_proxima_visita, id_productor, estado)
       VALUES ($1,$2,$3,$4,$5,$6,$7,'Pendiente') RETURNING *`,
      [nombre_lugar, numero_registroica, municipio, departamento, area_total_m2, fecha_proxima_visita, id_productor]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar un lugar
const updateLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_lugar, municipio, departamento, area_total_m2, fecha_proxima_visita } = req.body;
    const result = await pool.query(
      `UPDATE lugar_produccion SET
        nombre_lugar=$1, municipio=$2, departamento=$3,
        area_total_m2=$4, fecha_proxima_visita=$5
       WHERE id_lugar_produccion=$6 RETURNING *`,
      [nombre_lugar, municipio, departamento, area_total_m2, fecha_proxima_visita, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lugar no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar un lugar
const deleteLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM lugar_produccion WHERE id_lugar_produccion=$1 RETURNING *', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Lugar no encontrado' });
    res.json({ mensaje: 'Lugar eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Aprobar lugar
const aprobarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      `UPDATE lugar_produccion SET estado='Aprobado' WHERE id_lugar_produccion=$1 RETURNING *`, [id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Rechazar lugar
const rechazarLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const { motivo } = req.body;
    const result = await pool.query(
      `UPDATE lugar_produccion SET estado='Rechazado' WHERE id_lugar_produccion=$1 RETURNING *`, [id]
    );
    res.json({ lugar: result.rows[0], motivo });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getLugares, getLugarById, createLugar, updateLugar, deleteLugar, aprobarLugar, rechazarLugar };