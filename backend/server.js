const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./src/db/postgres.js');
const conectarMongo = require('./src/db/mongo');

// Rutas
const lugarRoutes = require('./src/routes/lugareRoutes');
const funcionarioRoutes = require('./src/routes/funcionarioRoutes');
const productorRoutes = require('./src/routes/productorRoutes');
const plagaRoutes = require('./src/routes/plagaRoutes');
const loteRoutes = require('./src/routes/loteRoutes');
const visitaRoutes = require('./src/routes/visitaRoutes');
const detalleRoutes = require('./src/routes/detalleRoutes');
const evidenciaRoutes = require('./src/routes/evidenciaRoutes');
const authRoutes = require('./src/routes/authRoutes');
const path = require('path');
const uploadRoutes = require('./src/routes/uploadRoutes');
const solicitudRoutes = require('./src/routes/solicitudRoutes');

const app = express();
app.use(cors());
app.use(express.json());

// Conectar MongoDB
conectarMongo();

app.get('/', (req, res) => {
  res.json({ mensaje: 'Servidor ICA funcionando ✅' });
});

app.use('/api/lugares', lugarRoutes);
app.use('/api/funcionarios', funcionarioRoutes);
app.use('/api/productores', productorRoutes);
app.use('/api/plagas', plagaRoutes);
app.use('/api/lotes', loteRoutes);
app.use('/api/visitas', visitaRoutes);
app.use('/api/detalles', detalleRoutes);
app.use('/api/evidencias', evidenciaRoutes);
app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/upload', uploadRoutes);
app.use('/api/solicitudes', solicitudRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});