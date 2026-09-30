const mongoose = require('mongoose');

const medicineEntrySchema = new mongoose.Schema({
  type: { type: String, enum: ['chemical', 'organic'], required: true },
  productName: { type: String, required: true },
  description: { type: String, default: '' },
  applicationInstructions: { type: String, default: '' },
  suggestedProductNames: [{ type: String }],
  price: { type: Number, min: 0 },
  stock: { type: Number, min: 0, default: 0 },
}, { _id: true });

const medicineSchema = new mongoose.Schema({
  diseaseName: { type: String, required: true, unique: true },
  medicines: [medicineEntrySchema],
}, { timestamps: true });

module.exports = mongoose.model('Medicine', medicineSchema);
