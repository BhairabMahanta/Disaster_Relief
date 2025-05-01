const mongoose = require("mongoose");

const contactSchema = new mongoose.Schema({
  name: String,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  }
});

module.exports = mongoose.model("EmergencyContact", contactSchema);
