import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Camera, Mail, Settings, HelpCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import FaceRecognition from '../components/FaceRecognition'

const Login = () => {
  const { login, faceLogin } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [isFaceLogin, setIsFaceLogin] = useState(false)

  const { register, handleSubmit, formState: { errors } } = useForm()

  const onSubmit = async (data) => {
    setIsLoading(true)
    try {
      const result = await login(data.email, data.password)
      if (result.success) {
        toast.success('Access granted!')
        navigate('/splash')
      } else {
        toast.error(result.error || 'Login failed')
      }
    } catch {
      toast.error('An error occurred during login')
    } finally {
      setIsLoading(false)
    }
  }

  const handleFaceLogin = async (faceDescriptor) => {
    setIsLoading(true)
    try {
      const result = await faceLogin(faceDescriptor)
      if (result.success) {
        toast.success('Identity verified!')
        navigate('/splash')
      } else {
        toast.error(result.error || 'Face login failed')
      }
    } catch {
      toast.error('An error occurred during face login')
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
              <h1 className="text-2xl font-bold text-white mb-1">Access Protocol</h1>
              <p className="text-gray-400 text-sm">Authenticate to resume your session</p>
            </div>

            {/* Mode toggle */}
            <div className="px-8 pt-6">
              <div className="flex rounded-md border border-gray-700/60 bg-[#0d1117] p-1 gap-1">
                <button
                  type="button"
                  onClick={() => setIsFaceLogin(false)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold uppercase tracking-widest rounded transition-all duration-200 ${
                    !isFaceLogin
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Mail className="w-3.5 h-3.5" />
                  Email
                </button>
                <button
                  type="button"
                  onClick={() => setIsFaceLogin(true)}
                  className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold uppercase tracking-widest rounded transition-all duration-200 ${
                    isFaceLogin
                      ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                      : 'text-gray-500 hover:text-gray-300'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  Face ID
                </button>
              </div>
            </div>

            {/* Email form */}
            {!isFaceLogin && (
              <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-6 space-y-5">
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

                {/* Password */}
                <div>
                  <label className="block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-2">
                    Password
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••••••"
                      className="w-full bg-[#0d1117] border border-gray-700/60 rounded-md px-4 py-3 pr-10 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
                      {...register('password', {
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Min 6 characters' },
                      })}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                </div>

                {/* Submit */}
                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full py-3.5 font-mono font-bold text-sm uppercase tracking-widest text-gray-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all duration-300 shadow-lg shadow-cyan-500/20 mt-2"
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                      Authenticating...
                    </span>
                  ) : 'Initialize Session'}
                </button>

                <p className="text-center text-xs text-gray-600">
                  No account?{' '}
                  <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                    Register Protocol
                  </Link>
                </p>
              </form>
            )}

            {/* Face login */}
            {isFaceLogin && (
              <div className="px-8 py-6">
                <div className="rounded-lg border border-gray-700/50 bg-[#0d1117] p-4 mb-5">
                  <FaceRecognition
                    onFaceDetected={handleFaceLogin}
                    onError={(e) => toast.error(e)}
                    mode="login"
                    isLoading={isLoading}
                  />
                </div>
                <p className="text-center text-xs text-gray-600">
                  No account?{' '}
                  <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">
                    Register Protocol
                  </Link>
                </p>
              </div>
            )}
          </div>

          {/* Bottom hint */}
          <p className="text-center text-xs text-gray-700 mt-6 font-mono">
            EDUBOT · NEURAL LEARNING SYSTEM v2.0
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
