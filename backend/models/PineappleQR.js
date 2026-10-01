const mongoose = require("mongoose");

const qrCodeSchema = new mongoose.Schema(
    {
        qrId: {
            type: String,
            required: true,
            unique: true
        },

        batchId: {
            type: String,
            required: true
        },

        warehouseId: {
            type: String,
            required: true
        },

        timestamp: {
            type: Date,
            default: Date.now
        },

        fruitWeight: {
            type: Number,
            required: true
        },

        fruitLength: {
            type: Number,
            required: true
        },

        fruitWidth: {
            type: Number,
            required: true
        },

        fruitHeight: {
            type: Number,
            required: true
        },

        fruitRipenessScore: {
            type: Number,
            required: true
        },

        fruitQualityScore: {
            type: Number,
            required: true
        },

        sizeGrade: {
            type: String,
            required: true
        },

        marketPrice: {
            type: Number,
            required: true
        },

        aromaScore: {
            type: Number,
            required: true
        },

        sweetnessBrix: {
            type: Number,
            required: true
        },

        qrCodeImage: {
            type: String
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("QRCode", qrCodeSchema);