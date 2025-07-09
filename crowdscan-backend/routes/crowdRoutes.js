const express = require("express");
const router = express.Router();

const { ingestCrowdData,getHeatmap, getZones, getRiskSummary } = require("../controllers/crowdController");


router.post("/crowd-data", ingestCrowdData);
router.get("/heatmap", getHeatmap);
router.get("/zones", getZones);
router.get("/risk-summary", getRiskSummary);

module.exports = router;
