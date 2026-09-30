const express = require('express');
const {
  registerFarmer,
  loginFarmer,
  getFarmerProfile,
  updateFarmerProfile,
  updatePassword,
} = require('../controllers/authController');
const authMiddleware = require('../utils/authMiddleware');
const router = express.Router();

router.post('/register', registerFarmer); // Register farmer
router.post('/login', loginFarmer); // Login farmer
router.get('/profile', authMiddleware, getFarmerProfile); // Fetch profile
router.put('/profile', authMiddleware, updateFarmerProfile); // Update profile
router.put('/update-password', authMiddleware, updatePassword); // Update password

module.exports = router;
