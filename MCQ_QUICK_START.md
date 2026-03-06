# MCQ Feature - Quick Start Guide

## 🚀 Getting Started in 5 Minutes

### Step 1: Verify Environment Variables
Check that `server/.env` has the Gemini API key:
```env
GEMINI_API_KEY=AIzaSyDFYZpaxMM9j6Tx908vCheNXz9-lwV6UnQ
MONGODB_URI=mongodb+srv://...
JWT_SECRET=edubot-secret-121
```

### Step 2: Start the Backend
```bash
cd server
npm run dev
```

Wait for:
```
✅ MongoDB Connected Successfully
🚀 EduBot Server running on port 5000
```

### Step 3: Start the Frontend
Open a new terminal:
```bash
cd client
npm run dev
```

Wait for:
```
  VITE v... ready in ...ms
  ➜  Local:   http://localhost:5173/
```

### Step 4: Test the Feature
1. Open browser: `http://localhost:5173`
2. Login with your credentials
3. Navigate to "Questions" tab
4. Click "MCQ" button on any subject
5. Take the exam!

---

## 📋 Quick Test Scenario

### Test Case: Complete MCQ Exam

1. **Login**
   - Email: your_email@example.com
   - Password: your_password

2. **Navigate to Questions**
   - Click "Questions" in sidebar
   - See list of subjects

3. **Start MCQ Exam**
   - Click "MCQ" button on "Computer Network"
   - Page enters full-screen
   - 10 questions load

4. **Take Exam**
   - Answer all 10 questions
   - Navigate using Previous/Next or number grid
   - Click "Submit Exam"

5. **View Results**
   - See your score (e.g., 80%)
   - See points earned (e.g., +40 points)
   - See current level (e.g., Level 3)
   - Check if you leveled up

6. **Review Answers**
   - Click "Review Answers"
   - See all questions with correct/wrong indicators
   - Read explanations
   - Close review

7. **Verify Dashboard**
   - Navigate to Dashboard
   - Verify points updated
   - Verify level displayed

---

## 🎯 Expected Results

### After First Exam (Score 80%):
- Score: 80%
- Correct: 8/10
- Points Earned: +40
- Total Points: 40 (if starting from 0)
- Level: 1 (need 100 points for Level 2)

### After Third Exam (All 80%):
- Total Points: 120
- Level: 2 ✨ (Level Up!)

### After Sixth Exam (All 80%):
- Total Points: 240
- Level: 2 (need 250 for Level 3)

### After Seventh Exam (80%):
- Total Points: 280
- Level: 3 ✨ (Level Up!)

---

## 🔍 Troubleshooting

### Questions Not Generating?
```bash
# Check Gemini API key
cd server
cat .env | grep GEMINI_API_KEY

# Check server logs
# Look for "MCQ Generation Error"
```

### Full-Screen Not Working?
- Try different browser (Chrome recommended)
- Check browser permissions
- Click the full-screen toggle button manually

### Points Not Updating?
```bash
# Check MongoDB connection
# Look for "MongoDB Connected Successfully" in server logs

# Check user document in MongoDB
# Verify progress.points field exists
```

### API Errors?
```bash
# Check server is running on port 5000
curl http://localhost:5000/api/health

# Check authentication token
# Open browser DevTools > Application > Local Storage
# Verify 'token' exists
```

---

## 📊 Sample Test Data

### Test User Journey:

**Exam 1: Computer Network**
- Score: 90% (9/10 correct)
- Points: +50
- Total: 50 points
- Level: 1

**Exam 2: Database Management**
- Score: 80% (8/10 correct)
- Points: +40
- Total: 90 points
- Level: 1

**Exam 3: Python**
- Score: 70% (7/10 correct)
- Points: +30
- Total: 120 points
- Level: 2 ✨ (Level Up!)

**Exam 4: Java**
- Score: 80% (8/10 correct)
- Points: +40
- Total: 160 points
- Level: 2

**Exam 5: C++**
- Score: 90% (9/10 correct)
- Points: +50
- Total: 210 points
- Level: 2

**Exam 6: C**
- Score: 80% (8/10 correct)
- Points: +40
- Total: 250 points
- Level: 3 ✨ (Level Up!)

---

## 🎨 UI Preview

### Questions Tab
```
┌─────────────────────────────────────────┐
│  Computer Network                       │
│  Network protocols, topologies...       │
│                                         │
│  Progress: [████████░░] 65%            │
│                                         │
│  [  MCQ  ]  [  Practical  ]            │
└─────────────────────────────────────────┘
```

### Exam Interface
```
┌─────────────────────────────────────────┐
│  Computer Network MCQ Exam    ⏱ 2:15   │
│  Question 4 of 10                       │
│  [████████░░░░░░░░░░] 40%              │
├─────────────────────────────────────────┤
│  What is the purpose of TCP?            │
│                                         │
│  ○ A) Transmission Control Protocol     │
│  ● B) Transfer Control Protocol         │
│  ○ C) Transport Control Protocol        │
│  ○ D) Transmission Connection Protocol  │
├─────────────────────────────────────────┤
│  [Previous] [1][2][3][●][5]... [Next]  │
└─────────────────────────────────────────┘
```

### Results Page
```
┌─────────────────────────────────────────┐
│           🏆 Exam Completed!            │
│                                         │
│  Score    Correct   Points    Level    │
│   80%      8/10      +40        3      │
│                                         │
│  🎉 Level Up! You've reached Level 3!  │
│                                         │
│  Total Points: 340                      │
│  Overall Accuracy: 75%                  │
│                                         │
│  [Review Answers] [Back to Questions]  │
└─────────────────────────────────────────┘
```

---

## 🔗 API Endpoints

### Generate Questions
```bash
curl -X POST http://localhost:5000/api/mcq/generate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Computer Network",
    "difficulty": "intermediate"
  }'
```

### Submit Exam
```bash
curl -X POST http://localhost:5000/api/mcq/submit \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Computer Network",
    "answers": [...],
    "totalQuestions": 10,
    "timeTaken": 420
  }'
```

---

## 📝 Quick Reference

### Point System
| Score Range | Points Awarded |
|-------------|----------------|
| 90% - 100%  | 50 points      |
| 80% - 89%   | 40 points      |
| 70% - 79%   | 30 points      |
| 60% - 69%   | 20 points      |
| 50% - 59%   | 10 points      |
| Below 50%   | 0 points       |

### Level System
| Level | Points Required |
|-------|-----------------|
| 1     | 0 - 99          |
| 2     | 100 - 249       |
| 3     | 250 - 499       |
| 4     | 500 - 999       |
| 5     | 1000+           |

### Keyboard Shortcuts
- `F11` - Toggle full-screen (browser default)
- `Tab` - Navigate between elements
- `Enter` - Select option / Submit
- `Esc` - Exit full-screen

---

## ✅ Success Checklist

After completing the quick start:

- [ ] Backend server running
- [ ] Frontend client running
- [ ] Logged in successfully
- [ ] MCQ button visible on Questions tab
- [ ] Clicked MCQ button
- [ ] Exam page loaded with 10 questions
- [ ] Full-screen mode activated
- [ ] Answered all questions
- [ ] Submitted exam
- [ ] Saw results page
- [ ] Points awarded correctly
- [ ] Level displayed correctly
- [ ] Reviewed answers
- [ ] Returned to Questions tab

If all checked, the MCQ feature is working perfectly! 🎉

---

## 🆘 Need Help?

### Common Issues:

1. **"Failed to generate questions"**
   - Check Gemini API key
   - Verify internet connection
   - Check API quota/limits

2. **"Access denied. No token provided"**
   - Login again
   - Check token in localStorage
   - Verify JWT_SECRET in .env

3. **"Database connection unavailable"**
   - Check MongoDB URI
   - Verify MongoDB Atlas is running
   - Check IP whitelist

4. **Full-screen not working**
   - Use Chrome browser
   - Check browser permissions
   - Try manual toggle button

### Still Having Issues?

1. Check server logs in terminal
2. Check browser console (F12)
3. Verify all environment variables
4. Restart both servers
5. Clear browser cache and localStorage

---

## 🎓 Next Steps

After testing the MCQ feature:

1. Try different subjects
2. Test with different users
3. Check leaderboard integration
4. Verify dashboard statistics
5. Test on mobile devices
6. Customize point values
7. Adjust level thresholds
8. Add more subjects

Enjoy the MCQ feature! 🚀
