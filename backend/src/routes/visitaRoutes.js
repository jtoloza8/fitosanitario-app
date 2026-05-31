const express = require('express');
const router = express.Router();
const {
  getVisitas,
  getVisitaById,
  createVisita,
  updateVisita,
  deleteVisita,
  aprobarVisita,
  rechazarVisita
} = require('../controllers/visitaCtrl');

router.get('/', getVisitas);
router.get('/:id', getVisitaById);
router.post('/', createVisita);
router.put('/:id', updateVisita);
router.delete('/:id', deleteVisita);
router.patch('/:id/aprobar', aprobarVisita);
router.patch('/:id/rechazar', rechazarVisita);
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const {
      hora_fin,
      condicion_cultivo,
      riesgo_fitosanitario,
      medidas_recomendadas,
      conclusion_inspector,
      proxima_visita_sugerida,
    } = req.body;
    const pool = require('../db/postgres');
    const result = await pool.query(
      `UPDATE visita_inspeccion SET
        hora_fin=$1, estado='Finalizada',
        condicion_cultivo=$2, riesgo_fitosanitario=$3,
        medidas_recomendadas=$4, conclusion_inspector=$5,
        proxima_visita_sugerida=$6
       WHERE id_visita_inspeccion=$7 RETURNING *`,
      [
        hora_fin,
        condicion_cultivo || null,
        riesgo_fitosanitario || null,
        medidas_recomendadas || null,
        conclusion_inspector || null,
        proxima_visita_sugerida || null,
        id,
      ]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;