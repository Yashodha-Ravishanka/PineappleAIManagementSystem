const mongoose = require("mongoose");

const pineappleSchema = new mongoose.Schema({

  batchId: {
    type: String,
    required: true
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

  storage_days: {
    type: Number,
    required: true
  },

  quality: {
    type: String,
    default: "Pending"
  },

  riskLevel: {
    type: String,
    default: "Pending"
  },

  recommendation: {
    type: String,
    default: "Monitor batch"
  },

  location: {
    type: String,
    required: true
  },

  timestamp: {
    type: Date,
    default: Date.now
  }

});

module.exports = mongoose.model(
  "Pineapple",
  pineappleSchema
);