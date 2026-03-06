const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Validation rules
const updateProfileValidation = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters'),
  body('lastName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('Last name must be between 2 and 50 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL')
];

const updatePreferencesValidation = [
  body('subjects')
    .optional()
    .isArray()
    .withMessage('Subjects must be an array'),
  body('subjects.*')
    .optional()
    .isIn(['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography'])
    .withMessage('Invalid subject'),
  body('learningPace')
    .optional()
    .isIn(['slow', 'moderate', 'fast'])
    .withMessage('Learning pace must be slow, moderate, or fast'),
  body('difficultyLevel')
    .optional()
    .isIn(['beginner', 'intermediate', 'advanced'])
    .withMessage('Difficulty level must be beginner, intermediate, or advanced'),
  body('preferredQuestionTypes')
    .optional()
    .isArray()
    .withMessage('Preferred question types must be an array'),
  body('preferredQuestionTypes.*')
    .optional()
    .isIn(['MCQ', 'coding', 'network', 'sql', 'chatbot'])
    .withMessage('Invalid question type'),
  body('dailyGoal')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Daily goal must be between 1 and 100')
];

// @route   GET /api/user/profile
// @desc    Get user profile
// @access  Private
router.get('/profile', asyncHandler(async (req, res) => {
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
        streak: user.streak,
        points: user.progress.points,
        level: user.level,
        moduleProgress: user.moduleProgress,
        quizHistory: user.quizHistory,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   GET /api/user/:id/profile
// @desc    Get user profile by id
// @access  Private
router.get('/:id/profile', asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ status: 'error', message: 'User not found' });

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
        streak: user.streak,
        points: user.progress.points,
        level: user.level,
        moduleProgress: user.moduleProgress,
        quizHistory: user.quizHistory,
        lastLogin: user.lastLogin,
        createdAt: user.createdAt
      }
    }
  });
}));

// @route   PUT /api/user/profile
// @desc    Update user profile
// @access  Private
router.put('/profile', updateProfileValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { firstName, lastName, avatar } = req.body;
  
  const updateData = {};
  if (firstName) updateData.firstName = firstName;
  if (lastName) updateData.lastName = lastName;
  if (avatar) updateData.avatar = avatar;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    status: 'success',
    message: 'Profile updated successfully',
    data: {
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        avatar: user.avatar,
        preferences: user.preferences,
        progress: user.progress
      }
    }
  });
}));

// @route   GET /api/user/preferences
// @desc    Get user preferences
// @access  Private
router.get('/preferences', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.json({
    status: 'success',
    data: {
      preferences: user.preferences
    }
  });
}));

// @route   PUT /api/user/preferences
// @desc    Update user preferences
// @access  Private
router.put('/preferences', updatePreferencesValidation, asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { subjects, learningPace, difficultyLevel, preferredQuestionTypes, dailyGoal } = req.body;
  
  const updateData = {};
  if (subjects) updateData['preferences.subjects'] = subjects;
  if (learningPace) updateData['preferences.learningPace'] = learningPace;
  if (difficultyLevel) updateData['preferences.difficultyLevel'] = difficultyLevel;
  if (preferredQuestionTypes) updateData['preferences.preferredQuestionTypes'] = preferredQuestionTypes;
  if (dailyGoal) updateData['preferences.dailyGoal'] = dailyGoal;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    updateData,
    { new: true, runValidators: true }
  );

  res.json({
    status: 'success',
    message: 'Preferences updated successfully',
    data: {
      preferences: user.preferences
    }
  });
}));

// @route   GET /api/user/progress
// @desc    Get user progress
// @access  Private
router.get('/progress', asyncHandler(async (req, res) => {
  const user = await User.findById(req.user.id);
  
  res.json({
    status: 'success',
    data: {
      progress: user.progress,
      stats: user.getStats()
    }
  });
}));

// @route   POST /api/user/face-register
// @desc    Register face for face recognition
// @access  Private
router.post('/face-register', asyncHandler(async (req, res) => {
  const { faceDescriptor } = req.body;

  if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
    return res.status(400).json({
      status: 'error',
      message: 'Face descriptor is required and must be an array'
    });
  }

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { faceDescriptor },
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
      }
    }
  });
}));

// @route   DELETE /api/user/face-register
// @desc    Remove face registration
// @access  Private
router.delete('/face-register', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.user.id,
    { faceDescriptor: null },
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

// @route   PUT /api/user/password
// @desc    Change password
// @access  Private
router.put('/password', [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('New password must contain at least one uppercase letter, one lowercase letter, and one number')
], asyncHandler(async (req, res) => {
  // Check for validation errors
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      message: 'Validation failed',
      errors: errors.array()
    });
  }

  const { currentPassword, newPassword } = req.body;

  // Get user with password
  const user = await User.findById(req.user.id).select('+password');
  
  // Check current password
  const isCurrentPasswordValid = await user.comparePassword(currentPassword);
  if (!isCurrentPasswordValid) {
    return res.status(400).json({
      status: 'error',
      message: 'Current password is incorrect'
    });
  }

  // Update password
  user.password = newPassword;
  await user.save();

  res.json({
    status: 'success',
    message: 'Password changed successfully'
  });
}));

// @route   DELETE /api/user/account
// @desc    Delete user account
// @access  Private
router.delete('/account', asyncHandler(async (req, res) => {
  await User.findByIdAndDelete(req.user.id);

  res.json({
    status: 'success',
    message: 'Account deleted successfully'
  });
}));

module.exports = router; 