const Farmer = require('../models/Farmer');
const Product = require('../models/Product');
const Order = require('../models/Order');
const Medicine = require('../models/Medicine');
const Wishlist = require('../models/Wishlist');

exports.getFarmers = async (req, res) => {
  try {
    const farmers = await Farmer.aggregate([
      { $match: { role: { $ne: 'Admin' } } },
      { $sort: { createdAt: -1 } },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: 'seller',
          as: 'products',
        },
      },
      {
        $addFields: {
          productCount: { $size: '$products' },
        },
      },
      {
        $project: {
          password: 0,
          permissionsOverride: 0,
          products: 0,
        },
      },
    ]);
    res.json({ success: true, farmers });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.toggleBlockUser = async (req, res) => {
  try {
    const user = await Farmer.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.json({ success: true, isBlocked: user.isBlocked });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyFarmer = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['verified', 'suspended', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const farmer = await Farmer.findByIdAndUpdate(
      req.params.id,
      { verificationStatus: status },
      { new: true }
    ).select('-password');
    if (!farmer) return res.status(404).json({ success: false, message: 'Farmer not found' });
    res.json({ success: true, farmer });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveProduct = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['approved', 'rejected', 'pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { approvalStatus: status },
      { new: true }
    ).populate('seller', 'name');
    if (!product) return res.status(404).json({ success: false, message: 'Product not found' });
    res.json({ success: true, product });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAdminProducts = async (req, res) => {
  try {
    const filter = {};
    if (req.query.approvalStatus) filter.approvalStatus = req.query.approvalStatus;
    const products = await Product.find(filter)
      .populate('seller', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, products });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllAdminOrders = async (req, res) => {
  try {
    const orders = await Order.find()
      .populate('buyer', 'name email')
      .sort({ createdAt: -1 });
    res.json({ success: true, orders });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllMedicines = async (req, res) => {
  try {
    const { search } = req.query;
    const filter = {};
    if (search) filter.diseaseName = { $regex: search, $options: 'i' };
    const medicines = await Medicine.find(filter).sort({ diseaseName: 1 });
    res.json({ success: true, medicines });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createMedicine = async (req, res) => {
  try {
    const { diseaseName, medicines } = req.body;
    if (!diseaseName) {
      return res.status(400).json({ success: false, message: 'diseaseName is required' });
    }
    const existing = await Medicine.findOne({ diseaseName });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Medicine entry for this disease already exists' });
    }
    const medicineDoc = await Medicine.create({ diseaseName, medicines: medicines || [] });
    await syncMedicineProducts(medicines || []);
    res.status(201).json({ success: true, medicine: medicineDoc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.updateMedicine = async (req, res) => {
  try {
    const { diseaseName } = req.params;
    const { medicines } = req.body;
    const medicineDoc = await Medicine.findOneAndUpdate(
      { diseaseName },
      { medicines },
      { new: true, runValidators: true }
    );
    if (!medicineDoc) {
      return res.status(404).json({ success: false, message: 'Medicine entry not found' });
    }
    await syncMedicineProducts(medicines || []);
    res.json({ success: true, medicine: medicineDoc });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

exports.deleteMedicine = async (req, res) => {
  try {
    const { diseaseName } = req.params;
    const medicineDoc = await Medicine.findOneAndDelete({ diseaseName });
    if (!medicineDoc) {
      return res.status(404).json({ success: false, message: 'Medicine entry not found' });
    }
    res.json({ success: true, message: 'Medicine entry deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

function escapeRegExp(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

exports.getAllWishlist = async (req, res) => {
  try {
    const { status, search } = req.query;
    const filter = {};
    if (status && ['pending', 'fulfilled', 'rejected'].includes(status)) {
      filter.status = status;
    }
    if (search) {
      filter.$or = [
        { medicineName: { $regex: search, $options: 'i' } },
        { diseaseName: { $regex: search, $options: 'i' } },
        { userName: { $regex: search, $options: 'i' } },
        { userEmail: { $regex: search, $options: 'i' } },
      ];
    }
    const wishlist = await Wishlist.find(filter).sort({ createdAt: -1 });
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateWishlistStatus = async (req, res) => {
  try {
    const { status } = req.body;
    if (!['pending', 'fulfilled', 'rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }
    const wishlist = await Wishlist.findByIdAndUpdate(
      req.params.id,
      { status, readByUser: false },
      { new: true }
    );
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }
    res.json({ success: true, wishlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.approveWishlist = async (req, res) => {
  try {
    const wishlist = await Wishlist.findById(req.params.id);
    if (!wishlist) {
      return res.status(404).json({ success: false, message: 'Wishlist item not found' });
    }
    if (wishlist.status === 'fulfilled') {
      return res.status(400).json({ success: false, message: 'Wishlist item already fulfilled' });
    }

    const price = Number(req.body.price);
    const stock = Number(req.body.stock);
    if (!Number.isFinite(price) || price <= 0) {
      return res.status(400).json({ success: false, message: 'A valid price greater than 0 is required' });
    }
    if (!Number.isFinite(stock) || stock < 0) {
      return res.status(400).json({ success: false, message: 'A valid stock amount is required' });
    }

    const name = (req.body.name || wishlist.medicineName || '').trim();
    if (!name) {
      return res.status(400).json({ success: false, message: 'Product name is required' });
    }
    const description = req.body.description || '';
    const category = (req.body.category || (wishlist.type === 'chemical' ? 'Pesticide' : 'Other'));

    let product = await Product.findOne({
      name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
    });
    if (product) {
      product.description = description || product.description;
      product.price = price;
      product.stock = stock;
      product.category = category;
      product.approvalStatus = 'approved';
      await product.save();
    } else {
      product = await Product.create({
        name,
        description,
        price,
        stock,
        category,
        approvalStatus: 'approved',
        seller: req.user._id,
      });
    }

    wishlist.status = 'fulfilled';
    wishlist.productId = product._id;
    wishlist.readByUser = false;
    await wishlist.save();

    res.json({ success: true, wishlist, product });
  } catch (error) {
    res.status(400).json({ success: false, message: error.message });
  }
};

// Creates or updates an approved shop Product for each medicine entry that has a price.
async function syncMedicineProducts(medicines) {
  for (const med of medicines) {
    const name = (med.productName || '').trim();
    const price = Number(med.price);
    if (!name || !Number.isFinite(price) || price <= 0) continue;
    const stock = Number.isFinite(Number(med.stock)) ? Number(med.stock) : 0;
    const category = med.type === 'chemical' ? 'Pesticide' : 'Other';
    const existing = await Product.findOne({
      name: { $regex: new RegExp(`^${escapeRegExp(name)}$`, 'i') },
    });
    if (existing) {
      await Product.findByIdAndUpdate(existing._id, {
        description: med.description || existing.description,
        price,
        stock,
        category: existing.category || category,
        approvalStatus: 'approved',
      });
    } else {
      await Product.create({
        name,
        description: med.description || '',
        price,
        stock,
        category,
        approvalStatus: 'approved',
      });
    }
  }
}
