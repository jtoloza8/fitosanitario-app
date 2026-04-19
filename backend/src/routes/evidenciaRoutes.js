const express = require('express');
const router = express.Router();
const {
  getEvidencias,
  getEvidenciasByLugar,
  createEvidencia,
  deleteEvidencia
} = require('../controllers/evidenciaCtrl');

router.get('/', getEvidencias);
router.get('/lugar/:id', getEvidenciasByLugar);
router.post('/', createEvidencia);
router.delete('/:id', deleteEvidencia);

module.exports = router;