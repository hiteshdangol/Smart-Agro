const Farmer = require('../models/Farmer');
const Role = require('../models/Role');

exports.getAllUsers = async (req, res) => {
  try {
    const users = await Farmer.find().select('-password').sort({ createdAt: -1 });
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const roleDoc = await Role.findOne({ name: role });
    if (!roleDoc) return res.status(400).json({ success: false, message: 'Invalid role' });
    const user = await Farmer.findByIdAndUpdate(req.params.id, { role }, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateUserPermissions = async (req, res) => {
  try {
    const { permissionsOverride } = req.body;
    const user = await Farmer.findByIdAndUpdate(
      req.params.id,
      { permissionsOverride: permissionsOverride || [] },
      { new: true }
    ).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
