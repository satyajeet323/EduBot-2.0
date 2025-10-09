import axios from 'axios'

// Create axios instance
const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = sessionStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      sessionStorage.removeItem('token')
      sessionStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  // Login with email and password
  login: (email, password) => 
    api.post('/auth/login', { email, password }),
  
  // Face login
  faceLogin: (faceDescriptor) => 
    api.post('/auth/face-login', { faceDescriptor }),
  
  // Register new user
  register: (userData) => 
    api.post('/auth/register', userData),
  
  // Logout
  logout: () => 
    api.post('/auth/logout'),
  
  // Get current user
  getCurrentUser: () => 
    api.get('/auth/me'),
}

// User API
export const userAPI = {
  // Get user profile
  getProfile: () => 
    api.get('/user/profile'),
  
  // Update user profile
  updateProfile: (profileData) => 
    api.put('/user/profile', profileData),
  
  // Get user preferences
  getPreferences: () => 
    api.get('/user/preferences'),
  
  // Update user preferences
  updatePreferences: (preferences) => 
    api.put('/user/preferences', preferences),
  
  // Get user progress
  getProgress: () => 
    api.get('/user/progress'),
  
  // Register face (JSON descriptor)
  registerFace: (faceDescriptor) => 
    api.post('/user/face-register', { faceDescriptor }),
  
  // Remove face registration
  removeFaceRegistration: () => 
    api.delete('/user/face-register'),
  
  // Change password
  changePassword: (passwordData) => 
    api.put('/user/password', passwordData),
  
  // Delete account
  deleteAccount: () => 
    api.delete('/user/account'),
}

// Subject API
export const subjectAPI = {
  // Get all subjects
  getSubjects: (params = {}) => 
    api.get('/subjects', { params }),
  
  // Get popular subjects
  getPopularSubjects: (limit = 10) => 
    api.get('/subjects/popular', { params: { limit } }),
  
  // Get subject categories
  getCategories: () => 
    api.get('/subjects/categories'),
  
  // Get subject by ID
  getSubject: (id) => 
    api.get(`/subjects/${id}`),
  
  // Get topics for a subject
  getTopics: (subjectId) => 
    api.get(`/subjects/${subjectId}/topics`),
  
  // Get specific topic
  getTopic: (subjectId, topicId) => 
    api.get(`/subjects/${subjectId}/topics/${topicId}`),
  
  // Request questions for a subject/topic
  requestQuestions: (subjectId, questionData) => 
    api.post(`/subjects/${subjectId}/request-questions`, questionData),
  
  // Get recommended subjects
  getRecommendedSubjects: (limit = 10) => 
    api.get('/subjects/recommended', { params: { limit } }),
}

// Question API
export const questionAPI = {
  // Generate questions
  generateQuestions: (questionData) => 
    api.post('/questions/generate', questionData),
  
  // Validate answer
  validateAnswer: (answerData) => 
    api.post('/questions/validate-answer', answerData),
}

// Face Recognition API
export const faceRecognitionAPI = {
  // Detect faces in image
  detectFaces: (formData) => 
    api.post('/face-recognition/detect', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Compare face descriptors
  compareFaces: (descriptor1, descriptor2) => 
    api.post('/face-recognition/compare', { descriptor1, descriptor2 }),
  
  // Register face
  registerFace: (formData) => 
    api.post('/face-recognition/register', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    }),
  
  // Remove face registration
  removeFaceRegistration: () => 
    api.delete('/face-recognition/register'),
  
  // Get face registration status
  getFaceStatus: () => 
    api.get('/face-recognition/status'),
}

// Practical API
export const practicalAPI = {
  // Submit a practical result
  submit: ({ subject, task, performanceScore, meta, scoring }) =>
    api.post('/practical/submit', { subject, task, performanceScore, meta, scoring }),

  // Get practical history
  getHistory: () => api.get('/practical/history')
}

export default api 