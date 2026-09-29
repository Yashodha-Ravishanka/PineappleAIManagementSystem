const Pineapple = require("../models/Pineapple");

// Get all pineapples
exports.getAllPineapples = async (req, res) => {
  try {
    const pineapples = await Pineapple.find();
    res.json(pineapples);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Add a pineapple
exports.addPineapple = async (req, res) => {
  try {
    const pineapple = new Pineapple(req.body);
    const saved = await pineapple.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};