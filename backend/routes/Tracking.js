const express = require("express");

const router = express.Router();

const trackingController = require(
    "../controllers/Tracking.js"
);

router.get(
    "/:qrId",
    trackingController.getFullTrackingData
);

module.exports = router;