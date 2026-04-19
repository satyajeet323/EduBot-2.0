# EduBot - Complete Setup Guide

This guide will walk you through setting up and running the EduBot AI-Powered Educational Assessment Platform on your local machine.

## 📋 Prerequisites

Before you begin, ensure you have the following installed on your system:

### Required Software
- **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- **Python** (v3.8 or higher) - [Download](https://www.python.org/downloads/)
- **MongoDB** (v4.4 or higher) - [Download](https://www.mongodb.com/try/download/community)
- **Git** - [Download](https://git-scm.com/downloads)

### Required API Keys
- **Google Gemini API Key** - [Get API Key](https://makersuite.google.com/app/apikey)

### Optional Tools
- **MongoDB Compass** (GUI for MongoDB) - [Download](https://www.mongodb.com/products/compass)
- **Postman** (API testing) - [Download](https://www.postman.com/downloads/)

---

## 🚀 Quick Start

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd edubot
```

### Step 2: Install All Dependencies

Run this command from the root directory to install dependencies for both client and server:

```bash
npm run install-all
```

This will install:
- Root dependencies (concurrently)
- Server dependencies (Node.js packages)
- Client dependencies (React packages)

### Step 3: Install Python Dependencies

Navigate to the server directory and install Python packages:

```bash
cd server
pip install -r requirements.txt
```

Or if you're using Python 3:

```bash
pip3 install -r requirements.txt
```

### Step 4: Setup MongoDB

#### Option A: Local MongoDB
1. Start MongoDB service:
   - **Windows**: MongoDB should start automatically, or run `net start MongoDB`
   - **Mac**: `brew services start mongodb-community`
   - **Linux**: `sudo systemctl start mongod`

2. Verify MongoDB is running:
   ```bash
   mongosh
   ```
   If connected successfully, you'll see the MongoDB shell.

#### Option B: MongoDB Atlas (Cloud)
1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string (it will look like: `mongodb+srv://username:password@cluster.mongodb.net/edubot`)

### Step 5: Configure Environment Variables

#### Server Configuration
1. Navigate to the server directory:
   ```bash
   cd server
   ```

2. Copy the example environment file:
   ```bash
   copy env.example .env
   ```

3. Edit the `.env` file with your configuration:

```env
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration
# For local MongoDB:
MONGODB_URI=mongodb://localhost:27017/edubot
# For MongoDB Atlas:
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/edubot

# JWT Configuration
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
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

**Important**: Replace `your_gemini_api_key_here` with your actual Google Gemini API key!

### Step 6: Start the Application

#### Option A: Using the Batch Script (Windows)
From the root directory, simply run:
```bash
start-dev.bat
```

This will open two command windows:
- Server running on `http://localhost:5000`
- Client running on `http://localhost:5173`

#### Option B: Using NPM Scripts
From the root directory:
```bash
npm run dev
```

This runs both server and client concurrently in the same terminal.

#### Option C: Manual Start (Separate Terminals)

**Terminal 1 - Server:**
```bash
cd server
npm run dev
```

**Terminal 2 - Client:**
```bash
cd client
npm run dev
```

### Step 7: Access the Application

Open your browser and navigate to:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000

---

## 🔧 Detailed Setup Instructions

### MongoDB Setup Details

#### Creating the Database
The application will automatically create the database on first run. However, you can manually create it:

```bash
mongosh
use edubot
db.createCollection("users")
db.createCollection("subjects")
db.createCollection("questions")
```

#### Verify Database Connection
Check if the server connects successfully by looking for this message in the server logs:
```
MongoDB Connected: localhost
```

### Python Services Setup

The project includes Python services for AI features (fluency analysis, semantic analysis, etc.). These run separately:

#### Start Python Services (if needed)
```bash
cd server
python fluency_service.py
```

Or for specific services:
```bash
python Semantic.py
python CRNN.py
```

### Troubleshooting Common Issues

#### Issue: MongoDB Connection Failed
**Solution**:
- Verify MongoDB is running: `mongosh`
- Check your `MONGODB_URI` in `.env`
- For Atlas, ensure your IP is whitelisted

#### Issue: Port Already in Use
**Solution**:
- Change the port in `server/.env` (PORT=5000)
- Or kill the process using the port:
  ```bash
  # Windows
  netstat -ano | findstr :5000
  taskkill /PID <PID> /F
  ```

#### Issue: Gemini API Errors
**Solution**:
- Verify your API key is correct
- Check API quota at [Google AI Studio](https://makersuite.google.com/)
- Ensure you have billing enabled if required

#### Issue: Python Dependencies Failed
**Solution**:
- Use a virtual environment:
  ```bash
  cd server
  python -m venv venv
  venv\Scripts\activate  # Windows
  pip install -r requirements.txt
  ```

#### Issue: Node Modules Errors
**Solution**:
- Delete node_modules and reinstall:
  ```bash
  # Root
  rmdir /s /q node_modules
  del package-lock.json
  npm install
  
  # Server
  cd server
  rmdir /s /q node_modules
  del package-lock.json
  npm install
  
  # Client
  cd ../client
  rmdir /s /q node_modules
  del package-lock.json
  npm install
  ```

---

## 📦 Project Structure

```
edubot/
├── client/                 # React frontend
│   ├── src/               # Source files
│   ├── public/            # Static assets
│   └── package.json       # Client dependencies
├── server/                # Node.js + Python backend
│   ├── routes/            # API routes
│   ├── controllers/       # Business logic
│   ├── models/            # Database models
│   ├── middleware/        # Custom middleware
│   ├── *.py              # Python AI services
│   ├── package.json      # Server dependencies
│   └── requirements.txt  # Python dependencies
├── package.json          # Root dependencies
├── start-dev.bat         # Windows startup script
└── SETUP.md             # This file
```

---

## 🎯 First Time Usage

### 1. Register a New User
1. Navigate to http://localhost:5173
2. Click "Register" or "Sign Up"
3. Fill in your details:
   - Name
   - Email
   - Password
   - Optional: Register face for face recognition

### 2. Login
- Use email/password
- Or use face recognition (requires camera access)

### 3. Explore Features
- Browse subjects
- Select topics
- Generate AI questions
- Take assessments
- View your progress

---

## 🔒 Security Notes

- Never commit your `.env` file to version control
- Change the `JWT_SECRET` to a strong random string
- Keep your Gemini API key private
- Use environment-specific configurations for production

---

## 🚢 Production Deployment

### Building for Production

#### Build Client
```bash
cd client
npm run build
```
This creates an optimized build in `client/dist/`

#### Prepare Server
```bash
cd server
# Set NODE_ENV=production in .env
# Use production MongoDB URI
# Configure proper security settings
```

### Deployment Platforms

#### Vercel (Frontend)
1. Connect GitHub repository
2. Set build command: `cd client && npm run build`
3. Set output directory: `client/dist`
4. Deploy

#### Railway/Render (Backend)
1. Connect GitHub repository
2. Add environment variables
3. Set start command: `cd server && npm start`
4. Deploy

---

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review server logs for error messages
3. Check browser console for frontend errors
4. Create an issue in the repository

---

## 🎉 You're All Set!

Your EduBot application should now be running successfully. Happy coding!

For more information, check the [README.md](README.md) file.
