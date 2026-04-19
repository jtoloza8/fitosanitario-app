const express = require('express');
const router = express.Router();
const { upload, subirArchivo } = require('../controllers/uploadCtrl');

router.post('/', upload.single('archivo'), subirArchivo);

module.exports = router;