const mongoose = require("mongoose");

const pineappleSchema = new mongoose.Schema({

    // ==========================================
    // BATCH INFORMATION
    // ==========================================

    batchId: {
        type: String,
        required: true
    },

    // Warehouse identifier
    warehouseId: {
        type: String,
        required: true,
        default: "WH-001"
    },


    // ==========================================
    // SENSOR DATA
    // ==========================================

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

    storage_days: {
        type: Number,
        required: true
    },


    // ==========================================
    // AI RESULTS
    // ==========================================

    // AI predicted quality
    // Example: Good / Average / Bad
    quality: {
        type: String,
        default: "Pending"
    },

    // AI calculated quality grade
    // Example: A / B / C / D
    qualityGrade: {
        type: String,
        default: "Pending"
    },

    // AI confidence/quality score
    // Can be used if the AI service returns a numerical score
    qualityScore: {
        type: Number,
        default: 0
    },

    // AI calculated risk
    // Example: Low / Medium / High
    riskLevel: {
        type: String,
        default: "Pending"
    },

    // AI recommendation
    recommendation: {
        type: String,
        default: "Monitor batch"
    },


    // ==========================================
    // LOCATION
    // ==========================================

    // GPS coordinates or warehouse location
    location: {
        type: String,
        required: true
    },


    // ==========================================
    // TIMESTAMP
    // ==========================================

    timestamp: {
        type: Date,
        default: Date.now
    }

});

module.exports = mongoose.model("Pineapple", pineappleSchema);