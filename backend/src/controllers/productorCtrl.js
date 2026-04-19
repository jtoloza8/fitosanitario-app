const pool = require('../db/postgres');

const getProductores = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM productores');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getProductorById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM productores WHERE id_productor = $1', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Productor no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createProductor = async (req, res) => {
  try {
    const { nombre_completo, identificacion, direccion, telefono, correo, id_admin } = req.body;
    const result = await pool.query(
      `INSERT INTO productores 
        (nombre_completo, identificacion, direccion, telefono, correo, id_admin)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre_completo, identificacion, direccion, telefono, correo, id_admin]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const updateProductor = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, direccion, telefono, correo } = req.body;
    const result = await pool.query(
      `UPDATE productores SET
        nombre_completo=$1, direccion=$2, telefono=$3, correo=$4
       WHERE id_productor=$5 RETURNING *`,
      [nombre_completo, direccion, telefono, correo, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Productor no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteProductor = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM productores WHERE id_productor=$1 RETURNING *', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Productor no encontrado' });
    res.json({ mensaje: 'Productor eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getProductores, getProductorById, createProductor, updateProductor, deleteProductor };