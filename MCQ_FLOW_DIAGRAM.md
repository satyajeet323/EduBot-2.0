# MCQ Feature Flow Diagram

## User Journey Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                        QUESTIONS TAB                             │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Subject Card: Computer Network                          │  │
│  │  ┌────────────┐  ┌────────────┐                         │  │
│  │  │ MCQ Button │  │ Practical  │                         │  │
│  │  └─────┬──────┘  └────────────┘                         │  │
│  └────────┼─────────────────────────────────────────────────┘  │
└───────────┼─────────────────────────────────────────────────────┘
            │ Click
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    NAVIGATE TO /mcq-exam                         │
│              (Pass subject & subjectName in state)               │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      MCQ EXAM PAGE LOADS                         │
│  1. Enter Full-Screen Mode                                       │
│  2. Start Timer                                                  │
│  3. Call API: POST /api/mcq/generate                            │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    BACKEND: Generate Questions                   │
│  1. Receive subject & difficulty                                 │
│  2. Create Gemini AI prompt                                      │
│  3. Call Gemini API                                              │
│  4. Parse response into 10 MCQ questions                         │
│  5. Return questions with options & correct answers              │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    DISPLAY EXAM INTERFACE                        │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Header: Subject | Timer | Full-Screen Toggle            │ │
│  │  Progress Bar: [████████░░░░░░░░░░] 40%                 │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  Question 4 of 10:                                        │ │
│  │  What is the purpose of TCP protocol?                     │ │
│  │                                                            │ │
│  │  ○ A) Transmission Control Protocol                       │ │
│  │  ● B) Transfer Control Protocol (Selected)                │ │
│  │  ○ C) Transport Control Protocol                          │ │
│  │  ○ D) Transmission Connection Protocol                    │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  [Previous]  [1][2][3][●][5][6][7][8][9][10]  [Next]    │ │
│  └───────────────────────────────────────────────────────────┘ │
└───────────┬─────────────────────────────────────────────────────┘
            │ User answers all questions
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                      SUBMIT EXAM                                 │
│  1. Validate all questions answered (optional)                   │
│  2. Calculate results locally                                    │
│  3. Call API: POST /api/mcq/submit                              │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                  BACKEND: Process Submission                     │
│  1. Receive answers array                                        │
│  2. Count correct answers                                        │
│  3. Calculate score percentage                                   │
│  4. Award points based on score:                                 │
│     • 90%+ → 50 points                                          │
│     • 80-89% → 40 points                                        │
│     • 70-79% → 30 points                                        │
│     • 60-69% → 20 points                                        │
│     • 50-59% → 10 points                                        │
│  5. Update user.progress.points                                  │
│  6. Calculate new level:                                         │
│     • Level 1: 0-99 points                                      │
│     • Level 2: 100-249 points                                   │
│     • Level 3: 250-499 points                                   │
│     • Level 4: 500-999 points                                   │
│     • Level 5: 1000+ points                                     │
│  7. Check if leveled up                                          │
│  8. Add to quizHistory                                           │
│  9. Save user document                                           │
│  10. Return results                                              │
└───────────┬─────────────────────────────────────────────────────┘
            │
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                     RESULTS PAGE                                 │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │              🏆 Exam Completed!                           │ │
│  │                                                            │ │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   │ │
│  │  │  Score   │ │ Correct  │ │  Points  │ │  Level   │   │ │
│  │  │   80%    │ │   8/10   │ │   +40    │ │    3     │   │ │
│  │  └──────────┘ └──────────┘ └──────────┘ └──────────┘   │ │
│  │                                                            │ │
│  │  ┌────────────────────────────────────────────────────┐  │ │
│  │  │  🎉 Level Up! You've reached Level 3!             │  │ │
│  │  └────────────────────────────────────────────────────┘  │ │
│  │                                                            │ │
│  │  Total Points: 340                                        │ │
│  │  Overall Accuracy: 75%                                    │ │
│  │                                                            │ │
│  │  [Review Answers]  [Back to Questions]                   │ │
│  └───────────────────────────────────────────────────────────┘ │
└───────────┬─────────────────────────────────────────────────────┘
            │ Click "Review Answers"
            ▼
┌─────────────────────────────────────────────────────────────────┐
│                    REVIEW ANSWERS MODAL                          │
│  ┌───────────────────────────────────────────────────────────┐ │
│  │  Q1: What is TCP?                              ✓ Correct  │ │
│  │  ● A) Transmission Control Protocol (Your answer)         │ │
│  │  ○ B) Transfer Control Protocol                           │ │
│  │  ○ C) Transport Control Protocol                          │ │
│  │  ○ D) Transmission Connection Protocol                    │ │
│  │  💡 Explanation: TCP stands for...                        │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  Q2: What is the OSI model?                    ✗ Wrong    │ │
│  │  ○ A) 5 layers                                             │ │
│  │  ● B) 6 layers (Your answer - Wrong)                      │ │
│  │  ✓ C) 7 layers (Correct answer)                           │ │
│  │  ○ D) 8 layers                                             │ │
│  │  💡 Explanation: The OSI model has 7 layers...            │ │
│  ├───────────────────────────────────────────────────────────┤ │
│  │  ... (All 10 questions shown)                             │ │
│  │                                                            │ │
│  │  [Close Review]                                           │ │
│  └───────────────────────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow Architecture

```
┌──────────────┐
│   Frontend   │
│  (React)     │
└──────┬───────┘
       │
       │ 1. POST /api/mcq/generate
       │    { subject, difficulty }
       ▼
┌──────────────────────────────────────┐
│         Backend API                  │
│      (Express + Node.js)             │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  MCQ Route Handler             │ │
│  │  /api/mcq/generate             │ │
│  └────────┬───────────────────────┘ │
│           │                          │
│           │ 2. Create prompt         │
│           ▼                          │
│  ┌────────────────────────────────┐ │
│  │   Google Gemini AI             │ │
│  │   Generate 10 MCQs             │ │
│  └────────┬───────────────────────┘ │
│           │                          │
│           │ 3. Parse response        │
│           ▼                          │
│  ┌────────────────────────────────┐ │
│  │   Return Questions             │ │
│  │   [Q1, Q2, ..., Q10]          │ │
│  └────────────────────────────────┘ │
└──────────┬───────────────────────────┘
           │
           │ 4. Display questions
           ▼
┌──────────────────────────────────────┐
│   User Takes Exam                    │
│   - Selects answers                  │
│   - Navigates questions              │
│   - Submits exam                     │
└──────────┬───────────────────────────┘
           │
           │ 5. POST /api/mcq/submit
           │    { subject, answers, totalQuestions, timeTaken }
           ▼
┌──────────────────────────────────────┐
│         Backend API                  │
│                                      │
│  ┌────────────────────────────────┐ │
│  │  MCQ Submit Handler            │ │
│  │  /api/mcq/submit               │ │
│  └────────┬───────────────────────┘ │
│           │                          │
│           │ 6. Calculate score       │
│           │ 7. Award points          │
│           │ 8. Update level          │
│           ▼                          │
│  ┌────────────────────────────────┐ │
│  │   MongoDB                      │ │
│  │   Update User:                 │ │
│  │   - progress.points            │ │
│  │   - progress.totalQuestions    │ │
│  │   - progress.correctAnswers    │ │
│  │   - quizHistory[]              │ │
│  └────────┬───────────────────────┘ │
│           │                          │
│           │ 9. Return results        │
│           ▼                          │
│  ┌────────────────────────────────┐ │
│  │   Response:                    │ │
│  │   { score, points, level,      │ │
│  │     leveledUp, accuracy }      │ │
│  └────────────────────────────────┘ │
└──────────┬───────────────────────────┘
           │
           │ 10. Display results
           ▼
┌──────────────────────────────────────┐
│   Results Page                       │
│   - Show score & stats               │
│   - Show level up notification       │
│   - Offer review option              │
└──────────────────────────────────────┘
```

## Component Hierarchy

```
App.jsx
└── MCQExam.jsx (Route: /mcq-exam)
    ├── Header Section
    │   ├── Subject Title
    │   ├── Timer Display
    │   └── Fullscreen Toggle
    │
    ├── Progress Bar
    │
    ├── Question Card
    │   ├── Question Text
    │   └── Options (A, B, C, D)
    │
    ├── Navigation Section
    │   ├── Previous Button
    │   ├── Question Number Grid
    │   └── Next/Submit Button
    │
    ├── Results Section (after submit)
    │   ├── Score Display
    │   ├── Stats Cards
    │   ├── Level Up Notification
    │   └── Action Buttons
    │
    └── Review Modal (optional)
        └── Question Review List
            ├── Question with Answer
            ├── Correct/Wrong Indicator
            └── Explanation
```

## State Management

```javascript
MCQExam Component State:
├── questions: []           // Array of 10 MCQ questions
├── loading: true/false     // Loading state
├── currentQuestion: 0      // Current question index (0-9)
├── selectedAnswers: {}     // { questionId: selectedOption }
├── isFullscreen: true/false
├── timeElapsed: 0          // Seconds
├── examFinished: false
├── results: null           // Exam results object
└── showReview: false       // Review modal visibility
```

## API Request/Response Examples

### Generate Questions Request:
```json
POST /api/mcq/generate
Headers: { Authorization: "Bearer <token>" }
Body: {
  "subject": "Computer Network",
  "difficulty": "intermediate"
}
```

### Generate Questions Response:
```json
{
  "status": "success",
  "data": {
    "questions": [
      {
        "id": 1,
        "question": "What does TCP stand for?",
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

### Submit Exam Request:
```json
POST /api/mcq/submit
Headers: { Authorization: "Bearer <token>" }
Body: {
  "subject": "Computer Network",
  "answers": [
    {
      "questionId": 1,
      "selectedAnswer": "A",
      "correctAnswer": "A",
      "isCorrect": true
    },
    // ... 9 more answers
  ],
  "totalQuestions": 10,
  "timeTaken": 420
}
```

### Submit Exam Response:
```json
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

## Database Schema

```javascript
User Model - quizHistory Entry:
{
  subject: "Computer Network",
  score: 8,
  totalQuestions: 10,
  task: "MCQ Exam - Computer Network",
  performanceScore: 4,  // Out of 5
  pointsAwarded: 40,
  meta: {
    timeTaken: 420,
    difficulty: "intermediate"
  },
  timestamp: ISODate("2024-03-07T10:30:00Z")
}
```
