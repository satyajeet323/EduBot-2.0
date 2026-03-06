const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  // Authentication fields
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    // Do NOT add index: true here, handled by userSchema.index below
  },
  username: {
    type: String,
    trim: true,
    maxlength: [50, 'Username cannot exceed 50 characters'],
    default: null
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters long'],
    select: false
  },
  
  // Profile information
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters']
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters']
  },
  avatar: {
    type: String,
    default: null
  },
  
  // Face recognition data
  faceDescriptor: {
    type: [Number],
    default: null
  },
  
  // Learning preferences
  preferences: {
    subjects: [{
      type: String,
      enum: ['Mathematics', 'Physics', 'Chemistry', 'Biology', 'Computer Science', 'English', 'History', 'Geography']
    }],
    learningPace: {
      type: String,
      enum: ['slow', 'moderate', 'fast'],
      default: 'moderate'
    },
    difficultyLevel: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner'
    },
    preferredQuestionTypes: [{
      type: String,
      enum: ['MCQ', 'coding', 'network', 'sql', 'chatbot']
    }],
    dailyGoal: {
      type: Number,
      default: 10,
      min: [1, 'Daily goal must be at least 1'],
      max: [100, 'Daily goal cannot exceed 100']
    }
  },
  
  // Progress tracking
  progress: {
    totalQuestions: {
      type: Number,
      default: 0
    },
    correctAnswers: {
      type: Number,
      default: 0
    },
    // Number of questions solved today (resets daily)
    questionsToday: {
      type: Number,
      default: 0
    },
    streakDays: {
      type: Number,
      default: 0
    },
    lastActiveDate: {
      type: Date,
      default: Date.now
    },
    points: {
      type: Number,
      default: 0
    }
  },

  // Gamification & tracking
  streak: {
    type: Number,
    default: 0
  },
  // Prevent multiple daily goal rewards in same day
  lastDailyGoalRewardDate: {
    type: Date,
    default: null
  },
  lastSolvedDate: {
    type: Date,
    default: null
  },
  moduleProgress: {
    dbms: { type: Number, default: 0 },
    computerNetworks: { type: Number, default: 0 },
    python: { type: Number, default: 0 },
    java: { type: Number, default: 0 },
    c: { type: Number, default: 0 },
    cpp: { type: Number, default: 0 }
  },
  quizHistory: [{
    questionId: { type: String },
    module: {
      type: String,
      enum: ['dbms', 'computerNetworks', 'python', 'java', 'c', 'cpp']
    },
    subject: { type: String },
    selectedAnswer: { type: String },
    correctAnswer: { type: String },
    isCorrect: { type: Boolean },
    score: { type: Number },
    totalQuestions: { type: Number },
    task: { type: String },
    performanceScore: { type: Number, min: 0, max: 5 },
    pointsAwarded: { type: Number },
    meta: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Practical submissions history
  practicalHistory: [{
    subject: {
      type: String,
      enum: ['dbms', 'computerNetworks', 'python', 'java', 'c', 'cpp'],
      required: true
    },
    task: { type: String, required: true },
    performanceScore: { type: Number, min: 0, max: 5, required: true },
    pointsAwarded: { type: Number, required: true },
    meta: { type: Object, default: {} },
    timestamp: { type: Date, default: Date.now }
  }],
  
  // Account status
  isActive: {
    type: Boolean,
    default: true
  },
  isEmailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  
  // Password reset
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Login tracking
  lastLogin: {
    type: Date,
    default: Date.now
  },
  loginMethod: {
    type: String,
    enum: ['email', 'face'],
    default: 'email'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for accuracy percentage
userSchema.virtual('accuracyPercentage').get(function() {
  if (this.progress.totalQuestions === 0) return 0;
  return Math.round((this.progress.correctAnswers / this.progress.totalQuestions) * 100);
});

// Virtual for level based on total points
userSchema.virtual('level').get(function() {
  const points = this.progress?.points || 0;
  if (points >= 1000) return 5;
  if (points >= 500) return 4;
  if (points >= 250) return 3;
  if (points >= 100) return 2;
  return 1;
});

// Index for better query performance
// Note: email index is already created by unique: true in schema definition
userSchema.index({ 'preferences.subjects': 1 });
userSchema.index({ 'progress.points': -1 });
userSchema.index({ streak: -1 });
userSchema.index({ 'practicalHistory.subject': 1, 'practicalHistory.timestamp': -1 });

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Method to update progress
userSchema.methods.updateProgress = function(isCorrect) {
  this.progress.totalQuestions += 1;
  if (isCorrect) {
    this.progress.correctAnswers += 1;
    this.progress.points += 10;
  }
  
  // Update streak
  const today = new Date().toDateString();
  const lastActive = new Date(this.progress.lastActiveDate).toDateString();
  
  if (today === lastActive) {
    // Same day, no change to streak
  } else if (new Date(this.progress.lastActiveDate).getTime() + 86400000 >= new Date().getTime()) {
    // Consecutive day
    this.progress.streakDays += 1;
  } else {
    // Streak broken
    this.progress.streakDays = 1;
  }
  
  this.progress.lastActiveDate = new Date();
  return this.save();
};

// Method to record a quiz attempt and update gamification
userSchema.methods.recordQuizAttempt = function({ moduleKey, isCorrect, questionId, selectedAnswer, correctAnswer }) {
  // Points
  if (isCorrect) {
    this.progress.points += 10;
  }

  // Module progress (store counts)
  if (moduleKey && this.moduleProgress[moduleKey] !== undefined) {
    this.moduleProgress[moduleKey] += 1;
  }

  // Streak logic: increases when user solves at least one quiz per day
  const now = new Date();
  if (isCorrect) {
    const lastSolved = this.lastSolvedDate ? new Date(this.lastSolvedDate) : null;
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (!lastSolved) {
      this.streak = 1;
    } else {
      const last = new Date(lastSolved.getFullYear(), lastSolved.getMonth(), lastSolved.getDate());
      const diffDays = Math.round((today - last) / 86400000);
      if (diffDays === 0) {
        // already solved today, no change
      } else if (diffDays === 1) {
        this.streak += 1;
      } else {
        this.streak = 1;
      }
    }
    this.lastSolvedDate = now;
  } else {
    // If a day is missed (no correct solution), streak resets will occur on next correct attempt by diffDays > 1 branch
  }

  // Maintain legacy progress counters for compatibility
  this.progress.totalQuestions += 1;
  if (isCorrect) this.progress.correctAnswers += 1;
  this.progress.lastActiveDate = now;
  // Update daily counter (reset when day changes)
  const lastActiveDay = this.progress.lastActiveDate ? new Date(this.progress.lastActiveDate) : null;
  if (lastActiveDay) {
    const d1 = new Date(lastActiveDay.getFullYear(), lastActiveDay.getMonth(), lastActiveDay.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((d2 - d1) / 86400000);
    if (diff === 0) {
      this.progress.questionsToday = (this.progress.questionsToday || 0) + 1;
    } else {
      this.progress.questionsToday = 1;
    }
  } else {
    this.progress.questionsToday = 1;
  }
  // Mirror streak to legacy field when we have a current-day correct
  if (isCorrect) this.progress.streakDays = this.streak;

  // Quiz history
  this.quizHistory.push({
    questionId,
    module: moduleKey,
    selectedAnswer,
    correctAnswer,
    isCorrect,
    timestamp: now
  });

  // Keep history size reasonable
  if (this.quizHistory.length > 1000) {
    this.quizHistory = this.quizHistory.slice(-1000);
  }

  // Reward daily goal (once per day) if reached
  this._rewardDailyGoalIfReached(now);

  return this.save();
};

// Method to apply a practical submission with configurable scoring
// scoringConfig: function or mapping to convert performanceScore (0-5) to points
userSchema.methods.applyPracticalSubmission = function({ subjectKey, task, performanceScore, scoringConfig, meta }) {
  // Compute points via provided scoring strategy
  let pointsFromScore = 0;
  if (typeof scoringConfig === 'function') {
    pointsFromScore = Number(scoringConfig(performanceScore)) || 0;
  } else if (scoringConfig && typeof scoringConfig === 'object' && scoringConfig !== null) {
    pointsFromScore = Number(scoringConfig[performanceScore]) || 0;
  } else {
    // Default linear mapping: score 0..5 -> 0,2,4,6,8,10
    const defaultMap = { 0: 0, 1: 2, 2: 4, 3: 6, 4: 8, 5: 10 };
    pointsFromScore = defaultMap[Math.max(0, Math.min(5, Math.round(performanceScore)))] || 0;
  }

  // Update total points
  this.progress.points += pointsFromScore;

  // Update per-subject progress (count of practical completions)
  if (subjectKey && this.moduleProgress[subjectKey] !== undefined) {
    this.moduleProgress[subjectKey] += 1;
  }

  // Streak logic: increases when user submits at least one task per day
  const now = new Date();
  const last = this.lastSolvedDate ? new Date(this.lastSolvedDate) : null;
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (!last) {
    this.streak = 1;
  } else {
    const lastDate = new Date(last.getFullYear(), last.getMonth(), last.getDate());
    const diffDays = Math.round((today - lastDate) / 86400000);
    if (diffDays === 0) {
      // already submitted today, no change
    } else if (diffDays === 1) {
      this.streak += 1;
    } else {
      this.streak = 1;
    }
  }
  this.lastSolvedDate = now;
  // Mirror legacy fields
  this.progress.lastActiveDate = now;
  this.progress.streakDays = this.streak;
  // Update daily questions counter similar to quiz attempts
  const lastActiveDay = this.progress.lastActiveDate ? new Date(this.progress.lastActiveDate) : null;
  if (lastActiveDay) {
    const d1 = new Date(lastActiveDay.getFullYear(), lastActiveDay.getMonth(), lastActiveDay.getDate());
    const d2 = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const diff = Math.round((d2 - d1) / 86400000);
    if (diff === 0) {
      this.progress.questionsToday = (this.progress.questionsToday || 0) + 1;
    } else {
      this.progress.questionsToday = 1;
    }
  } else {
    this.progress.questionsToday = 1;
  }

  // Append practical history entry
  this.practicalHistory.push({
    subject: subjectKey,
    task,
    performanceScore: Math.max(0, Math.min(5, Math.round(performanceScore))),
    pointsAwarded: pointsFromScore,
    meta: meta || {},
    timestamp: now
  });

  // Keep history reasonable
  if (this.practicalHistory.length > 1000) {
    this.practicalHistory = this.practicalHistory.slice(-1000);
  }

  // Reward daily goal (once per day) if reached
  this._rewardDailyGoalIfReached(now);

  return this.save();
};

// Internal helper to reward daily goal once per day
userSchema.methods._rewardDailyGoalIfReached = function(now) {
  const dailyGoal = this.preferences?.dailyGoal || 10;
  const todayDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastReward = this.lastDailyGoalRewardDate ? new Date(this.lastDailyGoalRewardDate) : null;
  const lastRewardDate = lastReward ? new Date(lastReward.getFullYear(), lastReward.getMonth(), lastReward.getDate()) : null;
  const alreadyRewardedToday = lastRewardDate && lastRewardDate.getTime() === todayDate.getTime();
  if (!alreadyRewardedToday && (this.progress?.questionsToday || 0) >= dailyGoal) {
    this.progress.points += 20;
    this.lastDailyGoalRewardDate = now;
  }
};

// Method to get user stats
userSchema.methods.getStats = function() {
  return {
    totalQuestions: this.progress.totalQuestions,
    correctAnswers: this.progress.correctAnswers,
    accuracy: this.accuracyPercentage,
    streakDays: this.progress.streakDays,
    points: this.progress.points,
    lastActive: this.progress.lastActiveDate
  };
};

module.exports = mongoose.model('User', userSchema); 