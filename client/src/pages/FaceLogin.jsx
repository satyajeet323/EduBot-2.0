import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { Camera, ArrowLeft } from 'lucide-react'
import toast from 'react-hot-toast'

const FaceLogin = () => {
  const { faceLogin } = useAuth()
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)

  const handleFaceLogin = async () => {
    setIsLoading(true)
    try {
      // Simulate face detection - in real app, you'd use face-api.js
      const mockDescriptor = Array.from({ length: 128 }, () => Math.random() * 2 - 1)
      const result = await faceLogin(mockDescriptor)
      
      if (result.success) {
        toast.success('Face login successful!')
        navigate('/dashboard')
      } else {
        toast.error(result.error || 'Face login failed')
      }
    } catch (error) {
      toast.error('An error occurred during face login')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-12 w-12 bg-primary-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-xl">E</span>
          </div>
          <h2 className="mt-6 text-3xl font-extrabold text-gray-900">
            Face Recognition Login
          </h2>
          <p className="mt-2 text-sm text-gray-600">
            Look at the camera to sign in securely
          </p>
        </div>

        {/* Face Recognition Interface */}
        <div className="space-y-6">
          <div className="camera-container">
            <div className="bg-gray-100 rounded-lg p-8 text-center">
              <Camera className="mx-auto h-16 w-16 text-gray-400 mb-4" />
              <p className="text-sm text-gray-600 mb-4">
                Camera access is required for face recognition
              </p>
              <button
                onClick={handleFaceLogin}
                disabled={isLoading}
                className="btn btn-primary"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="loading-spinner w-4 h-4 mr-2"></div>
                    Processing...
                  </div>
                ) : (
                  'Start Face Recognition'
                )}
              </button>
            </div>
          </div>

          {/* Back to Login */}
          <div className="text-center">
            <button
              onClick={() => navigate('/login')}
              className="inline-flex items-center text-sm font-medium text-primary-600 hover:text-primary-500"
            >
              <ArrowLeft className="w-4 h-4 mr-1" />
              Back to email login
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default FaceLogin 