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
    const { hora_fin } = req.body;
    const pool = require('../db/postgres');
    const result = await pool.query(
      `UPDATE visita_inspeccion SET hora_fin=$1, estado='Finalizada' 
       WHERE id_visita_inspeccion=$2 RETURNING *`,
      [hora_fin, id]
    );
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;