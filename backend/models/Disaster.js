const mongoose = require('mongoose');

const alertSchema = new mongoose.Schema({
  title: String,
  summary: String,
  link: String,
  lat: Number,
  long: Number,
  eventDate: Date,
  eventId: { type: String, unique: true },
  location : {
    type : String,
  },
});

module.exports = mongoose.model('Disaster',alertSchema);