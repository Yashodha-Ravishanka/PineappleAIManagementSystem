const express = require("express");
const router = express.Router();
const axios = require("axios");

const Pineapple = require("../models/Pineapple");

// AI SERVICE URL
const AI_URL =
    process.env.AI_URL ||
    "http://127.0.0.1:5001/predict";

// ===============================
// GET ALL PINEAPPLES
// ===============================

router.get("/all", async (req, res) => {

    try {

        const data = await Pineapple.find()
            .sort({ timestamp: 1 });

        res.json(data);

    }
    catch (error) {

        console.log(
            "GET ERROR:",
            error.message
        );

        res.status(500).json({
            message: error.message
        });

    }

});


// ===============================
// ADD PINEAPPLE BATCH
// ===============================
// Used for adding a new pineapple batch.
// This route creates a new document.

router.post("/add", async (req, res) => {

    console.log("ADD ROUTE HIT");

    try {

        const temperature =
            Number(req.body.temperature);

        const humidity =
            Number(req.body.humidity);

        const warehouseId =
            req.body.warehouseId || "WH-001";

        const location =
            req.body.location || "Gampaha";


        console.log(
            "WAREHOUSE:",
            warehouseId
        );

        console.log(
            "TEMPERATURE:",
            temperature
        );

        console.log(
            "HUMIDITY:",
            humidity
        );

        console.log(
            "LOCATION:",
            location
        );


        // =====================================
        // AI PREDICTION
        // =====================================

        const aiResponse =
            await axios.post(

                AI_URL,

                {
                    temperature: temperature,

                    humidity: humidity,

                    storage_days:
                        Number(
                            req.body.storage_days || 0
                        )
                }

            );


        console.log(
            "AI RESULT:",
            aiResponse.data
        );


        // =====================================
        // UPDATE EXISTING WAREHOUSE BATCHES
        // =====================================

        const environmentUpdate =
            await Pineapple.updateMany(

                {
                    warehouseId:
                        warehouseId
                },

                {
                    $set: {

                        temperature:
                            temperature,

                        humidity:
                            humidity

                    }
                }

            );


        console.log(
            "WAREHOUSE BATCHES MATCHED:",
            environmentUpdate.matchedCount
        );

        console.log(
            "WAREHOUSE BATCHES UPDATED:",
            environmentUpdate.modifiedCount
        );


        // =====================================
        // SAVE NEW PINEAPPLE BATCH
        // =====================================

        const pineappleData = {

            batchId:
                req.body.batchId ||
                "MANUAL-BATCH",

            warehouseId:
                warehouseId,

            temperature:
                temperature,

            humidity:
                humidity,

            mq135:
                Number(
                    req.body.mq135 || 0
                ),

            storage_days:
                Number(
                    req.body.storage_days || 0
                ),

            location:
                location,

            quality:
                aiResponse.data.quality ||
                "Pending",

            riskLevel:
                aiResponse.data.risk ||
                "Pending",

            recommendation:
                aiResponse.data.recommendation ||
                "Monitor batch"

        };


        console.log(
            "FINAL PINEAPPLE OBJECT:",
            pineappleData
        );


        const pineapple =
            new Pineapple(
                pineappleData
            );


        const saved =
            await pineapple.save();


        console.log(
            "SAVED TO MONGODB ATLAS:",
            saved
        );


        res.json({

            success: true,

            message:
                "Pineapple batch added successfully",

            savedReading:
                saved,

            environmentUpdate: {

                warehouseId:
                    warehouseId,

                matchedBatches:
                    environmentUpdate.matchedCount,

                updatedBatches:
                    environmentUpdate.modifiedCount

            }

        });

    }

    catch (error) {

        console.log(
            "ADD ERROR:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


// ===============================
// UPDATE WAREHOUSE ENVIRONMENT
// ===============================
// Used by ESP32.
// DOES NOT create a new document.
// Updates all batches belonging to
// the specified warehouse.

router.post("/environment", async (req, res) => {

    console.log(
        "ENVIRONMENT ROUTE HIT"
    );

    try {

        const temperature =
            Number(
                req.body.temperature
            );

        const humidity =
            Number(
                req.body.humidity
            );

        const mq135 =
            Number(
                req.body.mq135 || 0
            );

        const warehouseId =
            req.body.warehouseId ||
            "WH-001";

        const location =
            req.body.location ||
            "Gampaha";


        console.log(
            "WAREHOUSE:",
            warehouseId
        );

        console.log(
            "TEMPERATURE:",
            temperature
        );

        console.log(
            "HUMIDITY:",
            humidity
        );

        console.log(
            "MQ135:",
            mq135
        );

        console.log(
            "LOCATION:",
            location
        );


        // =====================================
        // UPDATE ALL BATCHES IN WAREHOUSE
        // =====================================

        const environmentUpdate =
            await Pineapple.updateMany(

                {
                    warehouseId:
                        warehouseId
                },

                {
                    $set: {

                        temperature:
                            temperature,

                        humidity:
                            humidity,

                        mq135:
                            mq135,

                        location:
                            location,

                        timestamp:
                            new Date()

                    }

                }

            );


        console.log(
            "WAREHOUSE BATCHES MATCHED:",
            environmentUpdate.matchedCount
        );

        console.log(
            "WAREHOUSE BATCHES UPDATED:",
            environmentUpdate.modifiedCount
        );


        // =====================================
        // RESPONSE
        // =====================================

        res.json({

            success: true,

            message:
                "Warehouse environment updated",

            warehouseId:
                warehouseId,

            temperature:
                temperature,

            humidity:
                humidity,

            mq135:
                mq135,

            location:
                location,

            matchedBatches:
                environmentUpdate.matchedCount,

            updatedBatches:
                environmentUpdate.modifiedCount

        });

    }

    catch (error) {

        console.log(
            "ENVIRONMENT UPDATE ERROR:",
            error.message
        );

        res.status(500).json({

            success: false,

            message:
                error.message

        });

    }

});


// ===============================
// UPDATE PINEAPPLE + AI RECALCULATE
// ===============================

router.put("/:id", async (req, res) => {

    console.log(
        "UPDATE ROUTE HIT"
    );

    try {

        console.log(
            "NEW DATA:",
            req.body
        );


        const aiResponse =
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

                    storage_days:
                        Number(
                            req.body.storage_days ||
                            0
                        )

                }

            );


        console.log(
            "NEW AI RESULT:",
            aiResponse.data
        );


        const updateData = {

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
                ),

            location:
                req.body.location,

            quality:
                aiResponse.data.quality ||
                "Pending",

            riskLevel:
                aiResponse.data.risk ||
                "Pending",

            recommendation:
                aiResponse.data.recommendation ||
                "Monitor batch"

        };


        const updated =
            await Pineapple.findByIdAndUpdate(

                req.params.id,

                updateData,

                {
                    returnDocument: "after"
                }

            );


        console.log(
            "UPDATED DATABASE:",
            updated
        );


        res.json(updated);

    }

    catch (error) {

        console.log(
            "UPDATE ERROR:",
            error.message
        );

        res.status(500).json({

            message:
                error.message

        });

    }

});


// ===============================
// DELETE PINEAPPLE
// ===============================

router.delete("/:id", async (req, res) => {

    try {

        const deleted =
            await Pineapple.findByIdAndDelete(
                req.params.id
            );


        res.json(deleted);

    }

    catch (error) {

        console.log(
            "DELETE ERROR:",
            error.message
        );

        res.status(500).json({

            message:
                error.message

        });

    }

});


// ===============================
// MANUAL AI PREDICTION
// ===============================

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

                    storage_days:
                        Number(
                            req.body.storage_days ||
                            0
                        )

                }

            );


        res.json(
            response.data
        );

    }

    catch (error) {

        console.log(
            "AI ERROR:",
            error.message
        );

        res.status(500).json({

            message:
                "AI prediction failed"

        });

    }

});


module.exports = router;
