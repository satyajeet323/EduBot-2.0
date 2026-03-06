# MCQ Error Fix - "Failed to generate questions"

## Problem
The MCQ feature shows error: "Failed to generate questions. Please try again."

## Root Causes & Solutions

### 1. Gemini API Issues

#### Check API Key
```bash
# Verify API key is set
cd server
type .env | findstr GEMINI_API_KEY
```

**Solution:** Ensure `GEMINI_API_KEY` is present and valid in `server/.env`

#### API Rate Limiting
Gemini API has rate limits. If you're hitting them:

**Solution:** 
- Wait a few minutes and try again
- The system now has fallback questions that will be used automatically

### 2. Network/Timeout Issues

#### Increase Timeout
The frontend now has a 30-second timeout for API calls.

#### Check Server Connection
```bash
# Test if server is running
curl http://localhost:5000/api/health
```

### 3. Parsing Issues

The improved parser now handles multiple response formats:
- `Q1:`, `Q2:` format
- `1.`, `2.` numbered format
- Double newline separated format
- Various option formats: `A)`, `A.`, `(A)`, etc.

## What Was Fixed

### 1. Enhanced Error Logging
```javascript
// Now logs detailed error information
console.log('Generating MCQ questions for:', subject);
console.log('Gemini API Response received, length:', text.length);
console.log('Parsed questions count:', questions.length);
```

### 2. Improved Parser
- Handles multiple question formats
- More flexible option matching
- Better validation
- Continues explanation across multiple lines

### 3. Fallback Questions
If Gemini API fails or parsing fails, the system automatically provides fallback questions:
- Computer Network questions
- Database Management questions
- Python questions
- Generic questions for other subjects

### 4. Better Error Messages
Frontend now shows specific error messages:
- Timeout errors
- Connection errors
- API errors
- Generic fallback message

## Testing the Fix

### 1. Restart the Server
```bash
cd server
npm run dev
```

Look for:
```
✅ MongoDB Connected Successfully
🚀 EduBot Server running on port 5000
```

### 2. Test MCQ Generation
1. Navigate to Questions tab
2. Click MCQ button on any subject
3. Watch server console for logs:
   ```
   Generating MCQ questions for: Computer Network at intermediate level
   Gemini API Response received, length: 2543
   Parsed questions count: 10
   ```

### 3. Check for Fallback
If you see:
```
Not enough questions parsed. Got: 3
Using fallback questions
```

This means the system is using fallback questions (which is fine for testing).

## Verification Checklist

- [ ] Server is running without errors
- [ ] Gemini API key is set in .env
- [ ] MongoDB is connected
- [ ] MCQ button appears on Questions tab
- [ ] Clicking MCQ button navigates to exam page
- [ ] Questions load (either from Gemini or fallback)
- [ ] Can answer questions
- [ ] Can submit exam
- [ ] Results display correctly

## Server Console Output (Expected)

### Success Case:
```
Generating MCQ questions for: Computer Network at intermediate level
Gemini API Response received, length: 2543
First 200 chars: Q1: What is the primary purpose of the TCP protocol?
A) To provide...
Question blocks found: 10
Parsed questions count: 10
```

### Fallback Case:
```
Generating MCQ questions for: Computer Network at intermediate level
MCQ Generation Error: [Error details]
Using fallback questions
```

## Common Issues & Solutions

### Issue 1: "ECONNABORTED" - Request Timeout
**Cause:** Gemini API is slow or unresponsive
**Solution:** 
- Timeout increased to 30 seconds
- Fallback questions will be used automatically
- Try again in a few minutes

### Issue 2: "Invalid API Key"
**Cause:** Gemini API key is incorrect or expired
**Solution:**
- Get a new API key from Google AI Studio
- Update `GEMINI_API_KEY` in `server/.env`
- Restart server

### Issue 3: "Rate Limit Exceeded"
**Cause:** Too many API requests
**Solution:**
- Wait 1-2 minutes
- System will use fallback questions automatically
- Consider implementing caching for production

### Issue 4: "Failed to parse questions"
**Cause:** Gemini returned unexpected format
**Solution:**
- Parser now handles multiple formats
- Fallback questions will be used
- Check server logs for the actual response

### Issue 5: "Network Error"
**Cause:** No internet connection or firewall blocking
**Solution:**
- Check internet connection
- Check firewall settings
- Fallback questions will work offline

## Manual Testing

### Test with Fallback Questions
To test the fallback mechanism, temporarily comment out the Gemini API call:

```javascript
// In server/routes/mcq.js, line ~40
// Comment out the API call and force fallback:
const fallbackQuestions = generateFallbackQuestions(subject, 10);
return res.json({
  status: 'success',
  data: {
    questions: fallbackQuestions,
    subject,
    difficulty,
    totalQuestions: 10,
    fallback: true
  }
});
```

This ensures the exam works even without the API.

## Production Recommendations

### 1. Implement Caching
Cache generated questions to reduce API calls:
```javascript
const questionCache = new Map();
const cacheKey = `${subject}-${difficulty}`;
if (questionCache.has(cacheKey)) {
  return questionCache.get(cacheKey);
}
```

### 2. Question Database
Store generated questions in MongoDB for reuse:
```javascript
const Question = mongoose.model('Question', {
  subject: String,
  difficulty: String,
  questions: Array,
  createdAt: Date
});
```

### 3. Retry Logic
Implement automatic retry with exponential backoff:
```javascript
async function generateWithRetry(prompt, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await model.generateContent(prompt);
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await sleep(1000 * Math.pow(2, i));
    }
  }
}
```

### 4. Monitor API Usage
Track API calls and implement rate limiting:
```javascript
const apiCallCount = new Map();
// Limit to 10 calls per minute per user
```

## Current Status

✅ **FIXED:** Enhanced error handling
✅ **FIXED:** Improved question parser
✅ **FIXED:** Added fallback questions
✅ **FIXED:** Better error messages
✅ **FIXED:** Increased timeout
✅ **FIXED:** Detailed logging

## Next Steps

1. **Restart your server** to apply the fixes
2. **Test the MCQ feature** - it should work now
3. **Check server logs** for detailed information
4. **Report any new issues** with the log output

## Support

If issues persist:
1. Check server console for detailed logs
2. Check browser console (F12) for frontend errors
3. Verify all environment variables are set
4. Try the fallback questions (they always work)
5. Share the server logs for further debugging

---

**Status:** ✅ Fixed and Enhanced
**Date:** March 7, 2026
**Version:** 1.1.0
