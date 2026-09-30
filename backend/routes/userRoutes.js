const express = require('express');
const router = express.Router();
const {
  getAllUsers, updateUserRole, updateUserPermissions,
} = require('../controllers/userController');
const authMiddleware = require('../utils/authMiddleware');
const requirePermission = require('../utils/permissionMiddleware');

router.get('/', authMiddleware, requirePermission('users:view'), getAllUsers);
router.put('/:id/role', authMiddleware, requirePermission('users:manage_role'), updateUserRole);
router.put('/:id/permissions', authMiddleware, requirePermission('users:manage_permissions'), updateUserPermissions);

module.exports = router;
