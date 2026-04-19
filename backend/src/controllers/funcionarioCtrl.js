const pool = require('../db/postgres');

// Obtener todos los funcionarios
const getFuncionarios = async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM funcionario_ica');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Obtener un funcionario por ID
const getFuncionarioById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'SELECT * FROM funcionario_ica WHERE id_funcionario = $1', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Crear funcionario
const createFuncionario = async (req, res) => {
  try {
    const { auth_id, cedula, nombre_completo, rol_funcionario, tarjeta_profesional, telefono, correo } = req.body;
    const result = await pool.query(
      `INSERT INTO funcionario_ica 
        (auth_id, cedula, nombre_completo, rol_funcionario, tarjeta_profesional, telefono, correo)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [auth_id, cedula, nombre_completo, rol_funcionario, tarjeta_profesional, telefono, correo]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Actualizar funcionario
const updateFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre_completo, rol_funcionario, tarjeta_profesional, telefono, correo } = req.body;
    const result = await pool.query(
      `UPDATE funcionario_ica SET
        nombre_completo=$1, rol_funcionario=$2,
        tarjeta_profesional=$3, telefono=$4, correo=$5
       WHERE id_funcionario=$6 RETURNING *`,
      [nombre_completo, rol_funcionario, tarjeta_profesional, telefono, correo, id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Eliminar funcionario
const deleteFuncionario = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query(
      'DELETE FROM funcionario_ica WHERE id_funcionario=$1 RETURNING *', [id]
    );
    if (result.rows.length === 0)
      return res.status(404).json({ error: 'Funcionario no encontrado' });
    res.json({ mensaje: 'Funcionario eliminado correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getFuncionarios, getFuncionarioById, createFuncionario, updateFuncionario, deleteFuncionario };