const Medicine = require('../models/Medicine');
const Product = require('../models/Product');

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getMedicinesByDisease = async (req, res) => {
  try {
    const { diseaseName } = req.params;
    const medicineDoc = await Medicine.findOne({ diseaseName });
    if (!medicineDoc) {
      return res.json({ success: true, diseaseName, medicines: [] });
    }
    res.json({ success: true, diseaseName, medicines: medicineDoc.medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getRecommendedProducts = async (req, res) => {
  try {
    const { diseaseName } = req.params;
    const medicineDoc = await Medicine.findOne({ diseaseName });
    if (!medicineDoc || !medicineDoc.medicines.length) {
      return res.json({ success: true, products: [] });
    }
    const productNames = medicineDoc.medicines
      .flatMap(m => [m.productName, ...(m.suggestedProductNames || [])])
      .filter(Boolean);
    if (!productNames.length) {
      return res.json({ success: true, products: [] });
    }
    const products = await Product.find({
      name: { $regex: new RegExp(productNames.map(escapeRegExp).join('|'), 'i') },
      approvalStatus: 'approved',
    });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
