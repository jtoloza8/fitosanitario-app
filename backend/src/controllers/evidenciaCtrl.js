const Evidencia = require('../models/Evidencia');

const getEvidencias = async (req, res) => {
  try {
    const evidencias = await Evidencia.find();
    res.json(evidencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const getEvidenciasByLugar = async (req, res) => {
  try {
    const { id } = req.params;
    const evidencias = await Evidencia.find({ id_lugar_produccion: id });
    res.json(evidencias);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const createEvidencia = async (req, res) => {
  try {
    const { id_lugar_produccion, tipo, nombre_archivo, url_archivo, observacion } = req.body;
    const evidencia = new Evidencia({
      id_lugar_produccion,
      tipo,
      nombre_archivo,
      url_archivo,
      observacion
    });
    await evidencia.save();
    res.status(201).json(evidencia);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

const deleteEvidencia = async (req, res) => {
  try {
    const { id } = req.params;
    await Evidencia.findByIdAndDelete(id);
    res.json({ mensaje: 'Evidencia eliminada correctamente' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

module.exports = { getEvidencias, getEvidenciasByLugar, createEvidencia, deleteEvidencia };