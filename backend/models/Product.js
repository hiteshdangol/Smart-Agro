const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  description: { type: String, default: '' },
  price: { type: Number, required: true, min: 0 },
  category: {
    type: String,
    required: true,
    enum: ['Sensor', 'Pesticide', 'Fertilizer', 'Tool', 'Seed', 'Other'],
  },
  stock: { type: Number, default: 0, min: 0 },
  seller: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer' },
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
}, { timestamps: true });

module.exports = mongoose.model('Product', productSchema);
