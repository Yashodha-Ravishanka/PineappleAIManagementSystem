const express = require('express');
const router = express.Router();
const gpsController = require('../controllers/GPSData.js');

router.post('/add', gpsController.addGPSData);
router.get('/:qrId', gpsController.getRouteByQR);

module.exports = router;