const QR = require("../models/PineappleQR.js");
const GPS = require("../models/GPSData.js");
const Sensor = require("../models/SensorData.js");

exports.getFullTrackingData = async (req, res) => {
    try {
        const { qrId } = req.params;

        const qr = await QR.findOne({ qrId });

        const gps = await GPS.find({
            qrId
        }).sort({
            timestamp: 1
        });

        const sensor = await Sensor.find({
            qrId
        }).sort({
            timestamp: 1
        });

        if (!qr) {
            return res.status(404).json({
                message: "QR Code not found"
            });
        }

        res.json({
            crateDetails: qr,
            gpsRoute: gps,
            sensorData: sensor
        });

    } catch (err) {
        console.error(
            "Full tracking error:",
            err
        );

        res.status(500).json({
            error: err.message
        });
    }
};