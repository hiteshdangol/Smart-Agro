const mongoose = require('mongoose');

const medicineSubSchema = new mongoose.Schema({
  type: { type: String },
  productName: String,
  description: String,
  applicationInstructions: String,
}, { _id: false });

const recordSchema = new mongoose.Schema({
  farmerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  type: { type: String, enum: ['crop', 'disease', 'recommendation'], required: true },

  // ── crop fields ──
  crop: String,
  cultivationDate: Date,
  quantity: Number,
  description: String,

  // ── disease fields ──
  diseaseName: String,
  diseaseCause: String,
  diseaseCure: String,
  confidence: Number,
  top3: [{ label: String, probability: Number }],
  imageBase64: String,
  medicines: [medicineSubSchema],
  purchasedProducts: [{
    productId: mongoose.Schema.Types.ObjectId,
    productName: String,
    price: Number,
    quantity: Number,
  }],

  // ── recommendation fields ──
  soilParams: {
    N: Number,
    P: Number,
    K: Number,
    ph: Number,
  },
  climateParams: {
    temperature: Number,
    humidity: Number,
    rainfall: Number,
  },
  recommendedCrop: String,
  recommendationConfidence: Number,
  recommendationWarning: {
    temperature_out_of_range: Boolean,
    training_range: String,
    message: String,
  },
}, { timestamps: true });

module.exports = mongoose.model('Record', recordSchema);
