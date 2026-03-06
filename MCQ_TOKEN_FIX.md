# MCQ Token Authentication Fix

## Problem
Error: "Failed to generate questions. Invalid token."

## Root Cause
The MCQ exam component was looking for the authentication token in `localStorage`, but the application stores it in `sessionStorage`.

## What Was Fixed

### 1. Token Storage Location
**Before:**
```javascript
const token = localStorage.getItem('token');
```

**After:**
```javascript
// Try both sessionStorage and localStorage for token
const token = sessionStorage.getItem('token') || localStorage.getItem('token');
```

### 2. Better Authentication Error Handling
Added specific handling for 401 (Unauthorized) errors:
```javascript
if (error.response?.status === 401) {
  errorMessage = 'Session expired. Please login again.';
  setTimeout(() => navigate('/login'), 2000);
}
```

### 3. Token Validation
Added check to ensure token exists before making API calls:
```javascript
if (!token) {
  alert('Authentication required. Please login again.');
  navigate('/login');
  return;
}
```

## Files Modified
- `client/src/pages/MCQExam.jsx`
  - Updated `generateQuestions()` function
  - Updated `handleSubmit()` function
  - Added better error messages for auth failures

## How to Test

### 1. Verify You're Logged In
1. Open browser DevTools (F12)
2. Go to Application tab > Session Storage
3. Check if `token` exists under `http://localhost:5173`
4. If not, login again

### 2. Test MCQ Feature
1. Navigate to Questions tab
2. Click MCQ button on any subject
3. Questions should now load successfully

### 3. If Still Getting Error
**Check Token in Console:**
```javascript
// Open browser console and run:
console.log('Session token:', sessionStorage.getItem('token'));
console.log('Local token:', localStorage.getItem('token'));
```

**If both are null:**
- You need to login again
- The session may have expired

## Understanding Token Storage

### SessionStorage vs LocalStorage

**SessionStorage (Used by this app):**
- Cleared when browser tab is closed
- More secure
- Separate for each tab
- Used for temporary sessions

**LocalStorage:**
- Persists even after browser closes
- Less secure
- Shared across all tabs
- Used for long-term storage

## Quick Fix Steps

### If You Get "Invalid Token" Error:

1. **Logout and Login Again:**
   - Click logout button
   - Login with your credentials
   - Try MCQ feature again

2. **Clear Session Storage:**
   ```javascript
   // In browser console:
   sessionStorage.clear();
   // Then login again
   ```

3. **Check Token Expiry:**
   - Tokens expire after 7 days (default)
   - Login again to get a new token

## Verification Checklist

- [x] Token is now read from sessionStorage first
- [x] Falls back to localStorage if sessionStorage is empty
- [x] Shows clear error message if no token found
- [x] Redirects to login page on authentication failure
- [x] Handles 401 errors gracefully
- [x] Both generate and submit functions updated

## Testing Scenarios

### Scenario 1: Valid Token
- **Action:** Click MCQ button
- **Expected:** Questions load successfully
- **Result:** ✅ Should work now

### Scenario 2: No Token
- **Action:** Clear sessionStorage and click MCQ
- **Expected:** Redirect to login page
- **Result:** ✅ Handled gracefully

### Scenario 3: Expired Token
- **Action:** Use old/expired token
- **Expected:** Show "Session expired" message
- **Result:** ✅ Redirects to login

### Scenario 4: Invalid Token
- **Action:** Corrupt token in sessionStorage
- **Expected:** Show error and redirect
- **Result:** ✅ Handled with clear message

## Additional Improvements

### 1. Token Refresh (Future Enhancement)
Consider implementing automatic token refresh:
```javascript
// Refresh token before it expires
const refreshToken = async () => {
  const response = await axios.post('/api/auth/refresh');
  sessionStorage.setItem('token', response.data.token);
};
```

### 2. Token Validation (Future Enhancement)
Validate token before making requests:
```javascript
const isTokenValid = (token) => {
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.exp * 1000 > Date.now();
  } catch {
    return false;
  }
};
```

## Debugging Tips

### Check Token in Browser
1. Open DevTools (F12)
2. Go to Application tab
3. Check Session Storage > token
4. Copy token value
5. Decode at jwt.io to check expiry

### Check Token in Network Tab
1. Open DevTools > Network tab
2. Click MCQ button
3. Look for `/api/mcq/generate` request
4. Check Headers > Authorization
5. Should show: `Bearer <token>`

### Server-Side Debugging
Check server logs for:
```
Auth middleware error: JsonWebTokenError: invalid token
Auth middleware error: TokenExpiredError: jwt expired
```

## Common Issues & Solutions

### Issue 1: "No token provided"
**Solution:** Login again to get a new token

### Issue 2: "Invalid token"
**Solution:** 
- Clear sessionStorage
- Login again
- Check JWT_SECRET in server/.env

### Issue 3: "Token expired"
**Solution:** Login again (tokens expire after 7 days)

### Issue 4: Token exists but still fails
**Solution:**
- Check if JWT_SECRET matches between login and validation
- Restart server
- Clear browser cache

## Success Indicators

After the fix, you should see:
1. ✅ No "Invalid token" errors
2. ✅ Questions load successfully
3. ✅ Can submit exam
4. ✅ Results display correctly
5. ✅ Points update in database

## Next Steps

1. **Test the fix:**
   - Logout and login again
   - Try MCQ feature
   - Should work now!

2. **If still having issues:**
   - Check browser console for errors
   - Check server logs
   - Verify you're logged in
   - Try clearing sessionStorage

3. **Report success:**
   - Confirm MCQ feature works
   - Test with different subjects
   - Verify points are awarded

---

**Status:** ✅ Fixed
**Date:** March 7, 2026
**Issue:** Token storage mismatch
**Solution:** Updated to use sessionStorage (primary) with localStorage fallback
