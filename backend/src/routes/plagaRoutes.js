const express = require('express');
const router = express.Router();
const {
  getPlagas,
  getPlagaById,
  createPlaga,
  updatePlaga,
  deletePlaga
} = require('../controllers/plagaCtrl');

router.get('/', getPlagas);
router.get('/:id', getPlagaById);
router.post('/', createPlaga);
router.put('/:id', updatePlaga);
router.delete('/:id', deletePlaga);

module.exports = router;