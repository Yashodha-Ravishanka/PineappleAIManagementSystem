const express = require('express');
const router = express.Router();
const sensorController = require('../controllers/SensorData.js');

router.post('/add', sensorController.addSensorData);
router.get('/:qrId', sensorController.getSensorData);

module.exports = router;