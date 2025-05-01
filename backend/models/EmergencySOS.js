const mongoose = require("mongoose");

const emergencySOSSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  audioPath: String,
  location: {
    lat: Number,
    lng: Number
  },
  status: { type: String, default: "pending" },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model("EmergencySOS", emergencySOSSchema);
