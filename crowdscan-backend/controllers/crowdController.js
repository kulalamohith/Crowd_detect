const Status = require("../models/Status");
const Location = require("../models/Location");
const mongoose = require("mongoose");
const generateRiskSummary = require("../utils/deepseekHelper");

// Ingest crowd data
exports.ingestCrowdData = async (req, res) => {
  try {
    const { locationId, gateId, density } = req.body;
    if (!locationId || !gateId || typeof density !== "number") {
      return res.status(400).json({ error: "locationId, gateId and density are required" });
    }

    await Status.create({ locationId, gateId, density });
    res.status(201).json({ message: "Crowd data recorded" });
  } catch (err) {
    console.error("Error saving crowd data:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get latest heatmap
exports.getHeatmap = async (req, res) => {
  try {
    const latest = await Status.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: "$gateId",
          density: { $first: "$density" },
          timestamp: { $first: "$timestamp" }
        }
      }
    ]);
    res.json(latest);
  } catch (err) {
    console.error("Error fetching heatmap:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get all zones
exports.getZones = async (req, res) => {
  try {
    const result = await mongoose.connection.db.collection("locations").find({}).toArray();
    console.log("Raw Mongo fetch:", result);
    res.json(result);
  } catch (err) {
    console.error("Error fetching zones:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};

// Get risk summary
exports.getRiskSummary = async (req, res) => {
  try {
    const officerMode = req.query.mode === "officer";
    // Step 1: Fetch last 3 density readings per gate
    const trendData = await Status.aggregate([
      { $sort: { timestamp: -1 } },
      {
        $group: {
          _id: {
            locationId: "$locationId",
            gateId: "$gateId"
          },
          densities: { $push: "$density" }
        }
      },
      {
        $project: {
          locationId: "$_id.locationId",
          gateId: "$_id.gateId",
          densities: { $slice: ["$densities", 3] }
        }
      }
    ]);

    // Step 2: Group gates under locations
    const locationMap = {};
    for (const entry of trendData) {
      const { locationId, gateId, densities } = entry;
      const latest = densities[0];
      const previous = densities[1] ?? latest;
      const trend = latest - previous;

      let tag = "Safe";
      if (latest >= 9 && trend >= 1.5) tag = "Stampede Risk";
      else if (latest >= 8) tag = "Hotspot";
      else if (latest < 6) tag = "Safe";

      if (!locationMap[locationId]) locationMap[locationId] = [];
      locationMap[locationId].push({
        gateId,
        latest: latest.toFixed(1),
        trend: trend.toFixed(2),
        tag
      });
    }

    // Step 3: Build text summary per location
    let zoneText = "";
    for (const [locationId, gates] of Object.entries(locationMap)) {
      zoneText += `📍 Location: ${locationId}\n`;
      for (const gate of gates) {
        zoneText += ` - Gate ${gate.gateId}: Density ${gate.latest}, Trend ${gate.trend}, Status: ${gate.tag}\n`;
      }
      zoneText += "\n";
    }

    // Prompt for AI
    const prompt = `
You are a real-time crowd safety assistant.

Here is current gate-level data grouped by location:
${zoneText}

Generate a short summary ${officerMode ? "(tone: for police)" : "(tone: public)"}:

Highlight risky/stampede zones

Suggest safe gates for evacuation

Use 3–4 lines max
`.trim();

    try {
      const summary = await generateRiskSummary(zoneText, prompt);
      res.json({ summary });
    } catch (err) {
      console.error("Error generating summary:", err.message);
      res.status(500).json({ error: "Internal server error" });
    }
  } catch (err) {
    console.error("Error in risk summary:", err.message);
    res.status(500).json({ error: "Internal server error" });
  }
};
