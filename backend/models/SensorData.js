const mongoose = require("mongoose");

const sensorSchema = new mongoose.Schema({
    qrId: {
        type: String,
        required: true
    },

    temperature: {
        type: Number
    },

    humidity: {
        type: Number
    },

    mq135: {
        type: Number,
        default: 0
    },

    freshnessScore: {
        type: Number
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model("SensorData", sensorSchema);