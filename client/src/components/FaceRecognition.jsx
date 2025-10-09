import React, { useState, useRef, useCallback } from 'react'
import Webcam from 'react-webcam'
import { Camera, User, AlertCircle, CheckCircle, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'

const FaceRecognition = ({ onFaceDetected, onError, mode = 'login', isLoading = false }) => {
  const [isCapturing, setIsCapturing] = useState(false)
  const [capturedImage, setCapturedImage] = useState(null)
  const [detectionStatus, setDetectionStatus] = useState('idle') // idle, detecting, success, error
  const webcamRef = useRef(null)

  const videoConstraints = {
    width: 400,
    height: 300,
    facingMode: 'user'
  }

  const capture = useCallback(() => {
    if (webcamRef.current) {
      setIsCapturing(true)
      setDetectionStatus('detecting')
      
      const imageSrc = webcamRef.current.getScreenshot()
      setCapturedImage(imageSrc)
      
      // Simulate face detection process
      setTimeout(() => {
        // Simulate face detection success (90% success rate for demo)
        const isSuccess = Math.random() > 0.1
        
        if (isSuccess) {
          setDetectionStatus('success')
          toast.success('Face detected successfully!')
          
          // Generate a simulated face descriptor
          const faceDescriptor = Array.from({ length: 128 }, () => Math.random())
          
          if (onFaceDetected) {
            onFaceDetected(faceDescriptor, imageSrc)
          }
        } else {
          setDetectionStatus('error')
          toast.error('No face detected. Please try again.')
          
          if (onError) {
            onError('No face detected in the image')
          }
        }
        
        setIsCapturing(false)
      }, 2000)
    }
  }, [onFaceDetected, onError])

  const retake = () => {
    setCapturedImage(null)
    setDetectionStatus('idle')
  }

  const getStatusIcon = () => {
    switch (detectionStatus) {
      case 'detecting':
        return <Loader2 className="w-6 h-6 text-blue-500 animate-spin" />
      case 'success':
        return <CheckCircle className="w-6 h-6 text-green-500" />
      case 'error':
        return <AlertCircle className="w-6 h-6 text-red-500" />
      default:
        return <Camera className="w-6 h-6 text-gray-400" />
    }
  }

  const getStatusText = () => {
    switch (detectionStatus) {
      case 'detecting':
        return 'Detecting face...'
      case 'success':
        return 'Face detected!'
      case 'error':
        return 'No face detected'
      default:
        return mode === 'login' ? 'Click to capture your face' : 'Click to register your face'
    }
  }

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          {mode === 'login' ? 'Face Login' : 'Face Registration'}
        </h3>
        <p className="text-sm text-gray-600">
          {mode === 'login' 
            ? 'Position your face in the camera and click capture'
            : 'Take a clear photo of your face for registration'
          }
        </p>
      </div>

      <div className="relative">
        {!capturedImage ? (
          <div className="relative">
            <Webcam
              ref={webcamRef}
              audio={false}
              screenshotFormat="image/jpeg"
              videoConstraints={videoConstraints}
              className="w-full rounded-lg border-2 border-gray-200"
            />
            <div className="absolute inset-0 border-2 border-blue-500 border-dashed rounded-lg pointer-events-none">
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                <div className="w-32 h-32 border-2 border-blue-500 rounded-full"></div>
              </div>
            </div>
          </div>
        ) : (
          <div className="relative">
            <img
              src={capturedImage}
              alt="Captured face"
              className="w-full rounded-lg border-2 border-gray-200"
            />
            <div className="absolute inset-0 bg-black bg-opacity-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-white">
                {getStatusIcon()}
                <p className="mt-2 font-medium">{getStatusText()}</p>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="flex justify-center space-x-4">
        {!capturedImage ? (
          <button
            onClick={capture}
            disabled={isCapturing || isLoading}
            className="btn btn-primary btn-lg flex items-center"
          >
            {isCapturing ? (
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
            ) : (
              <Camera className="w-5 h-5 mr-2" />
            )}
            {isCapturing ? 'Capturing...' : 'Capture Face'}
          </button>
        ) : (
          <>
            <button
              onClick={retake}
              disabled={isCapturing}
              className="btn btn-outline btn-lg"
            >
              Retake Photo
            </button>
            {detectionStatus === 'success' && (
              <button
                onClick={() => onFaceDetected && onFaceDetected()}
                className="btn btn-primary btn-lg"
              >
                Continue
              </button>
            )}
          </>
        )}
      </div>

      {detectionStatus === 'error' && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-sm text-red-700">
              No face detected. Please ensure your face is clearly visible and well-lit.
            </p>
          </div>
        </div>
      )}

      <div className="text-center text-xs text-gray-500">
        <p>Make sure you are in a well-lit area</p>
        <p>Keep your face centered and clearly visible</p>
        <p>Remove glasses or hats if they interfere with detection</p>
      </div>
    </div>
  )
}

export default FaceRecognition 