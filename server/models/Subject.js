const mongoose = require('mongoose');

const topicSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Topic name is required'],
    trim: true,
    maxlength: [100, 'Topic name cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Topic description is required'],
    maxlength: [500, 'Topic description cannot exceed 500 characters']
  },
  difficultyLevel: {
    type: String,
    enum: ['beginner', 'intermediate', 'advanced'],
    default: 'beginner'
  },
  estimatedTime: {
    type: Number, // in minutes
    default: 30,
    min: [5, 'Estimated time must be at least 5 minutes'],
    max: [300, 'Estimated time cannot exceed 300 minutes']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  questionCount: {
    type: Number,
    default: 0
  },
  tags: [{
    type: String,
    trim: true
  }]
}, {
  timestamps: true
});

const subjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Subject name is required'],
    unique: true,
    trim: true,
    maxlength: [50, 'Subject name cannot exceed 50 characters']
    // Do NOT add index: true here, handled by subjectSchema.index below
  },
  description: {
    type: String,
    required: [true, 'Subject description is required'],
    maxlength: [300, 'Subject description cannot exceed 300 characters']
  },
  icon: {
    type: String,
    default: '📚'
  },
  color: {
    type: String,
    default: '#3B82F6'
  },
  category: {
    type: String,
    enum: ['Science', 'Mathematics', 'Technology', 'Language', 'Social Studies', 'Arts'],
    required: [true, 'Subject category is required']
  },
  topics: [topicSchema],
  isActive: {
    type: Boolean,
    default: true
  },
  difficultyLevels: [{
    type: String,
    enum: ['beginner', 'intermediate', 'advanced']
  }],
  questionTypes: [{
    type: String,
    enum: ['MCQ', 'coding', 'network', 'sql', 'chatbot']
  }],
  totalQuestions: {
    type: Number,
    default: 0
  },
  popularity: {
    type: Number,
    default: 0
  },
  prerequisites: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Subject'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for active topics count
subjectSchema.virtual('activeTopicsCount').get(function() {
  return this.topics.filter(topic => topic.isActive).length;
});

// Virtual for total estimated time
subjectSchema.virtual('totalEstimatedTime').get(function() {
  return this.topics
    .filter(topic => topic.isActive)
    .reduce((total, topic) => total + topic.estimatedTime, 0);
});

// Index for better query performance
subjectSchema.index({ name: 1 });
subjectSchema.index({ category: 1 });
subjectSchema.index({ isActive: 1 });
subjectSchema.index({ popularity: -1 });

// Method to add topic
subjectSchema.methods.addTopic = function(topicData) {
  this.topics.push(topicData);
  return this.save();
};

// Method to update topic
subjectSchema.methods.updateTopic = function(topicId, updateData) {
  const topic = this.topics.id(topicId);
  if (!topic) {
    throw new Error('Topic not found');
  }
  
  Object.assign(topic, updateData);
  return this.save();
};

// Method to remove topic
subjectSchema.methods.removeTopic = function(topicId) {
  this.topics = this.topics.filter(topic => topic._id.toString() !== topicId.toString());
  return this.save();
};

// Method to get topic by ID
subjectSchema.methods.getTopic = function(topicId) {
  return this.topics.id(topicId);
};

// Method to get active topics
subjectSchema.methods.getActiveTopics = function() {
  return this.topics.filter(topic => topic.isActive);
};

// Method to update question count
subjectSchema.methods.updateQuestionCount = function() {
  this.totalQuestions = this.topics.reduce((total, topic) => total + topic.questionCount, 0);
  return this.save();
};

// Static method to get subjects by category
subjectSchema.statics.getByCategory = function(category) {
  return this.find({ category, isActive: true }).sort({ name: 1 });
};

// Static method to get popular subjects
subjectSchema.statics.getPopular = function(limit = 10) {
  return this.find({ isActive: true }).sort({ popularity: -1 }).limit(limit);
};

module.exports = mongoose.model('Subject', subjectSchema); 