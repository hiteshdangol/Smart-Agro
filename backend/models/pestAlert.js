const mongoose = require('mongoose');

const pestAlertSchema = new mongoose.Schema({
  type: { type: String, required: true },
  crop: String,
  severity: String,
  description: String,
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], required: true } 
  },
  createdAt: { type: Date, default: Date.now }
});

pestAlertSchema.index({ location: '2dsphere' });

module.exports = mongoose.model('pestAlert', pestAlertSchema);
