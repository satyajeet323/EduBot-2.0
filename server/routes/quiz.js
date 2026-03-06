const express = require('express');
const { body, validationResult } = require('express-validator');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// Apply authentication middleware to all routes
router.use(authMiddleware);

// Valid modules for progress tracking
const VALID_MODULES = ['dbms', 'computerNetworks', 'python', 'java', 'c', 'cpp'];

// @route   POST /api/quiz/:module/submit
// @desc    Submit quiz answer; updates streak, points, progress, level, history
// @access  Private
router.post(
  '/:module/submit',
  [
    body('questionId').notEmpty().withMessage('questionId is required'),
    body('selectedAnswer').notEmpty().withMessage('selectedAnswer is required'),
    body('correctAnswer').notEmpty().withMessage('correctAnswer is required')
  ],
  asyncHandler(async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ status: 'error', message: 'Validation failed', errors: errors.array() });
    }

    const moduleKey = req.params.module;
    if (!VALID_MODULES.includes(moduleKey)) {
      return res.status(400).json({ status: 'error', message: 'Invalid module' });
    }

    const { questionId, selectedAnswer, correctAnswer } = req.body;
    const isCorrect = String(selectedAnswer) === String(correctAnswer);

    const user = req.user;

    await user.recordQuizAttempt({
      moduleKey,
      isCorrect,
      questionId,
      selectedAnswer,
      correctAnswer
    });

    res.json({
      status: 'success',
      data: {
        isCorrect,
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

module.exports = router;

