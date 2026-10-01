const GPSData = require('../models/GPSData.js');

exports.addGPSData = async (req, res) => {
    try {
        const data = new GPSData(req.body);
        await data.save();
        res.json({ message: "GPS data saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getRouteByQR = async (req, res) => {
    try {
        const { qrId } = req.params;

        const data = await GPSData.find({ qrId }).sort({ timestamp: 1 });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};