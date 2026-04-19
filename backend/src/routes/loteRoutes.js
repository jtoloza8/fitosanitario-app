const express = require('express')
const router = express.Router()
const { getLotes, getLoteById, getLotesByLugar, createLote, updateLote, deleteLote } = require('../controllers/loteCtrl')

router.get('/', getLotes)
router.get('/lugar/:id', getLotesByLugar)
router.get('/:id', getLoteById)
router.post('/', createLote)
router.put('/:id', updateLote)
router.delete('/:id', deleteLote)

module.exports = router