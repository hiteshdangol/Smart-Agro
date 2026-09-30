const express = require('express');
const router = express.Router();
const {
  placeOrder, getMyOrders, getAllOrders, updateOrderStatus,
  initiateEsewaPayment, verifyEsewaPayment, getPendingOrderCount,
} = require('../controllers/orderController');
const authMiddleware = require('../utils/authMiddleware');
const requirePermission = require('../utils/permissionMiddleware');
const requireActive = require('../utils/requireActive');

router.post('/', authMiddleware, requireActive, placeOrder);
router.get('/mine', authMiddleware, getMyOrders);
router.get('/pending-count', authMiddleware, getPendingOrderCount);
router.get('/', authMiddleware, requirePermission('orders:manage_all'), getAllOrders);
router.put('/:id/status', authMiddleware, requirePermission('orders:manage_all'), updateOrderStatus);
router.post('/esewa/initiate', authMiddleware, requireActive, initiateEsewaPayment);
router.post('/esewa/verify', authMiddleware, requireActive, verifyEsewaPayment);

module.exports = router;
