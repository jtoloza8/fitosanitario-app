const express = require('express');
const router = express.Router();
const {
  getFuncionarios,
  getFuncionarioById,
  createFuncionario,
  updateFuncionario,
  deleteFuncionario
} = require('../controllers/funcionarioCtrl');

router.get('/', getFuncionarios);
router.get('/:id', getFuncionarioById);
router.post('/', createFuncionario);
router.put('/:id', updateFuncionario);
router.delete('/:id', deleteFuncionario);

module.exports = router;