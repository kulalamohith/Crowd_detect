//for postAPI Ingest Crowd Data

const Status = require("../models/Status");
const Location = require("../models/Location");
const mongoose = require("mongoose");
const generateRiskSummary = require("../utils/deepseekHelper");

exports.ingestCrowdData = async (req, res) => {
try {
const { zoneId, density } = req.body;
if (!zoneId || typeof density !== "number") {
  return res.status(400).json({ error: "zoneId and density are required" });
}

await Status.create({ zoneId, density });

res.status(201).json({ message: "Crowd data recorded " });
} catch (err) {
console.error("Error saving crowd data:", err.message);
res.status(500).json({ error: "Internal server error" });
}
};

exports.getHeatmap = async (req, res) => {
try {
const latest = await Status.aggregate([
{ $sort: { timestamp: -1 } },
{
$group: {
_id: "$zoneId",
density: { $first: "$density" },
timestamp: { $first: "$timestamp" }
}
}
]);
res.json(latest);
} catch (err) {
console.error(" Error fetching heatmap:", err.message);
res.status(500).json({ error: "Internal server error" });
}
};

exports.getZones = async (req, res) => {
try {
const result = await mongoose.connection.db.collection("locations").find({}).toArray();
console.log(" Raw Mongo fetch:", result);
res.json(result);
} catch (err) {
console.error(" Error fetching zones:", err.message);
res.status(500).json({ error: "Internal server error" });
}
};

exports.getRiskSummary = async (req, res) => {
try {
const latest = await Status.aggregate([
{ $sort: { timestamp: -1 } },
{
$group: {
_id: "$zoneId",
density: { $first: "$density" },
},
},
]);
const summary = await generateRiskSummary(latest);
res.json({ summary });
} catch (err) {
console.error(" Error generating summary:", err.message);
res.status(500).json({ error: "Internal server error" });
}
};







