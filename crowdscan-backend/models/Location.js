const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
zoneId: { type: String, required: true },
zoneName: { type: String, required: true },
coordinates: {
lat: { type: Number, required: true },
lng: { type: Number, required: true },
}
}, { collection: "locations" }); 

module.exports = mongoose.model("Location", locationSchema);