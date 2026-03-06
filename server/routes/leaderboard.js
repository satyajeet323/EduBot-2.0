const express = require('express');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { authMiddleware } = require('../middleware/auth');

const router = express.Router();

// @route   GET /api/leaderboard
// @desc    Get top users by points
// @access  Private
router.get('/', authMiddleware, asyncHandler(async (req, res) => {
  const limit = Math.min(parseInt(req.query.limit) || 10, 100);
  const users = await User.find()
    .sort({ 'progress.points': -1 })
    .limit(limit)
    .select('firstName lastName avatar progress.points createdAt');

  res.json({
    status: 'success',
    data: users.map(u => ({
      id: u._id,
      name: `${u.firstName} ${u.lastName}`,
      avatar: u.avatar,
      points: u.progress.points
    }))
  });
}));

module.exports = router;

