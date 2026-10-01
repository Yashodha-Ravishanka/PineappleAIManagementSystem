const mongoose = require('mongoose');

const gpsSchema = new mongoose.Schema({
    qrId: {
        type: String,
        required: true
    },
    latitude: Number,
    longitude: Number,
    speed: Number,
    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('GPSData', gpsSchema);