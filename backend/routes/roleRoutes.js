const express = require('express');
const router = express.Router();
const {
  getRoles, createRole, updateRole, deleteRole, getPermissionList,
} = require('../controllers/roleController');
const authMiddleware = require('../utils/authMiddleware');
const requirePermission = require('../utils/permissionMiddleware');

router.get('/permissions', authMiddleware, requirePermission('admin:access'), getPermissionList);
router.get('/', authMiddleware, getRoles);
router.post('/', authMiddleware, requirePermission('users:manage_role'), createRole);
router.put('/:id', authMiddleware, requirePermission('users:manage_role'), updateRole);
router.delete('/:id', authMiddleware, requirePermission('users:manage_role'), deleteRole);

module.exports = router;
