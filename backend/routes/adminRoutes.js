const express = require('express');
const router = express.Router();
const {
  getFarmers, toggleBlockUser, verifyFarmer,
  approveProduct, getAllAdminProducts, getAllAdminOrders,
  getAllMedicines, createMedicine, updateMedicine, deleteMedicine,
  getAllWishlist, updateWishlistStatus, approveWishlist,
} = require('../controllers/adminController');
const authMiddleware = require('../utils/authMiddleware');
const requirePermission = require('../utils/permissionMiddleware');

router.get('/farmers', authMiddleware, requirePermission('admin:access'), getFarmers);
router.put('/users/:id/block', authMiddleware, requirePermission('admin:access'), toggleBlockUser);
router.put('/farmers/:id/verify', authMiddleware, requirePermission('admin:access'), verifyFarmer);
router.get('/products', authMiddleware, requirePermission('admin:access'), getAllAdminProducts);
router.put('/products/:id/approve', authMiddleware, requirePermission('admin:access'), approveProduct);
router.get('/orders', authMiddleware, requirePermission('admin:access'), getAllAdminOrders);
router.get('/medicines', authMiddleware, requirePermission('medicines:manage'), getAllMedicines);
router.post('/medicines', authMiddleware, requirePermission('medicines:manage'), createMedicine);
router.put('/medicines/:diseaseName', authMiddleware, requirePermission('medicines:manage'), updateMedicine);
router.delete('/medicines/:diseaseName', authMiddleware, requirePermission('medicines:manage'), deleteMedicine);
router.get('/wishlist', authMiddleware, requirePermission('medicines:manage'), getAllWishlist);
router.put('/wishlist/:id/status', authMiddleware, requirePermission('medicines:manage'), updateWishlistStatus);
router.post('/wishlist/:id/approve', authMiddleware, requirePermission('medicines:manage'), approveWishlist);

module.exports = router;
