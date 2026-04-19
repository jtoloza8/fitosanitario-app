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

module.exports = router;