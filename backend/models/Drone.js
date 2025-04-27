const mongoose = require('mongoose');

const droneSchema = new mongoose.Schema({
  droneId: { type: String, required: true, unique: true },
  currentLocation: {
    lat: Number,
    lon: Number
  },
  status: { type: String, enum: ['Idle', 'In Mission', 'Returning', 'Charging'], default: 'Idle' },
  battery: { type: Number, default: 100 }, // in percentage
  assignedMission: { type: mongoose.Schema.Types.ObjectId, ref: 'Mission', default: null }
});

module.exports = mongoose.model('Drone', droneSchema);
