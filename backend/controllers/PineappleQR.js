const QRCode = require("qrcode");
const QRModel = require("../models/PineappleQR.js");
const { v4: uuidv4 } = require("uuid");

// CREATE + GENERATE QR
exports.createQRCode = async (req, res) => {
    try {
        const {
            batchId,
            warehouseId,
            fruitWeight,
            sizeGrade,
            marketPrice,
            aromaScore,
            sweetnessBrix,
            fruitLength,
            fruitWidth,
            fruitHeight,
            fruitRipenessScore,
            fruitQualityScore
        } = req.body;

        // Generate unique QR ID
        const qrId = uuidv4();

        const qrData = {
            qrId,
            batchId,
            warehouseId,
            fruitWeight,
            sizeGrade,
            marketPrice,
            aromaScore,
            sweetnessBrix,
            timestamp: new Date(),
            fruitLength,
            fruitWidth,
            fruitHeight,
            fruitRipenessScore,
            fruitQualityScore
        };

        // Generate QR image as Base64
        const qrImage = await QRCode.toDataURL(
            JSON.stringify(qrData)
        );

        // Save QR data to MongoDB
        const newQR = new QRModel({
            ...qrData,
            qrCodeImage: qrImage
        });

        await newQR.save();

        res.status(201).json({
            message: "QR Code Generated Successfully",
            data: newQR
        });

    } catch (error) {
        console.error("QR generation error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// GET ALL QR CODES
exports.getAllQRCodes = async (req, res) => {
    try {
        const data = await QRModel.find().sort({
            timestamp: -1
        });

        res.json(data);

    } catch (error) {
        console.error("Get QR codes error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// GET QR CODE BY MONGODB ID
exports.getQRCodeById = async (req, res) => {
    try {
        const data = await QRModel.findById(
            req.params.id
        );

        if (!data) {
            return res.status(404).json({
                message: "QR Code not found"
            });
        }

        res.json(data);

    } catch (error) {
        console.error("Get QR code error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};


// GET QR CODE BY QR ID
exports.getQRCodeByQRId = async (req, res) => {
    try {
        const data = await QRModel.findOne({
            qrId: req.params.qrId
        });

        if (!data) {
            return res.status(404).json({
                message: "QR Code not found"
            });
        }

        res.json(data);

    } catch (error) {
        console.error("Get QR code by QR ID error:", error);

        res.status(500).json({
            error: error.message
        });
    }
};