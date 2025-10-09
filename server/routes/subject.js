const express = require('express');
const Subject = require('../models/Subject');
const { asyncHandler } = require('../middleware/errorHandler');

const router = express.Router();

// @route   GET /api/subjects
// @desc    Get all subjects
// @access  Private
router.get('/', asyncHandler(async (req, res) => {
  const { category, search, limit = 20, page = 1 } = req.query;
  
  const query = { isActive: true };
  
  // Filter by category
  if (category) {
    query.category = category;
  }
  
  // Search by name or description
  if (search) {
    query.$or = [
      { name: { $regex: search, $options: 'i' } },
      { description: { $regex: search, $options: 'i' } }
    ];
  }
  
  const skip = (parseInt(page) - 1) * parseInt(limit);
  
  const subjects = await Subject.find(query)
    .sort({ popularity: -1, name: 1 })
    .skip(skip)
    .limit(parseInt(limit))
    .select('-topics');
  
  const total = await Subject.countDocuments(query);
  
  res.json({
    status: 'success',
    data: {
      subjects,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(total / parseInt(limit)),
        totalItems: total,
        itemsPerPage: parseInt(limit)
      }
    }
  });
}));

// @route   GET /api/subjects/popular
// @desc    Get popular subjects
// @access  Private
router.get('/popular', asyncHandler(async (req, res) => {
  const { limit = 10 } = req.query;
  
  const subjects = await Subject.find({ isActive: true })
    .sort({ popularity: -1 })
    .limit(parseInt(limit))
    .select('-topics');
  
  res.json({
    status: 'success',
    data: {
      subjects
    }
  });
}));

// @route   GET /api/subjects/categories
// @desc    Get all subject categories
// @access  Private
router.get('/categories', asyncHandler(async (req, res) => {
  const categories = await Subject.distinct('category', { isActive: true });
  
  res.json({
    status: 'success',
    data: {
      categories
    }
  });
}));

// @route   GET /api/subjects/recommended
// @desc    Get recommended subjects based on user preferences
// @access  Private
router.get('/recommended', asyncHandler(async (req, res) => {
  const user = req.user;
  const { limit = 10 } = req.query;
  
  let query = { isActive: true };
  
  // Filter by user's preferred subjects if available
  if (user.preferences && user.preferences.subjects && user.preferences.subjects.length > 0) {
    query.name = { $in: user.preferences.subjects };
  }
  
  // Filter by user's difficulty level if available
  if (user.preferences && user.preferences.difficultyLevel) {
    query.difficultyLevels = user.preferences.difficultyLevel;
  }
  
  const subjects = await Subject.find(query)
    .sort({ popularity: -1, name: 1 })
    .limit(parseInt(limit))
    .select('-topics');
  
  res.json({
    status: 'success',
    data: {
      subjects,
      userPreferences: user.preferences
    }
  });
}));

// @route   GET /api/subjects/:id
// @desc    Get subject by ID with topics
// @access  Private
router.get('/:id', asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  
  if (!subject) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject not found'
    });
  }
  
  if (!subject.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject is not available'
    });
  }
  
  res.json({
    status: 'success',
    data: {
      subject
    }
  });
}));

// @route   GET /api/subjects/:id/topics
// @desc    Get topics for a specific subject
// @access  Private
router.get('/:id/topics', asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  
  if (!subject) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject not found'
    });
  }
  
  if (!subject.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject is not available'
    });
  }
  
  const activeTopics = subject.getActiveTopics();
  
  res.json({
    status: 'success',
    data: {
      topics: activeTopics,
      subject: {
        id: subject._id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
        color: subject.color
      }
    }
  });
}));

// @route   GET /api/subjects/:id/topics/:topicId
// @desc    Get specific topic from a subject
// @access  Private
router.get('/:id/topics/:topicId', asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id);
  
  if (!subject) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject not found'
    });
  }
  
  if (!subject.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject is not available'
    });
  }
  
  const topic = subject.getTopic(req.params.topicId);
  
  if (!topic) {
    return res.status(404).json({
      status: 'error',
      message: 'Topic not found'
    });
  }
  
  if (!topic.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Topic is not available'
    });
  }
  
  res.json({
    status: 'success',
    data: {
      topic,
      subject: {
        id: subject._id,
        name: subject.name,
        description: subject.description,
        icon: subject.icon,
        color: subject.color
      }
    }
  });
}));

// @route   POST /api/subjects/:id/request-questions
// @desc    Request questions for a specific topic
// @access  Private
router.post('/:id/request-questions', asyncHandler(async (req, res) => {
  const { topicId, questionType, difficulty, count = 5 } = req.body;
  
  const subject = await Subject.findById(req.params.id);
  
  if (!subject) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject not found'
    });
  }
  
  if (!subject.isActive) {
    return res.status(404).json({
      status: 'error',
      message: 'Subject is not available'
    });
  }
  
  let topic = null;
  if (topicId) {
    topic = subject.getTopic(topicId);
    if (!topic || !topic.isActive) {
      return res.status(404).json({
        status: 'error',
        message: 'Topic not found or not available'
      });
    }
  }
  
  // This endpoint will be connected to the question generation service
  // For now, return a placeholder response
  res.json({
    status: 'success',
    message: 'Question request received',
    data: {
      subjectId: subject._id,
      subjectName: subject.name,
      topicId: topic?._id,
      topicName: topic?.name,
      questionType: questionType || 'MCQ',
      difficulty: difficulty || 'beginner',
      count: parseInt(count),
      estimatedTime: Math.ceil(parseInt(count) * 2) // 2 minutes per question
    }
  });
}));

module.exports = router;