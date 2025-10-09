# EduBot - AI-Powered Educational Assessment Platform

EduBot is a comprehensive MERN stack application that provides an AI-powered educational assessment platform with face recognition, adaptive questions, and intelligent feedback using Google Gemini API.

## 🚀 Features

### Input Layer (User Entry Point)
- **Face Recognition / Email Login**: Secure authentication with face recognition or traditional email/password
- **User Profile & Preferences**: Personalized learning preferences and profile management
- **Topic & Subject Selection**: Choose from various educational subjects and topics
- **Question Request Initiation**: Request AI-generated questions based on selected topics

### Intelligence Layer
- **Bloom's Taxonomy Classifier**: Classifies educational content by cognitive levels
- **Difficulty Prediction**: Uses Random Forest algorithm for adaptive difficulty
- **Sentiment Analyzer**: Analyzes user feedback for personalized learning
- **TF-IDF + BERT**: Advanced context understanding
- **LLM-Based Question Generator**: Powered by Google Gemini API

### Assessment Layer
- **AI Chatbot Assistance**: NLP-based educational support
- **Network Design Simulator**: Interactive network design assessments
- **DBMS SQL Query Tester**: SQL query evaluation and testing
- **Coding Test Interface**: Support for C/Python programming assessments
- **Adaptive MCQs**: Tiered difficulty multiple-choice questions

### Feedback Analytics Layer
- **Personalized Learning Suggestions**: AI-driven recommendations
- **AI-Generated Solutions**: Detailed explanations and solutions
- **Skill Report**: Topic-wise performance breakdown
- **Visual Charts**: Progress and accuracy visualization
- **Rank Board & Points System**: Gamified learning experience

## 🛠️ Tech Stack

### Backend
- **Node.js** with Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Google Gemini API** for AI-powered features
- **Face Recognition** (simulated with face-api.js)
- **Multer** for file uploads
- **Express Validator** for input validation

### Frontend
- **React 18** with Vite
- **React Router** for navigation
- **React Hook Form** for form management
- **React Query** for data fetching
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **React Hot Toast** for notifications
- **Framer Motion** for animations

## 📦 Installation

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Google Gemini API key

### 1. Clone the repository
```bash
git clone <repository-url>
cd edubot
```

### 2. Install dependencies
```bash
# Install root dependencies
npm install

# Install server dependencies
cd server
npm install

# Install client dependencies
cd ../client
npm install
```

### 3. Environment Setup

#### Server Environment
Create a `.env` file in the `server` directory:
```bash
cd server
cp env.example .env
```

Edit the `.env` file with your configuration:
```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
MONGODB_URI=mongodb://localhost:27017/edubot

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here
JWT_EXPIRE=7d

# Google Gemini API
GEMINI_API_KEY=your_gemini_api_key_here

# Face Recognition Configuration
FACE_RECOGNITION_MODEL_PATH=./models/face-api

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
```

### 4. Start the application

#### Development Mode
```bash
# From the root directory
npm run dev
```

This will start both the server (port 5000) and client (port 5173) concurrently.

#### Production Mode
```bash
# Build the client
cd client
npm run build

# Start the server
cd ../server
npm start
```

## 🗄️ Database Setup

### MongoDB Connection
The application will automatically connect to MongoDB. Make sure MongoDB is running locally or update the `MONGODB_URI` in your environment variables.

### Initial Data (Optional)
You can add sample subjects and topics to get started:

```javascript
// Example subject data
{
  name: "Computer Science",
  description: "Learn programming and computer fundamentals",
  category: "Technology",
  icon: "💻",
  color: "#3B82F6",
  topics: [
    {
      name: "Python Programming",
      description: "Learn Python basics and advanced concepts",
      difficultyLevel: "beginner",
      estimatedTime: 60
    }
  ]
}
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - Email/password login
- `POST /api/auth/face-login` - Face recognition login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - User logout

### User Management
- `GET /api/user/profile` - Get user profile
- `PUT /api/user/profile` - Update user profile
- `GET /api/user/preferences` - Get user preferences
- `PUT /api/user/preferences` - Update user preferences
- `GET /api/user/progress` - Get user progress

### Subjects & Topics
- `GET /api/subjects` - Get all subjects
- `GET /api/subjects/:id` - Get subject by ID
- `GET /api/subjects/:id/topics` - Get topics for a subject
- `POST /api/subjects/:id/request-questions` - Request questions

### Questions
- `POST /api/questions/generate` - Generate questions with AI
- `POST /api/questions/validate-answer` - Validate user answers

### Face Recognition
- `POST /api/face-recognition/detect` - Detect faces in image
- `POST /api/face-recognition/register` - Register face for user
- `DELETE /api/face-recognition/register` - Remove face registration

## 🎯 Usage

### 1. User Registration
- Navigate to `/register`
- Fill in your details
- Optionally register your face for face recognition login

### 2. Login
- Use email/password or face recognition
- Face recognition requires camera access

### 3. Subject Selection
- Browse available subjects
- Select topics of interest
- Set learning preferences

### 4. Question Generation
- Choose subject and topic
- Select question type (MCQ, coding, SQL, etc.)
- Set difficulty level
- Generate AI-powered questions

### 5. Assessment
- Answer questions
- Get instant feedback
- View detailed explanations
- Track your progress

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Input validation and sanitization
- Rate limiting
- CORS protection
- Helmet.js security headers
- File upload restrictions

## 🚀 Deployment

### Heroku Deployment
1. Create a Heroku app
2. Set environment variables
3. Deploy using Git:
```bash
git push heroku main
```

### Vercel Deployment (Frontend)
1. Connect your GitHub repository
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`

### Railway Deployment (Backend)
1. Connect your GitHub repository
2. Set environment variables
3. Deploy automatically

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📝 License

This project is licensed under the MIT License.

## 🆘 Support

For support and questions:
- Create an issue in the repository
- Contact the development team
- Check the documentation

## 🔮 Future Enhancements

- Real-time collaborative features
- Advanced analytics dashboard
- Mobile application
- Integration with LMS platforms
- Multi-language support
- Advanced AI features with GPT-4
- Virtual reality learning experiences

---
## Contribution : 
-Mitesh Chaudhari

**EduBot** - Transforming education through AI-powered personalized learning experiences. 
