const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Configurable default scoring map: 0..5 -> points
const DEFAULT_SCORING = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 };

// @route   POST /api/practical/submit
// @desc    Submit a practical evaluation result and update user profile
// @access  Private
router.post(
  '/submit',
  authMiddleware,
  [
    body('subject')
      .isIn(['dbms', 'computerNetworks', 'python', 'java', 'c', 'cpp'])
      .withMessage('Invalid subject'),
    body('task')
      .isString()
      .isLength({ min: 3, max: 500 })
      .withMessage('Task description must be 3-500 characters'),
    body('performanceScore')
      .isInt({ min: 0, max: 5 })
      .withMessage('performanceScore must be an integer between 0 and 5'),
    body('meta')
      .optional()
      .isObject()
      .withMessage('meta must be an object'),
    body('scoring')
      .optional()
      .isObject()
      .withMessage('scoring must be a mapping of score->points')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const user = req.user;
    const { subject, task, performanceScore, meta, scoring } = req.body;

    // Build scoringConfig mapper
    const scoringConfig = scoring || DEFAULT_SCORING;

    await user.applyPracticalSubmission({
      subjectKey: subject,
      task,
      performanceScore,
      scoringConfig,
      meta
    });

    res.json({
      status: 'success',
      data: {
        points: user.progress.points,
        level: user.level,
        streak: user.streak,
        moduleProgress: user.moduleProgress,
        progress: user.progress,
        lastSolvedDate: user.lastSolvedDate
      }
    });
  })
);

// @route   GET /api/practical/history
// @desc    Get practical submissions history for current user
// @access  Private
router.get('/history', authMiddleware, asyncHandler(async (req, res) => {
  const user = req.user;
  res.json({
    status: 'success',
    data: user.practicalHistory || []
  });
}));

module.exports = router;

