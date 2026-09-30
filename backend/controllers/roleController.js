const Role = require('../models/Role');
const { PERMISSION_LIST } = require('../utils/permissions');

exports.getRoles = async (req, res) => {
  try {
    const roles = await Role.find().sort({ createdAt: -1 });
    res.json({ success: true, roles });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.createRole = async (req, res) => {
  try {
    const { name, description, permissions, isDefault } = req.body;
    if (!name) return res.status(400).json({ success: false, message: 'Role name is required' });
    const role = await Role.create({ name, description, permissions: permissions || [], isDefault: !!isDefault });
    res.status(201).json({ success: true, role });
  } catch (error) {
    if (error.code === 11000) return res.status(400).json({ success: false, message: 'Role already exists' });
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { name, description, permissions, isDefault } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, description, permissions, isDefault },
      { new: true, runValidators: true }
    );
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, role });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ success: false, message: 'Role not found' });
    res.json({ success: true, message: 'Role deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getPermissionList = async (req, res) => {
  res.json({ success: true, permissions: PERMISSION_LIST });
};
