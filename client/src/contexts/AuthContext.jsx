import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

export const AuthContext = createContext()

// Safe sessionStorage wrapper
const safeSessionStorage = {
  getItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        const item = sessionStorage.getItem(key)
        return item && item !== 'undefined' && item !== 'null' ? item : null
      }
    } catch (error) {
      console.warn(`Failed to get ${key} from sessionStorage:`, error)
    }
    return null
  },
  setItem: (key, value) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage && value != null) {
        sessionStorage.setItem(key, value)
      }
    } catch (error) {
      console.warn(`Failed to set ${key} in sessionStorage:`, error)
    }
  },
  removeItem: (key) => {
    try {
      if (typeof window !== 'undefined' && window.sessionStorage) {
        sessionStorage.removeItem(key)
      }
    } catch (error) {
      console.warn(`Failed to remove ${key} from sessionStorage:`, error)
    }
  }
}

const initialState = {
  user: null,
  token: safeSessionStorage.getItem('token'),
  loading: true,
  error: null
}

const authReducer = (state, action) => {
  switch (action.type) {
    case 'AUTH_START':
      return {
        ...state,
        loading: true,
        error: null
      }
    
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        loading: false,
        error: null
      }
    
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: action.payload
      }
    
    case 'LOGOUT':
      return {
        ...state,
        user: null,
        token: null,
        loading: false,
        error: null
      }
    
    case 'UPDATE_USER':
      return {
        ...state,
        user: { ...state.user, ...action.payload }
      }
    
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      }
    
    default:
      return state
  }
}

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState)

  // Utility function to safely clear session storage
  const clearSession = () => {
    safeSessionStorage.removeItem('token')
    safeSessionStorage.removeItem('user')
  }

  // Clean up corrupted session data on startup
  useEffect(() => {
    const token = safeSessionStorage.getItem('token')
    const user = safeSessionStorage.getItem('user')
    
    // Try to parse user data to check if it's valid JSON
    if (user) {
      try {
        JSON.parse(user)
      } catch {
        console.warn('Corrupted user data found, clearing...')
        safeSessionStorage.removeItem('user')
      }
    }
  }, [])

  // Check if user is authenticated on app load (sessionStorage)
  useEffect(() => {
    const checkAuth = async () => {
      const token = safeSessionStorage.getItem('token')
      const storedUser = safeSessionStorage.getItem('user')
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' })
          // Optimistically hydrate user from sessionStorage to avoid flicker
          if (storedUser) {
            try {
              const parsedUser = JSON.parse(storedUser)
              dispatch({
                type: 'AUTH_SUCCESS',
                payload: { user: parsedUser, token }
              })
            } catch (parseError) {
              console.warn('Failed to parse stored user data:', parseError)
              // Clear invalid stored data
              safeSessionStorage.removeItem('user')
            }
          }
          // Validate token and refresh user from server
          const response = await authAPI.getCurrentUser()
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.data.user,
              token
            }
          })
          safeSessionStorage.setItem('user', JSON.stringify(response.data.data.user))
        } catch (error) {
          console.error('Auth check failed:', error)
          clearSession()
          dispatch({
            type: 'AUTH_FAILURE',
            payload: 'Authentication failed'
          })
        }
      } else {
        dispatch({ type: 'AUTH_FAILURE', payload: null })
      }
    }

    checkAuth()
  }, [])

  // Login function
  const login = async (email, password) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authAPI.login(email, password)
      
      const { user, token } = response.data.data
      
      safeSessionStorage.setItem('token', token)
      safeSessionStorage.setItem('user', JSON.stringify(user))
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Login failed'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      })
      return { success: false, error: message }
    }
  }

  // Face login function
  const faceLogin = async (faceDescriptor) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authAPI.faceLogin(faceDescriptor)
      
      const { user, token } = response.data.data
      
      safeSessionStorage.setItem('token', token)
      safeSessionStorage.setItem('user', JSON.stringify(user))
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Face login failed'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      })
      return { success: false, error: message }
    }
  }

  // Register function
  const register = async (userData) => {
    try {
      dispatch({ type: 'AUTH_START' })
      const response = await authAPI.register(userData)
      
      const { user, token } = response.data.data
      
      safeSessionStorage.setItem('token', token)
      safeSessionStorage.setItem('user', JSON.stringify(user))
      
      dispatch({
        type: 'AUTH_SUCCESS',
        payload: { user, token }
      })
      
      return { success: true }
    } catch (error) {
      const message = error.response?.data?.message || 'Registration failed'
      dispatch({
        type: 'AUTH_FAILURE',
        payload: message
      })
      return { success: false, error: message }
    }
  }

  // Logout function
  const logout = () => {
    clearSession()
    dispatch({ type: 'LOGOUT' })
  }

  // Update user function
  const updateUser = (userData) => {
    // Merge with existing user and persist to sessionStorage
    dispatch({
      type: 'UPDATE_USER',
      payload: userData
    })
    try {
      const currentUserData = safeSessionStorage.getItem('user')
      let current = null
      
      if (currentUserData) {
        current = JSON.parse(currentUserData)
      }
      
      const merged = { ...(current || {}), ...(userData || {}) }
      safeSessionStorage.setItem('user', JSON.stringify(merged))
    } catch (error) {
      console.warn('Failed to update user in sessionStorage:', error)
      // If parsing fails, just store the new userData
      if (userData) {
        safeSessionStorage.setItem('user', JSON.stringify(userData))
      }
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
  }

  // Manual session cleanup function (for debugging)
  const clearCorruptedSession = () => {
    console.log('Manually clearing session data...')
    clearSession()
    dispatch({ type: 'LOGOUT' })
    window.location.reload()
  }

  const value = {
    user: state.user,
    token: state.token,
    loading: state.loading,
    error: state.error,
    login,
    faceLogin,
    register,
    logout,
    updateUser,
    clearError,
    clearCorruptedSession
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 