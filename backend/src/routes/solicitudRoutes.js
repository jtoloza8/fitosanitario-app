const express = require('express');
const router = express.Router();
const {
  getSolicitudes,
  getSolicitudesByProductor,
  createSolicitud,
  aprobarSolicitud,
  rechazarSolicitud
} = require('../controllers/solicitudCtrl');

router.get('/', getSolicitudes);
router.get('/productor/:id', getSolicitudesByProductor);
router.post('/', createSolicitud);
router.patch('/:id/aprobar', aprobarSolicitud);
router.patch('/:id/rechazar', rechazarSolicitud);

module.exports = router;