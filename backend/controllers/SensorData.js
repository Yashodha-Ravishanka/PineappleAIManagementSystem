const SensorData = require('../models/SensorData.js');

exports.addSensorData = async (req, res) => {
    try {
        const data = new SensorData(req.body);
        await data.save();
        res.json({ message: "Sensor data saved" });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.getSensorData = async (req, res) => {
    try {
        const { qrId } = req.params;

        const data = await SensorData.find({ qrId });

        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};