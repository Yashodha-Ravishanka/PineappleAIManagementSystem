
const Pineapple = require("../models/Pineapple");


// =====================================================
// AI / QUALITY CALCULATION
// =====================================================

function calculateQuality(data) {

    const temperature = Number(data.temperature);
    const humidity = Number(data.humidity);
    const mq135 = Number(data.mq135 || 0);
    const storageDays = Number(data.storage_days);


    // -------------------------------------------------
    // TEMPERATURE SCORE - 25 points
    // -------------------------------------------------

    let temperatureScore = 0;

    if (temperature >= 10 && temperature <= 13) {
        temperatureScore = 25;
    }
    else if (temperature >= 8 && temperature <= 15) {
        temperatureScore = 20;
    }
    else if (temperature >= 5 && temperature <= 18) {
        temperatureScore = 10;
    }


    // -------------------------------------------------
    // HUMIDITY SCORE - 25 points
    // -------------------------------------------------

    let humidityScore = 0;

    if (humidity >= 85 && humidity <= 95) {
        humidityScore = 25;
    }
    else if (humidity >= 75 && humidity <= 100) {
        humidityScore = 20;
    }
    else if (humidity >= 65 && humidity <= 100) {
        humidityScore = 10;
    }


    // -------------------------------------------------
    // STORAGE DAYS SCORE - 25 points
    // -------------------------------------------------

    let storageScore = 0;

    if (storageDays >= 0 && storageDays <= 5) {
        storageScore = 25;
    }
    else if (storageDays <= 10) {
        storageScore = 20;
    }
    else if (storageDays <= 15) {
        storageScore = 10;
    }


    // -------------------------------------------------
    // MQ135 SCORE - 25 points
    //
    // This threshold should be calibrated using your
    // actual MQ135 sensor readings.
    // -------------------------------------------------

    let mq135Score = 0;

    if (mq135 <= 300) {
        mq135Score = 25;
    }
    else if (mq135 <= 500) {
        mq135Score = 20;
    }
    else if (mq135 <= 700) {
        mq135Score = 10;
    }


    // -------------------------------------------------
    // TOTAL QUALITY SCORE
    // -------------------------------------------------

    const qualityScore =
        temperatureScore +
        humidityScore +
        storageScore +
        mq135Score;


    // -------------------------------------------------
    // QUALITY
    // -------------------------------------------------

    let quality = "Bad";

    if (qualityScore >= 75) {
        quality = "Good";
    }
    else if (qualityScore >= 50) {
        quality = "Average";
    }


    // -------------------------------------------------
    // QUALITY GRADE
    // -------------------------------------------------

    let qualityGrade = "D";

    if (qualityScore >= 90) {
        qualityGrade = "A";
    }
    else if (qualityScore >= 75) {
        qualityGrade = "B";
    }
    else if (qualityScore >= 60) {
        qualityGrade = "C";
    }


    // -------------------------------------------------
    // RISK LEVEL
    // -------------------------------------------------

    let riskLevel = "High";

    if (qualityScore >= 80) {
        riskLevel = "Low";
    }
    else if (qualityScore >= 60) {
        riskLevel = "Medium";
    }


    // -------------------------------------------------
    // RECOMMENDATION
    // -------------------------------------------------

    let recommendation = "Immediate inspection recommended.";

    if (riskLevel === "Low") {
        recommendation =
            "Storage conditions are suitable. Continue monitoring the batch.";
    }
    else if (riskLevel === "Medium") {
        recommendation =
            "Monitor temperature, humidity and gas levels closely.";
    }
    else {
        recommendation =
            "Check storage conditions and inspect the pineapple batch for possible deterioration.";
    }


    return {
        quality,
        qualityGrade,
        riskLevel,
        recommendation,
        qualityScore
    };
}


// =====================================================
// GET ALL PINEAPPLES
// =====================================================

exports.getAllPineapples = async (req, res) => {

    try {

        const pineapples = await Pineapple.find();

        res.json(pineapples);

    }
    catch (err) {

        res.status(500).json({
            message: err.message
        });

    }

};


// =====================================================
// ADD PINEAPPLE
// =====================================================

exports.addPineapple = async (req, res) => {

    try {

        const prediction = calculateQuality(req.body);

        const pineapple = new Pineapple({

            ...req.body,

            ...prediction

        });

        const saved = await pineapple.save();

        res.status(201).json(saved);

    }
    catch (err) {

        res.status(400).json({
            message: err.message
        });

    }

};


// =====================================================
// UPDATE PINEAPPLE
// =====================================================

exports.updatePineapple = async (req, res) => {

    try {

        const prediction = calculateQuality(req.body);

        const updated = await Pineapple.findByIdAndUpdate(

            req.params.id,

            {

                ...req.body,

                ...prediction,

                timestamp: new Date()

            },

            {
                new: true,
                runValidators: true
            }

        );

        if (!updated) {

            return res.status(404).json({
                message: "Pineapple batch not found"
            });

        }

        res.json(updated);

    }
    catch (err) {

        res.status(400).json({
            message: err.message
        });

    }

};