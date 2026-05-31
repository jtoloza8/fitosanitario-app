const pool = require('../db/postgres');

const getPlagas = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM plaga');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getPlagaById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM plaga WHERE id_plaga = $1', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Plaga no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createPlaga = async (req, res) => {
  try {
    const { nombre_plaga, tipo_plaga, cultivos_afectados } = req.body;
    const result = await pool.query(
      `INSERT INTO plaga (nombre_plaga, tipo_plaga, cultivos_afectados)
       VALUES ($1,$2,$3) RETURNING *`,
      [nombre_plaga, tipo_plaga, cultivos_afectados || '']
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updatePlaga = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_plaga, tipo_plaga, cultivos_afectados } = req.body;
    const result = await pool.query(
      `UPDATE plaga SET nombre_plaga=$1, tipo_plaga=$2, cultivos_afectados=$3
       WHERE id_plaga=$4 RETURNING *`,
      [nombre_plaga, tipo_plaga, cultivos_afectados ?? '', id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Plaga no encontrada' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deletePlaga = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM plaga WHERE id_plaga=$1 RETURNING *', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Plaga no encontrada' });
    res.json({ mensaje: 'Plaga eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getPlagas, getPlagaById, createPlaga, updatePlaga, deletePlaga };