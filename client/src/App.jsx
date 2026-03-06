// This is your main App.jsx - it's already correct
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './hooks/useAuth'
import { AuthProvider } from './contexts/AuthContext'
import Layout from './components/Layout'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import Subjects from './pages/Subjects'
import Questions from './pages/Questions'
import DBMSQuiz from './pages/DBMSQuiz'
import Profile from './pages/Profile'
import FaceLogin from './pages/FaceLogin'
import NetworkingPlayground from './pages/NetworkingPlayground'
import CodeEditor from './pages/CodeEditor'
import Splash from './pages/Splash'
import LoadingSpinner from './components/LoadingSpinner'
import SessionDebug from './components/SessionDebug'
// Add these imports
import ComputerNetworkSyllabus from './pages/syllabus/ComputerNetworkSyllabus';
import DBMSSyllabus from './pages/syllabus/DBMSSyllabus';
import PythonSyllabus from './pages/syllabus/PythonSyllabus';
import JavaSyllabus from './pages/syllabus/JavaSyllabus';
import CppSyllabus from './pages/syllabus/CppSyllabus';
import CSyllabus from './pages/syllabus/CSyllabus';
import EnglishFluencyRecorder from './EnglishFluencyRecorder' // Add this import

// Protected Route Component
const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? children : <Navigate to="/login" replace />
}

// Public Route Component (redirects to dashboard if already logged in)
const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  
  if (loading) {
    return <LoadingSpinner />
  }
  
  return user ? <Navigate to="/dashboard" replace /> : children
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/login" element={
        <PublicRoute>
          <Login />
        </PublicRoute>
      } />
      <Route path="/register" element={
        <PublicRoute>
          <Register />
        </PublicRoute>
      } />
      <Route path="/splash" element={
        <ProtectedRoute>
          <Splash />
        </ProtectedRoute>
      } />
      <Route path="/face-login" element={
        <PublicRoute>
          <FaceLogin />
        </PublicRoute>
      } />
      
      {/* Protected Routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
      </Route>
      
      <Route path="/subjects" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Subjects />} />
      </Route>
      
      <Route path="/questions" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Questions />} />
      </Route>

      {/* DBMS Quiz Route */}
      <Route path="/dbms-quiz" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DBMSQuiz />} />
      </Route>

      {/* Networking Playground Route */}
      <Route path="/networking-playground" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<NetworkingPlayground />} />
      </Route>

      {/* Code Editor Route */}
      <Route path="/code-editor" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<CodeEditor />} />
      </Route>

      {/* English Fluency Recorder Route */}
      <Route path="/english-fluency" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<EnglishFluencyRecorder />} />
      </Route>
      
      <Route path="/profile" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<Profile />} />
      </Route>

      {/* Syllabus Routes */}
      <Route path="/syllabus/computer-network" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<ComputerNetworkSyllabus />} />
      </Route>

      <Route path="/syllabus/dbms" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<DBMSSyllabus />} />
      </Route>

      <Route path="/syllabus/python" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<PythonSyllabus />} />
      </Route>

      <Route path="/syllabus/java" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<JavaSyllabus />} />
      </Route>

      <Route path="/syllabus/cpp" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<CppSyllabus />} />
      </Route>

      <Route path="/syllabus/c-programming" element={
        <ProtectedRoute>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<CSyllabus />} />
      </Route>
      
      {/* Redirect root to dashboard */}
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      
      {/* Catch all route */}
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  )
}

function App() {
  return (
    <AuthProvider>
      <SessionDebug />
      <AppRoutes />
    </AuthProvider>
  )
}

export default App