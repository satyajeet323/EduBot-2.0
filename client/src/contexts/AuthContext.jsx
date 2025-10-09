import { createContext, useContext, useReducer, useEffect } from 'react'
import { authAPI } from '../services/api'

export const AuthContext = createContext()

const initialState = {
  user: null,
  token: sessionStorage.getItem('token'),
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

  // Check if user is authenticated on app load (sessionStorage)
  useEffect(() => {
    const checkAuth = async () => {
      const token = sessionStorage.getItem('token')
      const storedUser = sessionStorage.getItem('user')
      
      if (token) {
        try {
          dispatch({ type: 'AUTH_START' })
          // Optimistically hydrate user from sessionStorage to avoid flicker
          if (storedUser) {
            dispatch({
              type: 'AUTH_SUCCESS',
              payload: { user: JSON.parse(storedUser), token }
            })
          }
          // Validate token and refresh user from server
          const response = await authAPI.getCurrentUser()
          dispatch({
            type: 'AUTH_SUCCESS',
            payload: {
              user: response.data.user,
              token
            }
          })
          sessionStorage.setItem('user', JSON.stringify(response.data.user))
        } catch (error) {
          console.error('Auth check failed:', error)
          sessionStorage.removeItem('token')
          sessionStorage.removeItem('user')
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
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      
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
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      
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
      sessionStorage.setItem('token', token)
      sessionStorage.setItem('user', JSON.stringify(user))
      
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
    sessionStorage.removeItem('token')
    sessionStorage.removeItem('user')
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
      const current = JSON.parse(sessionStorage.getItem('user') || 'null')
      const merged = { ...(current || {}), ...(userData || {}) }
      sessionStorage.setItem('user', JSON.stringify(merged))
    } catch (_) {
      // ignore persistence errors
    }
  }

  // Clear error function
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' })
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
    clearError
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
} 