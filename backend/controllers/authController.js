const Farmer = require('../models/Farmer');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

// Register farmer
exports.registerFarmer = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password'
      });
    }

    // Check if farmer already exists
    const existingFarmer = await Farmer.findOne({ email: email.toLowerCase() });
    if (existingFarmer) {
      return res.status(400).json({
        success: false,
        message: 'Farmer with this email already exists'
      });
    }

    // Create farmer
    const farmer = await Farmer.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: role || 'Farmer'
    });

    // Generate token
    const token = generateToken(farmer._id);

    // Send response (password is automatically excluded due to toJSON method)
    res.status(201).json({
      success: true,
      message: 'Farmer registered successfully',
      token,
      farmer
    });

  } catch (error) {
    // Handle mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map(err => err.message);
      return res.status(400).json({
        success: false,
        message: 'Validation Error',
        errors: messages
      });
    }

    // Handle duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: 'Email already exists'
      });
    }

    console.error('Registration error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during registration'
    });
  }
};

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// Login farmer
exports.loginFarmer = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Input validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide email and password'
      });
    }

    // Find farmer and explicitly include password for comparison
    const farmer = await Farmer.findOne({ email: email.toLowerCase().trim() }).select('+password');
    
    if (!farmer) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password using the instance method
    const isPasswordValid = await farmer.comparePassword(password);
    
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate token
    const token = generateToken(farmer._id);

    // Remove password from farmer object before sending
    farmer.password = undefined;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      token,
      farmer
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during login'
    });
  }
};

// Get farmer profile (bonus method)
exports.getProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.farmer.id);
    
    if (!farmer) {
      return res.status(404).json({
        success: false,
        message: 'Farmer not found'
      });
    }

    res.status(200).json({
      success: true,
      farmer
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// Fetch Farmer Profile
exports.getFarmerProfile = async (req, res) => {
  try {
    const farmer = await Farmer.findById(req.user.id).select('-password');
    res.json({ success: true, farmer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error fetching profile data.' });
  }
};

// Update Farmer Profile
exports.updateFarmerProfile = async (req, res) => {
  const { name, email, role, profilePicture } = req.body; // Include 'role' and 'profilePicture'
  try {
    const farmer = await Farmer.findById(req.user.id);
    if (!farmer) {
      return res.status(404).json({ success: false, message: 'Farmer not found.' });
    }
    farmer.name = name || farmer.name;
    farmer.email = email || farmer.email;
    farmer.role = role || farmer.role;
    farmer.profilePicture = profilePicture || farmer.profilePicture;

    const updatedFarmer = await farmer.save();
    res.json({ success: true, farmer: updatedFarmer });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Error updating profile data.' });
  }
};
