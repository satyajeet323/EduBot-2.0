# EduBot Error Fixes & Prevention Guide

## ✅ **FIXED ERRORS**

### 1. **Server Route Error (path-to-regexp)**
**Error:** `TypeError: Missing parameter name at 1: https://git.new/pathToRegexpError`

**Root Cause:** Express 5.1.0 compatibility issues with route parsing

**Solution:** 
- Downgraded Express from `^5.1.0` to `^4.18.2` in `server/package.json`
- Reordered routes in `server/routes/subject.js` to put specific routes before parameterized routes

**Prevention:** 
- Always use Express 4.x for stable route handling
- Order routes from most specific to least specific

### 2. **Client CSS Error (border-border class)**
**Error:** `The 'border-border' class does not exist`

**Root Cause:** Missing CSS variables in Tailwind configuration

**Solution:**
- Added CSS variables to `client/src/index.css` (`:root` and `.dark` selectors)
- Updated `client/tailwind.config.js` with proper color definitions
- Added all required CSS custom properties

**Prevention:**
- Always define CSS variables before using them in Tailwind classes
- Use a consistent design system with proper variable definitions

### 3. **Canvas Package Installation Error**
**Error:** `gyp ERR! find VS You need to install the latest version of Visual Studio`

**Root Cause:** Native compilation requirements on Windows

**Solution:**
- Removed `canvas` dependency from `server/package.json`
- Face recognition works with simulation instead

**Prevention:**
- Avoid native dependencies when possible
- Use cross-platform alternatives

### 4. **AuthContext Export Error**
**Error:** `The requested module '/src/contexts/AuthContext.jsx' does not provide an export named 'AuthContext'`

**Root Cause:** Missing export statement for AuthContext

**Solution:**
- Added `export` keyword to `AuthContext` declaration in `client/src/contexts/AuthContext.jsx`
- Removed duplicate `useAuth` function from context file
- Kept `useAuth` hook in separate `client/src/hooks/useAuth.js` file

**Prevention:**
- Always export context objects when they need to be imported elsewhere
- Avoid duplicate function definitions
- Use proper ES6 module syntax

## 🛠️ **CURRENT STATUS**

### ✅ **Server (Backend)**
- **URL:** http://localhost:5000
- **Status:** ✅ Running successfully
- **MongoDB:** ✅ Connected to Atlas cluster
- **API Endpoints:** ✅ All functional

### ✅ **Client (Frontend)**
- **URL:** http://localhost:5173
- **Status:** ✅ Running successfully
- **React App:** ✅ Rendering correctly
- **CSS:** ✅ All styles loading properly

## 🚀 **HOW TO START**

### **Option 1: Use the startup script**
```bash
# Double-click start-dev.bat
```

### **Option 2: Manual startup**
```bash
# Terminal 1 - Start server
cd server
npm run dev

# Terminal 2 - Start client
cd client
npm run dev
```

## 🔧 **ENVIRONMENT SETUP**

1. **Create environment file:**
   ```bash
   cd server
   copy env.example .env
   ```

2. **Update environment variables:**
   - Set your MongoDB URI
   - Add your Google Gemini API key
   - Configure JWT secret

## 🎯 **TESTING**

### **Server Health Check:**
```bash
curl http://localhost:5000/api/health
```

### **Client Loading:**
```bash
curl http://localhost:5173
```

## 📝 **BEST PRACTICES**

1. **Always export context objects** that need to be imported
2. **Use Express 4.x** for stable route handling
3. **Define CSS variables** before using them in Tailwind
4. **Avoid native dependencies** when possible
5. **Order routes** from specific to general
6. **Use proper ES6 module syntax**

## 🚨 **COMMON PITFALLS TO AVOID**

1. **Don't use Express 5.x** until it's stable
2. **Don't forget to export** context objects
3. **Don't use undefined CSS classes** in Tailwind
4. **Don't install native packages** without build tools
5. **Don't duplicate function definitions**

## 🎉 **SUCCESS INDICATORS**

- ✅ Server starts without route errors
- ✅ Client loads without CSS errors
- ✅ No console errors in browser
- ✅ MongoDB connection successful
- ✅ All API endpoints responding
- ✅ React app rendering correctly 