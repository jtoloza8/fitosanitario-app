const express = require('express');
const router = express.Router();
const { registro, login } = require('../controllers/authCtrl');
const { registroProductor, loginProductor } = require('../controllers/authProductorCtrl');

router.post('/registro', registro);
router.post('/login', login);
router.post('/registro-productor', registroProductor);
router.post('/login-productor', loginProductor);

module.exports = router;