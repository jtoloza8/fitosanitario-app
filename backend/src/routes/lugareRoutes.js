const express = require('express');
const router = express.Router();
const {
  getLugares,
  getLugarById,
  createLugar,
  updateLugar,
  deleteLugar,
  aprobarLugar,
  rechazarLugar
} = require('../controllers/lugarCtrl');

router.get('/', getLugares);
router.get('/:id', getLugarById);
router.post('/', createLugar);
router.put('/:id', updateLugar);
router.delete('/:id', deleteLugar);
router.patch('/:id/aprobar', aprobarLugar);
router.patch('/:id/rechazar', rechazarLugar);

module.exports = router;