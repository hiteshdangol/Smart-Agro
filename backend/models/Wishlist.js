const mongoose = require('mongoose');

const wishlistSchema = new mongoose.Schema({
  medicineName: { type: String, required: true, trim: true },
  diseaseName: { type: String, default: '', trim: true },
  type: { type: String, enum: ['chemical', 'organic'], default: 'chemical' },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'Farmer', required: true },
  userName: { type: String, default: '', trim: true },
  userEmail: { type: String, default: '', trim: true },
  status: {
    type: String,
    enum: ['pending', 'fulfilled', 'rejected'],
    default: 'pending',
  },
  productId: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  readByUser: { type: Boolean, default: false },
}, { timestamps: true });

module.exports = mongoose.model('Wishlist', wishlistSchema);
