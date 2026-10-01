const mongoose = require("mongoose");

const warehouseEnvironmentSchema = new mongoose.Schema(
{
warehouseId: {
type: String,
required: true,
default: "WH-001"
},

    temperature: {
        type: Number,
        required: true
    },

    humidity: {
        type: Number,
        required: true
    },

    mq135: {
        type: Number,
        default: 0
    },

    location: {
        type: String,
        default: "Gampaha"
    },

    timestamp: {
        type: Date,
        default: Date.now
    }
},
{
    timestamps: true
}

);

module.exports = mongoose.model(
"WarehouseEnvironment",
warehouseEnvironmentSchema
);
