const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const pineappleRoutes = require("./routes/pineappleRoutes");

const app = express();

// ================================
// Middleware
// ================================
app.use(cors());
app.use(express.json());

// ================================
// Routes
// ================================
app.use("/api/pineapple", pineappleRoutes);

app.get("/test", (req, res) => {
    res.send("test works");
});

app.get("/", (req, res) => {
    res.send("Pineapple AI Backend Running");
});

// ================================
// MongoDB Connection
// ================================
mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => {
        console.log("MongoDB Connected");
    })
    .catch((err) => {
        console.error("MongoDB Connection Error:", err);
    });

mongoose.connection.on("connected", () => {
    console.log("Mongoose connection established");
});

mongoose.connection.on("error", (err) => {
    console.error("Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.log("Mongoose disconnected");
});

// ================================
// Server
// ================================
const PORT = process.env.PORT || 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on port ${PORT}`);
});
