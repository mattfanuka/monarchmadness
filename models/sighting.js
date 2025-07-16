const mongoose = require('mongoose');

const SightingSchema = new mongoose.Schema({
  latitude: Number,
  longitude: Number,
  date: Date,
  environment: String,
  lifeStage: String,
});

module.exports = mongoose.model('Sighting', SightingSchema);