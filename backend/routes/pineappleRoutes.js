const express = require("express");
const axios = require("axios");

const Pineapple = require("../models/Pineapple");
const WarehouseEnvironment = require("../models/WarehouseEnvironment");

const router = express.Router();

// ==========================================
// CONFIGURATION
// ==========================================

const AI_URL =
process.env.AI_URL ||
"http://127.0.0.1:5001/predict";

// ==========================================
// GET ALL PINEAPPLES
// ==========================================

router.get("/all", async (req, res) => {
try {
const pineapples = await Pineapple.find()
.sort({ timestamp: -1 });


    res.json(pineapples);

} catch (error) {
    console.error("GET ALL ERROR:", error);

    res.status(500).json({
        success: false,
        message: error.message
    });
}


});

// ==========================================
// GET LATEST WAREHOUSE ENVIRONMENT
// ==========================================

router.get("/environment/latest", async (req, res) => {


try {

    const warehouseId =
        req.query.warehouseId || "WH-001";

    const environment =
        await WarehouseEnvironment
            .findOne({ warehouseId })
            .sort({ timestamp: -1 });

    if (!environment) {

        return res.status(404).json({
            success: false,
            message:
                "No warehouse sensor data available. Please connect the ESP32."
        });
    }

    res.json({
        success: true,
        warehouseId: environment.warehouseId,
        temperature: environment.temperature,
        humidity: environment.humidity,
        mq135: environment.mq135,
        location: environment.location,
        timestamp: environment.timestamp
    });

} catch (error) {

    console.error(
        "LATEST ENVIRONMENT ERROR:",
        error
    );

    res.status(500).json({
        success: false,
        message: error.message
    });
}


});

// ==========================================
// ESP32 ENVIRONMENT DATA
// ==========================================

router.post("/environment", async (req, res) => {


try {

    const temperature =
        Number(req.body.temperature);

    const humidity =
        Number(req.body.humidity);

    const mq135 =
        Number(req.body.mq135 || 0);

    const warehouseId =
        req.body.warehouseId || "WH-001";

    const location =
        req.body.location || "Gampaha";


    // Validate sensor values

    if (
        Number.isNaN(temperature) ||
        Number.isNaN(humidity)
    ) {

        return res.status(400).json({
            success: false,
            message:
                "Temperature and humidity must be numbers."
        });
    }


    // Save sensor reading

    const environment =
        new WarehouseEnvironment({

            warehouseId,

            temperature,

            humidity,

            mq135,

            location,

            timestamp: new Date()
        });


    const savedEnvironment =
        await environment.save();


    // Also update existing batches
    // belonging to this warehouse

    const environmentUpdate =
        await Pineapple.updateMany(

            { warehouseId },

            {
                $set: {

                    temperature,

                    humidity,

                    mq135,

                    location,

                    timestamp: new Date()
                }
            }
        );


    console.log(
        "ENVIRONMENT SAVED:",
        savedEnvironment
    );

    console.log(
        "WAREHOUSE BATCHES MATCHED:",
        environmentUpdate.matchedCount
    );

    console.log(
        "WAREHOUSE BATCHES UPDATED:",
        environmentUpdate.modifiedCount
    );


    res.json({

        success: true,

        message:
            "Warehouse environment saved successfully",

        warehouseId,

        temperature,

        humidity,

        mq135,

        location,

        matchedBatches:
            environmentUpdate.matchedCount,

        updatedBatches:
            environmentUpdate.modifiedCount,

        sensorReading:
            savedEnvironment

    });

} catch (error) {

    console.error(
        "ENVIRONMENT ERROR:",
        error
    );

    res.status(500).json({

        success: false,

        message:
            error.message

    });
}


});

// ==========================================
// ADD PINEAPPLE BATCH
// ==========================================

router.post("/add", async (req, res) => {


try {

    console.log("================================");
    console.log("ADD PINEAPPLE ROUTE");
    console.log("================================");


    const warehouseId =
        req.body.warehouseId || "WH-001";

    const storageDays =
        Number(req.body.storage_days || 0);

    const location =
        req.body.location || "Gampaha";


    // ======================================
    // GET LATEST SENSOR DATA
    // ======================================

    const environment =
        await WarehouseEnvironment
            .findOne({ warehouseId })
            .sort({ timestamp: -1 });


    if (!environment) {

        return res.status(400).json({

            success: false,

            message:
                "No warehouse temperature/humidity data available. Connect the ESP32 and send sensor data before adding a pineapple batch."

        });
    }


    const temperature =
        Number(environment.temperature);

    const humidity =
        Number(environment.humidity);

    const mq135 =
        Number(environment.mq135 || 0);


    console.log(
        "LATEST SENSOR TEMPERATURE:",
        temperature
    );

    console.log(
        "LATEST SENSOR HUMIDITY:",
        humidity
    );

    console.log(
        "LATEST SENSOR MQ135:",
        mq135
    );


    // ======================================
    // PHOTO AI DATA
    // ======================================

    const photoQualityGrade =
        req.body.qualityGrade || "Pending";

    const photoQualityScore =
        req.body.qualityScore !== undefined &&
        req.body.qualityScore !== null
            ? Number(req.body.qualityScore)
            : 0;


    console.log(
        "PHOTO AI GRADE:",
        photoQualityGrade
    );

    console.log(
        "PHOTO AI CONFIDENCE:",
        photoQualityScore
    );


    // ======================================
    // ENVIRONMENTAL AI
    // ======================================

    const aiResponse =
        await axios.post(

            AI_URL,

            {
                temperature,

                humidity,

                mq135,

                storage_days:
                    storageDays
            }
        );


    console.log(
        "ENVIRONMENTAL AI RESULT:",
        aiResponse.data
    );


    // ======================================
    // CREATE PINEAPPLE
    // ======================================

    const pineappleData = {

        batchId:
            req.body.batchId ||
            "MANUAL-BATCH",

        warehouseId,

        temperature,

        humidity,

        mq135,

        storage_days:
            storageDays,

        location,

        // Environmental AI
        quality:
            aiResponse.data.quality ||
            "Pending",

        riskLevel:
            aiResponse.data.risk ||
            "Pending",

        recommendation:
            aiResponse.data.recommendation ||
            "Monitor batch",

        // Photo AI
        qualityGrade:
            photoQualityGrade,

        qualityScore:
            photoQualityScore,

        timestamp:
            new Date()
    };


    console.log(
        "FINAL PINEAPPLE DATA:",
        pineappleData
    );


    const pineapple =
        new Pineapple(pineappleData);


    const saved =
        await pineapple.save();


    console.log(
        "PINEAPPLE SAVED:",
        saved
    );


    res.json({

        success: true,

        message:
            "Pineapple batch added successfully",

        savedReading:
            saved

    });


} catch (error) {

    console.error(
        "ADD ERROR:",
        error
    );

    res.status(500).json({

        success: false,

        message:
            error.message

    });
}


});

// ==========================================
// UPDATE PINEAPPLE
// ==========================================

router.put("/:id", async (req, res) => {


try {

    const updateData = {

        ...(req.body.batchId
            ? {
                batchId:
                    req.body.batchId
            }
            : {}),

        ...(req.body.storage_days !== undefined
            ? {
                storage_days:
                    Number(
                        req.body.storage_days
                    )
            }
            : {}),

        ...(req.body.location
            ? {
                location:
                    req.body.location
            }
            : {}),

        ...(req.body.qualityGrade
            ? {
                qualityGrade:
                    req.body.qualityGrade
            }
            : {}),

        ...(req.body.qualityScore !== undefined
            ? {
                qualityScore:
                    Number(
                        req.body.qualityScore
                    )
            }
            : {})
    };


    const updated =
        await Pineapple.findByIdAndUpdate(

            req.params.id,

            {
                $set: updateData
            },

            {
                new: true,
                runValidators: true
            }
        );


    if (!updated) {

        return res.status(404).json({

            success: false,

            message:
                "Pineapple batch not found"

        });
    }


    res.json({

        success: true,

        message:
            "Pineapple updated successfully",

        data:
            updated

    });


} catch (error) {

    console.error(
        "UPDATE ERROR:",
        error
    );

    res.status(500).json({

        success: false,

        message:
            error.message

    });
}


});

// ==========================================
// DELETE PINEAPPLE
// ==========================================

router.delete("/:id", async (req, res) => {


try {

    const deleted =
        await Pineapple.findByIdAndDelete(
            req.params.id
        );


    if (!deleted) {

        return res.status(404).json({

            success: false,

            message:
                "Pineapple batch not found"

        });
    }


    res.json({

        success: true,

        message:
            "Pineapple deleted successfully"

    });


} catch (error) {

    console.error(
        "DELETE ERROR:",
        error
    );

    res.status(500).json({

        success: false,

        message:
            error.message

    });
}


});

// ==========================================
// ENVIRONMENTAL AI PREDICTION
// ==========================================

router.post("/predict", async (req, res) => {


try {

    const response =
        await axios.post(

            AI_URL,

            {
                temperature:
                    Number(
                        req.body.temperature
                    ),

                humidity:
                    Number(
                        req.body.humidity
                    ),

                mq135:
                    Number(
                        req.body.mq135 || 0
                    ),

                storage_days:
                    Number(
                        req.body.storage_days || 0
                    )
            }
        );


    res.json(
        response.data
    );


} catch (error) {

    console.error(
        "PREDICTION ERROR:",
        error.message
    );

    res.status(500).json({

        success: false,

        message:
            "Environmental AI prediction failed"

    });
}


});

module.exports = router;
