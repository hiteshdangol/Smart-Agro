const express = require('express');
const router = express.Router();
const {
  getProducts, getProduct, createProduct, updateProduct, deleteProduct, getMyProducts,
} = require('../controllers/productController');
const authMiddleware = require('../utils/authMiddleware');
const requirePermission = require('../utils/permissionMiddleware');
const requireActive = require('../utils/requireActive');

router.get('/', getProducts);
router.get('/mine', authMiddleware, getMyProducts);
router.get('/:id', getProduct);
router.post('/', authMiddleware, requireActive, createProduct);
router.put('/:id', authMiddleware, requireActive, requirePermission.loadPermissions, updateProduct);
router.delete('/:id', authMiddleware, requireActive, requirePermission.loadPermissions, deleteProduct);

module.exports = router;
