const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { generateToken } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Validation rules
const registerValidation = [
  body('firstName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, and one number')
];

const loginValidation = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

// @route   POST /api/auth/register
// @desc    Register a new user
// @access  Public
router.post('/register', registerValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { firstName, lastName, email, password, preferences, faceDescriptor } = req.body;

  // Check if user already exists
  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      status: 'error',
      message: 'User with this email already exists'
    });
  }

  // Create new user
  const user = await User.create({
    firstName,
    lastName,
    email,
    password,
    preferences: preferences || {},
    faceDescriptor: faceDescriptor || null
  });

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  user.loginMethod = 'email';
  await user.save();

  res.status(201).json({
    status: 'success',
    message: 'User registered successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        progress: user.progress
      },
      token
    }
  });
}));

// @route   POST /api/auth/login
// @desc    Login user
// @access  Public
router.post('/login', loginValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { email, password } = req.body;

  // Find user and include password for comparison
  const user = await User.findOne({ email }).select('+password');
  
  if (!user) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  if (!user.isActive) {
    return res.status(401).json({
      status: 'error',
      message: 'Account is deactivated'
    });
  }

  // Check password
  const isPasswordValid = await user.comparePassword(password);
  if (!isPasswordValid) {
    return res.status(401).json({
      status: 'error',
      message: 'Invalid credentials'
    });
  }

  // Generate token
  const token = generateToken(user._id);

  // Update last login
  user.lastLogin = new Date();
  user.loginMethod = 'email';
  await user.save();

  res.json({
    status: 'success',
    message: 'Login successful',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        progress: user.progress
      },
      token
    }
  });
}));

// @route   POST /api/auth/face-login
// @desc    Login user with face recognition
// @access  Public
router.post('/face-login', asyncHandler(async (req, res) => {
  const { faceDescriptor } = req.body;

  if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
    return res.status(400).json({
      status: 'error',
      message: 'Face descriptor is required'
    });
  }

  // Find user by face descriptor (simplified comparison)
  const users = await User.find({ faceDescriptor: { $exists: true, $ne: null } });
  
  let matchedUser = null;
  let bestMatch = 0;
  const threshold = 0.6; // Similarity threshold

  for (const user of users) {
    if (user.faceDescriptor && user.faceDescriptor.length === faceDescriptor.length) {
      // Calculate similarity (Euclidean distance)
      const similarity = calculateSimilarity(faceDescriptor, user.faceDescriptor);
      if (similarity > threshold && similarity > bestMatch) {
        bestMatch = similarity;
        matchedUser = user;
      }
    }
  }

  if (!matchedUser) {
    return res.status(401).json({
      status: 'error',
      message: 'Face not recognized'
    });
  }

  if (!matchedUser.isActive) {
    return res.status(401).json({
      status: 'error',
      message: 'Account is deactivated'
    });
  }

  // Generate token
  const token = generateToken(matchedUser._id);

  // Update last login
  matchedUser.lastLogin = new Date();
  matchedUser.loginMethod = 'face';
  await matchedUser.save();

  res.json({
    status: 'success',
    message: 'Face login successful',
    data: {
      user: {
        id: matchedUser._id,
        firstName: matchedUser.firstName,
        lastName: matchedUser.lastName,
        email: matchedUser.email,
        avatar: matchedUser.avatar,
        preferences: matchedUser.preferences,
        progress: matchedUser.progress
      },
      token,
      similarity: bestMatch
    }
  });
}));

// @route   POST /api/auth/logout
// @desc    Logout user
// @access  Private
router.post('/logout', (req, res) => {
  res.json({
    status: 'success',
    message: 'Logged out successfully'
  });
});

// @route   GET /api/auth/me
// @desc    Get current user
// @access  Private
router.get('/me', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.json({
    status: 'success',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        progress: user.progress,
        lastLogin: user.lastLogin
      }
    }
  });
}));

// Helper function to calculate similarity between face descriptors
function calculateSimilarity(descriptor1, descriptor2) {
  if (descriptor1.length !== descriptor2.length) {
    return 0;
  }

  let sumSquaredDiff = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sumSquaredDiff += diff * diff;
  }

  const distance = Math.sqrt(sumSquaredDiff);
  // Convert distance to similarity (0-1 scale)
  return Math.max(0, 1 - distance / Math.sqrt(descriptor1.length));
}

module.exports = router; 