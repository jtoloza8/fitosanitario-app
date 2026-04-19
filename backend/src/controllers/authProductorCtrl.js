const pool = require('../db/postgres');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const registroProductor = async (req, res) => {
  try {
    const { nombre_completo, identificacion, direccion, telefono, correo, password } = req.body;

    const existe = await pool.query(
      'SELECT * FROM productores WHERE correo = $1', [correo]
    );
    if (existe.rows.length > 0)
      return res.status(400).json({ error: 'El correo ya está registrado' });

    const hash = await bcrypt.hash(password, 10);

    const result = await pool.query(
      `INSERT INTO productores 
        (nombre_completo, identificacion, direccion, telefono, correo, password_hash)
       VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
      [nombre_completo, identificacion, direccion, telefono, correo, hash]
    );

    const productor = result.rows[0];
    const token = jwt.sign(
      { id: productor.id_productor, rol: 'Productor' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.status(201).json({ token, rol: 'Productor', usuario: productor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const loginProductor = async (req, res) => {
  try {
    const { correo, password } = req.body;

    const result = await pool.query(
      'SELECT * FROM productores WHERE correo = $1', [correo]
    );
    if (result.rows.length === 0)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const productor = result.rows[0];
    const valido = await bcrypt.compare(password, productor.password_hash);
    if (!valido)
      return res.status(401).json({ error: 'Correo o contraseña incorrectos' });

    const token = jwt.sign(
      { id: productor.id_productor, rol: 'Productor' },
      process.env.JWT_SECRET,
      { expiresIn: '8h' }
    );

    res.json({ token, rol: 'Productor', usuario: productor });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { registroProductor, loginProductor };