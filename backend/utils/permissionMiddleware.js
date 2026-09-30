const Role = require('../models/Role');

const loadPermissions = async (req, res, next) => {
  try {
    const role = await Role.findOne({ name: req.user.role });
    const rolePerms = role ? role.permissions : [];
    const merged = new Set([...rolePerms, ...(req.user.permissionsOverride || [])]);
    req.permissions = [...merged];
    next();
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

const requirePermission = (...requiredPerms) => {
  return async (req, res, next) => {
    try {
      const role = await Role.findOne({ name: req.user.role });
      const rolePerms = role ? role.permissions : [];

      const merged = new Set([...rolePerms, ...(req.user.permissionsOverride || [])]);
      req.permissions = [...merged];

      const hasAll = requiredPerms.every(p => merged.has(p));
      if (!hasAll) {
        return res.status(403).json({ success: false, message: 'Insufficient permissions' });
      }

      next();
    } catch (error) {
      res.status(500).json({ success: false, message: error.message });
    }
  };
};

module.exports = requirePermission;
module.exports.loadPermissions = loadPermissions;
