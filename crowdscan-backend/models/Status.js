//Stores crowd data per zone

const mongoose = require("mongoose");

const statusSchema = new mongoose.Schema({
zoneId: { type: String, required: true },
density: { type: Number, required: true }, // From 0 to 10
timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Status", statusSchema);