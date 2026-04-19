const pool = require('../db/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

// Registro
const registro = async (req, res) => {
  try {
    const { cedula, nombre_completo, correo, password, rol_funcionario, tarjeta_profesional, telefono } = req.body;

    // Verificar si ya existe
    const existe = await pool.query(
      'SELECT * FROM funcionario_ica WHERE correo = $1', [correo]
    );
    if (existe.rows.length > 0)
      return res.status(400).json({ error: 'El correo ya está registrado' });

    // Encriptar contraseña
    const hash = await bcrypt.hash(password, 10);

    // Guardar usuario
    const result = await pool.query(
      `INSERT INTO funcionario_ica 
        (cedula, nombre_completo, correo, auth_id, rol_funcionario, tarjeta_profesional, telefono)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING *`,
      [cedula, nombre_completo, correo, hash, rol_funcionario, tarjeta_profesional, telefono]
    );

    const usuario = result.rows[0];
    const token = jwt.sign(
      { id: usuario.id_funcionario, rol: usuario.rol_funcionario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({ token, rol: usuario.rol_funcionario, usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Login
const login = async (req, res) => {
  try {
    const { correo, password } = req.body;

    // Buscar usuario
    const result = await pool.query(
      'SELECT * FROM funcionario_ica WHERE correo = $1', [correo]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const usuario = result.rows[0];

    // Verificar contraseña
    const valido = await bcrypt.compare(password, usuario.auth_id);
    if (!valido)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    // Generar token
    const token = jwt.sign(
      { id: usuario.id_funcionario, rol: usuario.rol_funcionario },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, rol: usuario.rol_funcionario, usuario });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registro, login };