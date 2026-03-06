# MCQ Feature Testing Checklist

## Pre-Testing Setup

- [ ] MongoDB is running and connected
- [ ] Gemini API key is set in `server/.env`
- [ ] Backend server is running (`cd server && npm run dev`)
- [ ] Frontend client is running (`cd client && npm run dev`)
- [ ] User is logged in to the application

## Feature Testing

### 1. Questions Tab - MCQ Button
- [ ] Navigate to Questions tab
- [ ] Verify MCQ button is visible on each subject card
- [ ] MCQ button has correct styling (blue background, white text)
- [ ] MCQ button shows BookOpen icon
- [ ] Hover effect works on MCQ button

### 2. Navigation to Exam
- [ ] Click MCQ button on "Computer Network" subject
- [ ] Page navigates to `/mcq-exam` route
- [ ] Subject information is passed correctly
- [ ] No console errors during navigation

### 3. Exam Page Loading
- [ ] Loading spinner appears while generating questions
- [ ] Loading message displays: "Generating your exam questions..."
- [ ] Page automatically enters full-screen mode
- [ ] Timer starts at 0:00

### 4. Question Generation
- [ ] Exactly 10 questions are generated
- [ ] Each question has 4 options (A, B, C, D)
- [ ] Questions are relevant to the selected subject
- [ ] No duplicate questions
- [ ] Questions load within 10 seconds

### 5. Exam Interface - Header
- [ ] Subject name displays correctly
- [ ] Current question number shows (e.g., "Question 1 of 10")
- [ ] Timer displays and updates every second
- [ ] Full-screen toggle button is visible
- [ ] Full-screen toggle works (Maximize/Minimize icon changes)

### 6. Exam Interface - Progress Bar
- [ ] Progress bar is visible
- [ ] Progress bar shows 0% at start
- [ ] Progress bar updates as user navigates questions
- [ ] Progress bar shows 100% on last question

### 7. Question Display
- [ ] Question text is clearly visible
- [ ] All 4 options (A, B, C, D) are displayed
- [ ] Options are clickable
- [ ] Selected option highlights in blue
- [ ] Only one option can be selected at a time

### 8. Navigation - Previous/Next Buttons
- [ ] "Previous" button is disabled on first question
- [ ] "Next" button works and moves to next question
- [ ] "Previous" button works and moves to previous question
- [ ] "Submit Exam" button appears on last question
- [ ] Button states update correctly

### 9. Navigation - Question Number Grid
- [ ] All 10 question numbers are displayed
- [ ] Current question is highlighted (blue background)
- [ ] Answered questions show green background
- [ ] Unanswered questions show gray background
- [ ] Clicking a number navigates to that question

### 10. Answer Selection
- [ ] Can select answer on any question
- [ ] Selected answer persists when navigating away and back
- [ ] Can change answer before submitting
- [ ] Visual feedback when selecting answer

### 11. Exam Submission
- [ ] "Submit Exam" button appears on question 10
- [ ] Confirmation prompt if not all questions answered
- [ ] Can proceed with submission even if incomplete
- [ ] Loading state during submission
- [ ] No errors during submission

### 12. Results Page - Score Display
- [ ] Results page loads after submission
- [ ] Full-screen mode exits automatically
- [ ] Score percentage displays correctly
- [ ] Correct/Total count is accurate (e.g., "8/10")
- [ ] Points earned displays correctly
- [ ] Current level displays

### 13. Results Page - Level System
- [ ] Level is calculated correctly based on total points:
  - [ ] 0-99 points = Level 1
  - [ ] 100-249 points = Level 2
  - [ ] 250-499 points = Level 3
  - [ ] 500-999 points = Level 4
  - [ ] 1000+ points = Level 5
- [ ] Level-up notification appears if leveled up
- [ ] Level-up notification shows correct new level

### 14. Results Page - Points System
- [ ] Points awarded correctly based on score:
  - [ ] 90%+ = 50 points
  - [ ] 80-89% = 40 points
  - [ ] 70-79% = 30 points
  - [ ] 60-69% = 20 points
  - [ ] 50-59% = 10 points
  - [ ] Below 50% = 0 points
- [ ] Total points displays correctly
- [ ] Overall accuracy percentage is correct

### 15. Review Answers Feature
- [ ] "Review Answers" button is visible
- [ ] Clicking button opens review modal
- [ ] Modal displays all 10 questions
- [ ] Correct answers highlighted in green
- [ ] Wrong answers highlighted in red
- [ ] User's selected answer is marked
- [ ] Correct answer is clearly indicated
- [ ] Explanations are displayed for each question
- [ ] Modal is scrollable if content is long
- [ ] "Close Review" button works

### 16. Review Modal - Question Display
- [ ] Each question shows:
  - [ ] Question number and text
  - [ ] All 4 options
  - [ ] User's selected answer (if any)
  - [ ] Correct answer marked with ✓
  - [ ] Wrong answer marked with ✗
  - [ ] Explanation text
- [ ] Color coding is clear and consistent
- [ ] Text is readable

### 17. Navigation After Results
- [ ] "Back to Questions" button works
- [ ] Returns to Questions tab
- [ ] Can start another exam
- [ ] Previous exam data is saved

### 18. Database Updates
- [ ] User's `progress.points` updated in database
- [ ] User's `progress.totalQuestions` incremented
- [ ] User's `progress.correctAnswers` updated
- [ ] New entry added to `quizHistory` array
- [ ] Quiz history entry contains:
  - [ ] Subject name
  - [ ] Score
  - [ ] Total questions
  - [ ] Task description
  - [ ] Performance score
  - [ ] Points awarded
  - [ ] Metadata (time taken, difficulty)
  - [ ] Timestamp

### 19. Dashboard Integration
- [ ] Points from exam appear on dashboard
- [ ] Level displays correctly on dashboard
- [ ] User statistics updated
- [ ] Progress bars reflect new data

### 20. Multiple Subjects
- [ ] Test MCQ for "Database Management"
  - [ ] Questions are about DBMS
  - [ ] All features work correctly
- [ ] Test MCQ for "Python"
  - [ ] Questions are about Python
  - [ ] All features work correctly
- [ ] Test MCQ for "Java"
  - [ ] Questions are about Java
  - [ ] All features work correctly

### 21. Edge Cases
- [ ] Submit exam with 0 answers selected
- [ ] Submit exam with only 1 answer selected
- [ ] Submit exam with all answers correct
- [ ] Submit exam with all answers wrong
- [ ] Navigate away during exam (data should persist)
- [ ] Refresh page during exam (should redirect)
- [ ] Take multiple exams in succession

### 22. Error Handling
- [ ] Graceful error if Gemini API fails
- [ ] Error message if network is down
- [ ] Error handling if MongoDB is disconnected
- [ ] Error if user is not authenticated
- [ ] Timeout handling for slow API responses

### 23. Performance
- [ ] Questions generate in < 10 seconds
- [ ] Page transitions are smooth
- [ ] No lag when selecting answers
- [ ] No lag when navigating questions
- [ ] Results calculate instantly

### 24. Responsive Design
- [ ] Works on desktop (1920x1080)
- [ ] Works on laptop (1366x768)
- [ ] Works on tablet (768x1024)
- [ ] Works on mobile (375x667)
- [ ] Full-screen works on all devices

### 25. Browser Compatibility
- [ ] Works on Chrome
- [ ] Works on Firefox
- [ ] Works on Safari
- [ ] Works on Edge
- [ ] Full-screen API works on all browsers

### 26. Accessibility
- [ ] Keyboard navigation works
- [ ] Tab order is logical
- [ ] Focus indicators are visible
- [ ] Color contrast is sufficient
- [ ] Text is readable at all sizes

### 27. Security
- [ ] JWT token is required for API calls
- [ ] Unauthorized users cannot access exam
- [ ] API endpoints validate user authentication
- [ ] No sensitive data in console logs
- [ ] No API keys exposed in frontend

### 28. Data Persistence
- [ ] Selected answers persist during exam
- [ ] Exam results saved to database
- [ ] Points persist after logout/login
- [ ] Level persists after logout/login
- [ ] Quiz history persists

## Regression Testing

### After Each Code Change:
- [ ] MCQ button still works
- [ ] Question generation still works
- [ ] Scoring still works
- [ ] Points still update
- [ ] Level still calculates correctly
- [ ] Review feature still works
- [ ] No new console errors
- [ ] No broken UI elements

## Performance Benchmarks

- [ ] Question generation: < 10 seconds
- [ ] Page load time: < 2 seconds
- [ ] Answer selection response: < 100ms
- [ ] Navigation between questions: < 100ms
- [ ] Exam submission: < 2 seconds
- [ ] Results display: < 1 second

## User Experience Testing

- [ ] Instructions are clear
- [ ] UI is intuitive
- [ ] No confusing elements
- [ ] Error messages are helpful
- [ ] Success messages are encouraging
- [ ] Loading states are informative

## Final Verification

- [ ] All features work as expected
- [ ] No critical bugs found
- [ ] Performance is acceptable
- [ ] User experience is smooth
- [ ] Documentation is accurate
- [ ] Code is clean and maintainable

## Sign-Off

- [ ] Developer testing complete
- [ ] QA testing complete (if applicable)
- [ ] User acceptance testing complete (if applicable)
- [ ] Ready for production deployment

---

## Testing Notes

**Date:** _________________

**Tester:** _________________

**Environment:** _________________

**Issues Found:**
1. _________________
2. _________________
3. _________________

**Overall Status:** ☐ Pass  ☐ Fail  ☐ Needs Review

**Additional Comments:**
_________________________________________________________________
_________________________________________________________________
_________________________________________________________________
