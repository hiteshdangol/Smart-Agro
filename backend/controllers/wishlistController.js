const Wishlist = require('../models/Wishlist');

exports.addWishlistItem = async (req, res) => {
  try {
    const { medicineName, diseaseName = '', type = 'chemical' } = req.body;
    if (!medicineName || !medicineName.trim()) {
      return res.status(400).json({ success: false, message: 'medicineName is required' });
    }
    const user = req.user;
    const existing = await Wishlist.findOne({
      user: user._id,
      medicineName: medicineName.trim(),
      diseaseName,
    });
    if (existing) {
      return res.status(200).json({ success: true, wishlist: existing, alreadyAdded: true });
    }
    const wishlist = await Wishlist.create({
      medicineName: medicineName.trim(),
      diseaseName,
      type,
      user: user._id,
      userName: user.name || '',
      userEmail: user.email || '',
    });
    res.status(201).json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getMyWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.find({ user: req.user._id })
      .sort({ createdAt: -1 });
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getUnreadCount = async (req, res) => {
  try {
    const count = await Wishlist.countDocuments({
      user: req.user._id,
      status: { $ne: 'pending' },
      readByUser: false,
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.markWishlistRead = async (req, res) => {
  try {
    await Wishlist.updateMany(
      { user: req.user._id, status: { $ne: 'pending' }, readByUser: false },
      { $set: { readByUser: true } }
    );
    res.json({ success: true, message: 'Marked as read' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPendingCount = async (req, res) => {
  try {
    const count = await Wishlist.countDocuments({
      user: req.user._id,
      status: 'pending',
    });
    res.json({ success: true, count });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.removeWishlistItem = async (req, res) => {
  try {
    const wishlist = await Wishlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }
    res.json({ success: true, message: 'Wishlist item removed' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
