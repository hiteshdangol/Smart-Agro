const express = require('express');
const { addRecord, getAllfarmer, deleteFarmer, getAllCrop, getRecords, deleteCrop, addPurchaseToRecord } = require('../controllers/recordController');
const authMiddleware = require('../utils/authMiddleware');
const requirePermission = require('../utils/permissionMiddleware');

const router = express.Router();

router.get('/', authMiddleware, getRecords);
router.post('/', authMiddleware, addRecord);
router.post('/:id/purchase', authMiddleware, addPurchaseToRecord);
router.get("/getAllFarmer", authMiddleware, requirePermission('users:view'), getAllfarmer);
router.delete("/deleteFarmer/:email", authMiddleware, requirePermission('users:delete'), deleteFarmer);
router.get("/getAllCrop", authMiddleware, requirePermission('records:view_all'), getAllCrop);
router.delete("/deleteCrop/:id", authMiddleware, deleteCrop);

module.exports = router;
