const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/Analytics.js');

router.get('/full/:qrId', analyticsController.getFullTrackingData);

module.exports = router;