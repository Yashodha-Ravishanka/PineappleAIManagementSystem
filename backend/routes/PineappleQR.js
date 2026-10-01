const express = require("express");

const router = express.Router();

const qrController = require("../controllers/PineappleQR.js");

// Generate QR + Save
router.post("/generate", qrController.createQRCode);

// Get all QR codes
router.get("/", qrController.getAllQRCodes);

// Get QR code by QR ID
// Must be before /:id
router.get("/qr/:qrId", qrController.getQRCodeByQRId);

// Get by MongoDB ID
router.get("/:id", qrController.getQRCodeById);

module.exports = router;