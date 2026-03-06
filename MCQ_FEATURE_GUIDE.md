# MCQ Exam Feature - Implementation Guide

## Overview
A complete MCQ (Multiple Choice Questions) examination system with AI-powered question generation, full-screen mode, scoring, and gamification.

## Features Implemented

### 1. MCQ Button on Questions Tab
- Each subject card now has a functional MCQ button
- Clicking MCQ button navigates to full-screen exam page
- Passes subject information to exam page

### 2. AI-Powered Question Generation
- Uses Google Gemini API to generate 10 unique questions per subject
- Questions are contextual to the selected subject
- Each question has 4 options (A, B, C, D)
- Includes correct answer and explanation

### 3. Full-Screen Exam Mode
- Automatically enters full-screen when exam starts
- Toggle full-screen button available
- Minimizes distractions during exam

### 4. Exam Interface
- Clean, modern UI with progress tracking
- Timer showing elapsed time
- Question navigation (Previous/Next buttons)
- Visual progress bar
- Question number grid for quick navigation
- Answered questions highlighted in green

### 5. Scoring System
- Automatic scoring based on correct answers
- Score displayed as percentage
- Points awarded based on performance:
  - 90%+ = 50 points
  - 80-89% = 40 points
  - 70-79% = 30 points
  - 60-69% = 20 points
  - 50-59% = 10 points
  - Below 50% = 0 points

### 6. Gamification & Levels
- Points are added to user's total points
- Level system based on total points:
  - Level 1: 0-99 points
  - Level 2: 100-249 points
  - Level 3: 250-499 points
  - Level 4: 500-999 points
  - Level 5: 1000+ points
- Level-up notification when user advances
- Points displayed on dashboard

### 7. Results & Review
- Comprehensive results page showing:
  - Score percentage
  - Correct/Total questions
  - Points earned
  - Current level
  - Level-up status
  - Total points
  - Overall accuracy
- "Review Answers" feature showing:
  - All questions with user's answers
  - Correct answers highlighted in green
  - Wrong answers highlighted in red
  - Explanations for each question

### 8. Progress Tracking
- Exam results saved to user's quiz history
- Updates user statistics:
  - Total questions answered
  - Correct answers count
  - Overall accuracy percentage
  - Points and level

## API Endpoints

### Generate MCQ Questions
```
POST /api/mcq/generate
Authorization: Bearer <token>

Request Body:
{
  "subject": "Computer Network",
  "difficulty": "intermediate" // optional: beginner, intermediate, advanced
}

Response:
{
  "status": "success",
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What is TCP?",
        "options": [
          { "id": "A", "text": "Transmission Control Protocol" },
          { "id": "B", "text": "Transfer Control Protocol" },
          { "id": "C", "text": "Transport Control Protocol" },
          { "id": "D", "text": "Transmission Connection Protocol" }
        ],
        "correctAnswer": "A",
        "explanation": "TCP stands for Transmission Control Protocol..."
      }
      // ... 9 more questions
    ],
    "subject": "Computer Network",
    "difficulty": "intermediate",
    "totalQuestions": 10
  }
}
```

### Submit MCQ Exam
```
POST /api/mcq/submit
Authorization: Bearer <token>

Request Body:
{
  "subject": "Computer Network",
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true
    }
    // ... all 10 answers
  ],
  "totalQuestions": 10,
  "timeTaken": 300 // seconds
}

Response:
{
  "status": "success",
  "data": {
    "score": 80,
    "correctCount": 8,
    "totalQuestions": 10,
    "pointsEarned": 40,
    "totalPoints": 340,
    "level": 3,
    "leveledUp": true,
    "accuracy": 75
  }
}
```

## File Structure

```
server/
├── routes/
│   └── mcq.js              # MCQ API routes
└── models/
    └── User.js             # Updated with quiz history support

client/
├── src/
│   ├── pages/
│   │   ├── MCQExam.jsx     # Full-screen exam interface
│   │   └── Questions.jsx   # Updated with MCQ button
│   └── App.jsx             # Updated with MCQ route
```

## Usage Instructions

### For Students:
1. Navigate to Questions tab
2. Select any subject
3. Click the "MCQ" button
4. Exam automatically enters full-screen mode
5. Answer all 10 questions
6. Use navigation buttons or question grid to move between questions
7. Click "Submit Exam" when finished
8. View your score and points earned
9. Click "Review Answers" to see detailed explanations
10. Points are automatically added to your profile

### For Developers:
1. Ensure Gemini API key is set in `.env`:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

2. Start the server:
   ```bash
   cd server
   npm run dev
   ```

3. Start the client:
   ```bash
   cd client
   npm run dev
   ```

4. The MCQ feature is now available at `/mcq-exam` route

## Database Schema Updates

The User model's `quizHistory` array now supports MCQ exam entries with:
- `subject`: Subject name
- `score`: Number of correct answers
- `totalQuestions`: Total questions in exam
- `task`: Description (e.g., "MCQ Exam - Computer Network")
- `performanceScore`: Score out of 5
- `pointsAwarded`: Points earned
- `meta`: Additional data (timeTaken, difficulty)
- `timestamp`: When exam was taken

## Customization

### Adjust Point Rewards
Edit `server/routes/mcq.js`, line ~70:
```javascript
let pointsEarned = 0;
if (score >= 90) pointsEarned = 50;
else if (score >= 80) pointsEarned = 40;
// ... modify as needed
```

### Adjust Level Thresholds
Edit `server/models/User.js`, virtual 'level' property:
```javascript
userSchema.virtual('level').get(function() {
  const points = this.progress?.points || 0;
  if (points >= 1000) return 5;
  if (points >= 500) return 4;
  // ... modify as needed
});
```

### Change Number of Questions
Edit `server/routes/mcq.js`, line ~30:
```javascript
const prompt = `Generate exactly 10 multiple choice questions...`
// Change 10 to desired number
```

## Troubleshooting

### Questions not generating:
- Check Gemini API key in `.env`
- Verify internet connection
- Check server logs for API errors

### Full-screen not working:
- Some browsers require user gesture
- Check browser permissions
- Try different browser

### Points not updating:
- Verify user is authenticated
- Check MongoDB connection
- Review server logs for save errors

## Future Enhancements

Potential improvements:
- Question difficulty selection
- Timed exams with countdown
- Question bookmarking
- Pause/resume functionality
- Subject-specific question banks
- Performance analytics
- Leaderboards for MCQ scores
- Certificate generation for high scores
- Export results as PDF
- Practice mode (no points, unlimited attempts)

## Support

For issues or questions:
1. Check server logs: `cd server && npm run dev`
2. Check browser console for client errors
3. Verify all dependencies are installed
4. Ensure MongoDB is connected
5. Confirm Gemini API key is valid
