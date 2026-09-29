const express = require("express");
const router = express.Router();
const axios = require("axios");

const Pineapple = require("../models/Pineapple");

// AI SERVICE URL
const AI_URL = "http://127.0.0.1:5001/predict";


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
// ADD PINEAPPLE + AI PREDICTION
// ===============================

router.post("/add", async (req, res) => {

    console.log(
        "ADD ROUTE HIT"
    );

    try {

        // Send only AI-supported values
        const aiResponse = await axios.post(

            AI_URL,

            {
                temperature: Number(req.body.temperature),

                humidity: Number(req.body.humidity),

                storage_days: Number(
                    req.body.storage_days || 0
                )
            }

        );


        console.log(
            "AI RESULT:",
            aiResponse.data
        );


        // Save sensor + AI data
        // timestamp is automatically added by MongoDB
        const pineappleData = {

            batchId: req.body.batchId,

            temperature: Number(
                req.body.temperature
            ),

            humidity: Number(
                req.body.humidity
            ),

            mq135: Number(
                req.body.mq135 || 0
            ),

            storage_days: Number(
                req.body.storage_days || 0
            ),

            location: req.body.location,

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
            "FINAL OBJECT:",
            pineappleData
        );


        const pineapple =
            new Pineapple(
                pineappleData
            );


        const saved =
            await pineapple.save();


        res.json(saved);

    }

    catch (error) {

        console.log(
            "ADD ERROR:",
            error.message
        );

        res.status(500).json({
            message: error.message
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


        const aiResponse = await axios.post(

            AI_URL,

            {
                temperature: Number(
                    req.body.temperature
                ),

                humidity: Number(
                    req.body.humidity
                ),

                storage_days: Number(
                    req.body.storage_days || 0
                )
            }

        );


        console.log(
            "NEW AI RESULT:",
            aiResponse.data
        );


        const updateData = {

            temperature: Number(
                req.body.temperature
            ),

            humidity: Number(
                req.body.humidity
            ),

            mq135: Number(
                req.body.mq135 || 0
            ),

            storage_days: Number(
                req.body.storage_days || 0
            ),

            location: req.body.location,

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
            message: error.message
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
            message: error.message
        });

    }

});


// ===============================
// MANUAL AI PREDICTION
// ===============================

router.post("/predict", async (req, res) => {

    try {

        const response = await axios.post(

            AI_URL,

            {
                temperature: Number(
                    req.body.temperature
                ),

                humidity: Number(
                    req.body.humidity
                ),

                storage_days: Number(
                    req.body.storage_days || 0
                )
            }

        );


        res.json(response.data);

    }

    catch (error) {

        console.log(
            "AI ERROR:",
            error.message
        );

        res.status(500).json({
            message: "AI prediction failed"
        });

    }

});


module.exports = router;