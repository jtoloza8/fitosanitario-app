const express = require('express');
const router = express.Router();
const {
  getLugares,
  getLugarById,
  createLugar,
  updateLugar,
  deleteLugar
} = require('../controllers/lugarCtrl');

router.get('/', getLugares);
router.get('/:id', getLugarById);
router.post('/', createLugar);
router.put('/:id', updateLugar);
router.delete('/:id', deleteLugar);

module.exports = router;