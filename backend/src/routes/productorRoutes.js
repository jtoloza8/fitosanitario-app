const express = require('express');
const router = express.Router();
const {
  getProductores,
  getProductorById,
  createProductor,
  updateProductor,
  deleteProductor
} = require('../controllers/productorCtrl');

router.get('/', getProductores);
router.get('/:id', getProductorById);
router.post('/', createProductor);
router.put('/:id', updateProductor);
router.delete('/:id', deleteProductor);

module.exports = router;