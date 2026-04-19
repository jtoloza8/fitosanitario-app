const mongoose = require('mongoose');

const evidenciaSchema = new mongoose.Schema({
  id_lugar_produccion: { type: Number, required: true },
  tipo: { type: String, required: true }, // 'certificado', 'foto', 'observacion'
  nombre_archivo: { type: String },
  url_archivo: { type: String },
  observacion: { type: String },
  fecha_subida: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Evidencia', evidenciaSchema);