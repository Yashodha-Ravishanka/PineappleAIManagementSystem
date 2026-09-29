const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const pineappleRoutes = require("./routes/pineappleRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use("/api/pineapple", pineappleRoutes);
app.get("/test", (req,res)=>{
    res.send("test works");
});

// MongoDB Connection
mongoose.connect("mongodb://127.0.0.1:27017/pineappleAI")
.then(() => {
    console.log("MongoDB Connected");
})
.catch((err) => {
    console.log("MongoDB Error:", err);
});

// Test API
app.get("/", (req, res) => {
    res.send("Pineapple AI Backend Running");
});

// Server
const PORT = 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});