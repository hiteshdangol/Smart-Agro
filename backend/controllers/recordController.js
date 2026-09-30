const Record = require('../models/Record');
const Farmer = require('../models/Farmer');

exports.getRecords = async (req, res) => {
  try {
    const records = await Record.find({ farmerId: req.user.id }).sort({ createdAt: -1 });
    res.json({ success: true, records });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to fetch records.' });
  }
};

exports.addRecord = async (req, res) => {
  try {
    const {
      type, crop, cultivationDate, quantity, description,
      diseaseName, diseaseCause, diseaseCure, confidence, top3, imageBase64, medicines, purchasedProducts,
      soilParams, climateParams, recommendedCrop, recommendationConfidence, recommendationWarning,
    } = req.body;

    if (!type) return res.status(400).json({ success: false, message: 'Record type is required' });

    const record = await Record.create({
      farmerId: req.user.id, type,
      crop, cultivationDate, quantity, description,
      diseaseName, diseaseCause, diseaseCure, confidence, top3, imageBase64, medicines, purchasedProducts,
      soilParams, climateParams, recommendedCrop, recommendationConfidence, recommendationWarning,
    });
    res.status(201).json({ success: true, record });
  } catch (error) {
    res.status(400).json({ success: false, message: 'Failed to add record.', error: error.message });
  }
};

exports.addPurchaseToRecord = async (req, res) => {
  try {
    const { product } = req.body;
    if (!product || !product.productId) {
      return res.status(400).json({ success: false, message: 'Product info required' });
    }
    const record = await Record.findOne({ _id: req.params.id, farmerId: req.user.id });
    if (!record) return res.status(404).json({ success: false, message: 'Record not found' });
    if (record.type !== 'disease') {
      return res.status(400).json({ success: false, message: 'Purchases can only be added to disease records' });
    }
    record.purchasedProducts.push({
      productId: product.productId,
      productName: product.productName,
      price: product.price,
      quantity: product.quantity || 1,
    });
    await record.save();
    res.json({ success: true, record });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update record.', error: error.message });
  }
};

exports.getAllfarmer = async (req, res) => {
  try {
    const farmers = await Farmer.find();
    return res.status(200).json(farmers);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.deleteFarmer = async (req, res) => {
  try {
    const email = req.params.email;
    const user = await Farmer.findOne({ email });
    if (!user) return res.status(404).send('User not found');
    if (user.role === 'Admin') return res.status(403).send('Cannot delete admin users');
    await Farmer.findByIdAndDelete(user._id);
    return res.status(200).send('User deleted successfully');
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.getAllCrop = async (req, res) => {
  try {
    const crops = await Record.find();
    return res.status(200).send(crops);
  } catch (err) {
    return res.status(500).send(err.message);
  }
};

exports.deleteCrop = async (req, res) => {
  try {
    if (req.user.role !== 'Admin') return res.status(403).send('Only admins can delete crop records');
    const record = await Record.findByIdAndDelete(req.params.id);
    if (!record) return res.status(404).send('Crop record not found');
    return res.status(200).send('Crop record deleted successfully');
  } catch (err) {
    return res.status(500).send(err.message);
  }
};
