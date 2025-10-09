const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads/faces');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'face-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    // Check file type
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// @route   POST /api/face-recognition/detect
// @desc    Detect faces in uploaded image
// @access  Public
router.post('/detect', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No image file provided'
    });
  }

  try {
    // In a real implementation, you would use face-api.js or similar library
    // For now, we'll simulate face detection
    const faceData = await simulateFaceDetection(req.file.path);
    
    res.json({
      status: 'success',
      message: 'Face detected successfully',
      data: {
        faceDescriptor: faceData.descriptor,
        faceCount: faceData.count,
        confidence: faceData.confidence,
        imagePath: req.file.path
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    throw error;
  }
}));

// @route   POST /api/face-recognition/compare
// @desc    Compare two face descriptors
// @access  Public
router.post('/compare', asyncHandler(async (req, res) => {
  const { descriptor1, descriptor2 } = req.body;

  if (!descriptor1 || !descriptor2) {
    return res.status(400).json({
      status: 'error',
      message: 'Both face descriptors are required'
    });
  }

  if (!Array.isArray(descriptor1) || !Array.isArray(descriptor2)) {
    return res.status(400).json({
      status: 'error',
      message: 'Face descriptors must be arrays'
    });
  }

  try {
    const similarity = calculateFaceSimilarity(descriptor1, descriptor2);
    const isMatch = similarity > 0.6; // Threshold for face matching

    res.json({
      status: 'success',
      data: {
        similarity,
        isMatch,
        threshold: 0.6
      }
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Failed to compare faces',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}));

// @route   POST /api/face-recognition/register
// @desc    Register a new face for a user
// @access  Private
router.post('/register', upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: 'error',
      message: 'No image file provided'
    });
  }

  try {
    // Detect face in the uploaded image
    const faceData = await simulateFaceDetection(req.file.path);
    
    if (faceData.count === 0) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        status: 'error',
        message: 'No face detected in the image'
      });
    }

    if (faceData.count > 1) {
      // Clean up uploaded file
      if (fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      return res.status(400).json({
        status: 'error',
        message: 'Multiple faces detected. Please upload an image with only one face.'
      });
    }

    // Update user's face descriptor
    const User = require('../models/User');
    const user = await User.findByIdAndUpdate(
      req.user.id,
      { 
        faceDescriptor: faceData.descriptor,
        avatar: req.file.path // Store the image path as avatar
      },
      { new: true }
    );

    res.json({
      status: 'success',
      message: 'Face registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          avatar: user.avatar
        },
        faceData: {
          confidence: faceData.confidence,
          descriptorLength: faceData.descriptor.length
        }
      }
    });
  } catch (error) {
    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }
    
    throw error;
  }
}));

// @route   DELETE /api/face-recognition/register
// @desc    Remove face registration for a user
// @access  Private
router.delete('/register', asyncHandler(async (req, res) => {
  const User = require('../models/User');
  
  // Get current user to check if they have an avatar
  const currentUser = await User.findById(req.user.id);
  
  // Remove old avatar file if it exists
  if (currentUser.avatar && fs.existsSync(currentUser.avatar)) {
    fs.unlinkSync(currentUser.avatar);
  }

  // Update user to remove face descriptor and avatar
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { 
      faceDescriptor: null,
      avatar: null
    },
    { new: true }
  );

  res.json({
    status: 'success',
    message: 'Face registration removed successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar
      }
    }
  });
}));

// @route   GET /api/face-recognition/status
// @desc    Check if user has face registered
// @access  Private
router.get('/status', asyncHandler(async (req, res) => {
  const User = require('../models/User');
  const user = await User.findById(req.user.id);

  res.json({
    status: 'success',
    data: {
      hasFaceRegistered: !!user.faceDescriptor,
      hasAvatar: !!user.avatar,
      avatarPath: user.avatar
    }
  });
}));

// Helper function to simulate face detection
async function simulateFaceDetection(imagePath) {
  // In a real implementation, you would use face-api.js or similar
  // For now, we'll simulate the detection process
  
  return new Promise((resolve) => {
    setTimeout(() => {
      // Simulate face detection with random descriptor
      const descriptor = Array.from({ length: 128 }, () => Math.random() * 2 - 1);
      
      resolve({
        count: 1, // Assume one face detected
        descriptor: descriptor,
        confidence: 0.95 + Math.random() * 0.05 // 95-100% confidence
      });
    }, 1000); // Simulate processing time
  });
}

// Helper function to calculate face similarity
function calculateFaceSimilarity(descriptor1, descriptor2) {
  if (descriptor1.length !== descriptor2.length) {
    return 0;
  }

  // Calculate Euclidean distance
  let sumSquaredDiff = 0;
  for (let i = 0; i < descriptor1.length; i++) {
    const diff = descriptor1[i] - descriptor2[i];
    sumSquaredDiff += diff * diff;
  }

  const distance = Math.sqrt(sumSquaredDiff);
  
  // Convert distance to similarity (0-1 scale)
  // Lower distance = higher similarity
  return Math.max(0, 1 - distance / Math.sqrt(descriptor1.length));
}

module.exports = router; 