import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Camera, CheckCircle, Settings, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import FaceRecognition from '../components/FaceRecognition'
import { userAPI } from '../services/api'

const Register = () => {
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [faceDescriptor, setFaceDescriptor] = useState(null)
  const [showFacePanel, setShowFacePanel] = useState(false)

  const { register, handleSubmit, watch, formState: { errors } } = useForm()
  const password = watch('password')

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const userData = {
        ...data,
        preferences: {
          subjects: [],
          learningPace: 'moderate',
          difficultyLevel: 'beginner',
          preferredQuestionTypes: ['MCQ'],
          dailyGoal: 10,
        },
      }
      const result = await registerUser(userData)
      if (result.success) {
        if (faceDescriptor) {
          try {
            await userAPI.registerFace(faceDescriptor)
          } catch {
            toast.error('Face registration failed, but account was created.')
          }
        }
        toast.success('Account initialized!')
        navigate('/splash')
      } else {
        toast.error(result.error || 'Registration failed')
      }
    } catch {
      toast.error('An error occurred during registration')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col" style={{
      backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,180,180,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,100,200,0.06) 0%, transparent 60%)',
    }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-cyan-400 font-bold text-lg tracking-wide">EduBot</span>
        <div className="flex items-center gap-4 text-gray-500">
          <HelpCircle className="w-5 h-5 hover:text-gray-300 cursor-pointer transition-colors" />
          <Settings className="w-5 h-5 hover:text-gray-300 cursor-pointer transition-colors" />
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          {/* Card */}
          <div className="rounded-xl border border-gray-700/50 bg-[#111827]/80 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden">
            {/* Card header */}
            <div className="px-8 pt-8 pb-6 text-center border-b border-gray-700/40">
              <h1 className="text-2xl font-bold text-white mb-1">Initialize Protocol</h1>
              <p className="text-gray-400 text-sm">Create your neural-linked account to begin</p>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5">
              {/* Full Name row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-2">
                    First Name
                  </label>
                  <input
                    type="text"
                    placeholder="First name"
                    className="w-full bg-[#0d1117] border border-gray-700/60 rounded-md px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    {...register('firstName', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
                  />
                  {errors.firstName && <p className="mt-1 text-xs text-red-400">{errors.firstName.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-2">
                    Last Name
                  </label>
                  <input
                    type="text"
                    placeholder="Last name"
                    className="w-full bg-[#0d1117] border border-gray-700/60 rounded-md px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                    {...register('lastName', { required: 'Required', minLength: { value: 2, message: 'Min 2 chars' } })}
                  />
                  {errors.lastName && <p className="mt-1 text-xs text-red-400">{errors.lastName.message}</p>}
                </div>
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-2">
                  Email Address
                </label>
                <input
                  type="email"
                  placeholder="user@academic.edu"
                  className="w-full bg-[#0d1117] border border-gray-700/60 rounded-md px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                  {...register('email', {
                    required: 'Email is required',
                    pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' },
                  })}
                />
                {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
              </div>

              {/* Password + Confirm row */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-[#0d1117] border border-gray-700/60 rounded-md px-4 py-3 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                      {...register('password', {
                        required: 'Required',
                        minLength: { value: 6, message: 'Min 6 chars' },
                      })}
                    />
                    <button type="button" onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-2">
                    Confirm
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      className="w-full bg-[#0d1117] border border-gray-700/60 rounded-md px-4 py-3 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                      {...register('confirmPassword', {
                        required: 'Required',
                        validate: (v) => v === password || 'Passwords do not match',
                      })}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1 text-xs text-red-400">{errors.confirmPassword.message}</p>}
                </div>
              </div>

              {/* Face Registration row */}
              <div className="flex items-center justify-between py-1">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full border border-cyan-500/40 bg-cyan-500/10 flex items-center justify-center">
                    {faceDescriptor
                      ? <CheckCircle className="w-4 h-4 text-cyan-400" />
                      : <Camera className="w-4 h-4 text-cyan-400" />}
                  </div>
                  <div>
                    <p className="text-xs font-mono font-semibold text-white uppercase tracking-wider">Register Face</p>
                    <p className="text-xs text-gray-500">Enhanced Security Protocol</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowFacePanel(!showFacePanel)}
                  className="px-4 py-1.5 text-xs font-mono font-semibold uppercase tracking-widest border border-cyan-500/40 text-cyan-400 rounded-sm hover:bg-cyan-500/10 transition-all"
                >
                  {faceDescriptor ? 'Done' : 'Initialize'}
                </button>
              </div>

              {/* Face panel */}
              {showFacePanel && !faceDescriptor && (
                <div className="rounded-lg border border-gray-700/50 bg-[#0d1117] p-4">
                  <FaceRecognition
                    onFaceDetected={(d) => { setFaceDescriptor(d); setShowFacePanel(false); toast.success('Face registered!') }}
                    onError={(e) => toast.error(e)}
                    mode="register"
                    isLoading={isLoading}
                  />
                </div>
              )}

              {/* Terms */}
              <div className="flex items-start gap-3">
                <input
                  id="terms"
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500/30"
                  {...register('terms', { required: 'You must accept the terms' })}
                />
                <label htmlFor="terms" className="text-xs text-gray-500">
                  I agree to the{' '}
                  <Link to="/terms" className="text-cyan-400 hover:text-cyan-300 transition-colors">Terms and Conditions</Link>
                </label>
              </div>
              {errors.terms && <p className="text-xs text-red-400">{errors.terms.message}</p>}

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3.5 font-mono font-bold text-sm uppercase tracking-widest text-gray-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all duration-300 shadow-lg shadow-cyan-500/20 mt-2"
              >
                {isLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                    Initializing...
                  </span>
                ) : 'Create Account'}
              </button>

              <p className="text-center text-xs text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                  Access System
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Register
