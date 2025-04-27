const mongoose = require('mongoose');

const missionSchema = new mongoose.Schema({
  baseLat: Number,
  baseLon: Number,
  targetLat: Number,
  targetLon: Number,
  currentLat: Number,
  currentLon: Number,
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  status: { type: String, enum: ['Pending', 'In Progress', 'Completed'], default: 'Pending' },
  createdAt: { type: Date, default: Date.now },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // reference to user
});

const Mission = mongoose.model('Mission', missionSchema);

module.exports = Mission;
