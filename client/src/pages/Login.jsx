import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useAuth } from '../hooks/useAuth'
import { Eye, EyeOff, Camera, Mail, Settings, HelpCircle, ArrowLeft, KeyRound } from 'lucide-react'
import toast from 'react-hot-toast'
import FaceRecognition from '../components/FaceRecognition'
import { authAPI } from '../services/api'

const inputCls = "w-full bg-[#0d1117] border border-gray-700/60 rounded-md px-4 py-3 text-white text-sm placeholder-gray-600 focus:outline-none focus:border-cyan-500/60 focus:ring-1 focus:ring-cyan-500/30 transition-all"
const labelCls = "block text-xs font-mono font-semibold text-cyan-400 uppercase tracking-widest mb-2"

export default function Login() {
  const { login, faceLogin } = useAuth()
  const navigate = useNavigate()
  const [showPassword, setShowPassword]   = useState(false)
  const [isLoading, setIsLoading]         = useState(false)
  const [isFaceLogin, setIsFaceLogin]     = useState(false)
  const [view, setView]                   = useState('login') // 'login' | 'forgot' | 'reset' | 'done'
  const [resetToken, setResetToken]       = useState('')
  const [showNewPw, setShowNewPw]         = useState(false)

  const { register, handleSubmit, reset, formState: { errors } } = useForm()

  /* ── Login ── */
  const onLogin = async (data) => {
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
    } finally { setIsLoading(false) }
  }

  const handleFaceLogin = async (faceDescriptor) => {
    setIsLoading(true)
    try {
      const result = await faceLogin(faceDescriptor)
      if (result.success) { toast.success('Identity verified!'); navigate('/splash') }
      else toast.error(result.error || 'Face login failed')
    } catch { toast.error('An error occurred during face login') }
    finally { setIsLoading(false) }
  }

  /* ── Forgot password ── */
  const onForgot = async (data) => {
    setIsLoading(true)
    try {
      const res = await authAPI.forgotPassword(data.forgotEmail)
      if (res.data.resetToken) {
        setResetToken(res.data.resetToken)
        setView('reset')
        toast.success('Reset token generated — enter it below')
      } else {
        setView('done')
        toast.success('If that email exists, a reset link has been sent.')
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to send reset request')
    } finally { setIsLoading(false) }
  }

  /* ── Reset password ── */
  const onReset = async (data) => {
    setIsLoading(true)
    try {
      const token = data.resetToken || resetToken
      await authAPI.resetPassword(token, data.newPassword)
      toast.success('Password reset! You can now log in.')
      reset()
      setView('login')
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reset failed — token may have expired')
    } finally { setIsLoading(false) }
  }

  const bg = {
    backgroundImage: 'radial-gradient(ellipse at 20% 50%, rgba(0,180,180,0.06) 0%, transparent 60%), radial-gradient(ellipse at 80% 20%, rgba(0,100,200,0.06) 0%, transparent 60%)',
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] flex flex-col" style={bg}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-4">
        <span className="text-cyan-400 font-bold text-lg tracking-wide">EduBot</span>
        <div className="flex items-center gap-4 text-gray-500">
          <HelpCircle className="w-5 h-5 hover:text-gray-300 cursor-pointer transition-colors" />
          <Settings className="w-5 h-5 hover:text-gray-300 cursor-pointer transition-colors" />
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-gray-700/50 bg-[#111827]/80 backdrop-blur-sm shadow-2xl shadow-black/50 overflow-hidden">

            {/* ══ LOGIN VIEW ══ */}
            {view === 'login' && (
              <>
                <div className="px-8 pt-8 pb-6 text-center border-b border-gray-700/40">
                  <h1 className="text-2xl font-bold text-white mb-1">Access Protocol</h1>
                  <p className="text-gray-400 text-sm">Authenticate to resume your session</p>
                </div>

                {/* Mode toggle */}
                <div className="px-8 pt-6">
                  <div className="flex rounded-md border border-gray-700/60 bg-[#0d1117] p-1 gap-1">
                    <button type="button" onClick={() => setIsFaceLogin(false)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold uppercase tracking-widest rounded transition-all duration-200 ${!isFaceLogin ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                      <Mail className="w-3.5 h-3.5" /> Email
                    </button>
                    <button type="button" onClick={() => setIsFaceLogin(true)}
                      className={`flex-1 flex items-center justify-center gap-2 py-2 text-xs font-mono font-semibold uppercase tracking-widest rounded transition-all duration-200 ${isFaceLogin ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30' : 'text-gray-500 hover:text-gray-300'}`}>
                      <Camera className="w-3.5 h-3.5" /> Face ID
                    </button>
                  </div>
                </div>

                {!isFaceLogin && (
                  <form onSubmit={handleSubmit(onLogin)} className="px-8 py-6 space-y-5">
                    <div>
                      <label className={labelCls}>Email Address</label>
                      <input type="email" placeholder="user@academic.edu" className={inputCls}
                        {...register('email', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })} />
                      {errors.email && <p className="mt-1 text-xs text-red-400">{errors.email.message}</p>}
                    </div>

                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className={labelCls} style={{ marginBottom: 0 }}>Password</label>
                        <button type="button" onClick={() => { setView('forgot'); reset() }}
                          className="text-[10px] font-mono text-cyan-500/70 hover:text-cyan-400 transition-colors uppercase tracking-widest">
                          Forgot?
                        </button>
                      </div>
                      <div className="relative">
                        <input type={showPassword ? 'text' : 'password'} placeholder="••••••••••••" className={inputCls + ' pr-10'}
                          {...register('password', { required: 'Password is required', minLength: { value: 6, message: 'Min 6 characters' } })} />
                        <button type="button" onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
                    </div>

                    <button type="submit" disabled={isLoading}
                      className="w-full py-3.5 font-mono font-bold text-sm uppercase tracking-widest text-gray-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all duration-300 shadow-lg shadow-cyan-500/20 mt-2">
                      {isLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                          Authenticating...
                        </span>
                      ) : 'Initialize Session'}
                    </button>

                    <p className="text-center text-xs text-gray-600">
                      No account?{' '}
                      <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Register Protocol</Link>
                    </p>
                  </form>
                )}

                {isFaceLogin && (
                  <div className="px-8 py-6">
                    <div className="rounded-lg border border-gray-700/50 bg-[#0d1117] p-4 mb-5">
                      <FaceRecognition onFaceDetected={handleFaceLogin} onError={(e) => toast.error(e)} mode="login" isLoading={isLoading} />
                    </div>
                    <p className="text-center text-xs text-gray-600">
                      No account?{' '}
                      <Link to="/register" className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Register Protocol</Link>
                    </p>
                  </div>
                )}
              </>
            )}

            {/* ══ FORGOT PASSWORD VIEW ══ */}
            {view === 'forgot' && (
              <>
                <div className="px-8 pt-8 pb-6 border-b border-gray-700/40">
                  <button onClick={() => setView('login')} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4 font-mono uppercase tracking-widest">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                      <KeyRound className="w-4 h-4 text-cyan-400" />
                    </div>
                    <div>
                      <h1 className="text-xl font-bold text-white">Reset Password</h1>
                      <p className="text-gray-400 text-xs">Enter your email to receive a reset token</p>
                    </div>
                  </div>
                </div>

                <form onSubmit={handleSubmit(onForgot)} className="px-8 py-6 space-y-5">
                  <div>
                    <label className={labelCls}>Email Address</label>
                    <input type="email" placeholder="user@academic.edu" className={inputCls}
                      {...register('forgotEmail', { required: 'Email is required', pattern: { value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i, message: 'Invalid email' } })} />
                    {errors.forgotEmail && <p className="mt-1 text-xs text-red-400">{errors.forgotEmail.message}</p>}
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 font-mono font-bold text-sm uppercase tracking-widest text-gray-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all duration-300 shadow-lg shadow-cyan-500/20">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                        Sending...
                      </span>
                    ) : 'Send Reset Token'}
                  </button>

                  <p className="text-center text-xs text-gray-600">
                    Have a token?{' '}
                    <button type="button" onClick={() => setView('reset')} className="text-cyan-400 hover:text-cyan-300 transition-colors font-medium">Enter it here</button>
                  </p>
                </form>
              </>
            )}

            {/* ══ RESET PASSWORD VIEW ══ */}
            {view === 'reset' && (
              <>
                <div className="px-8 pt-8 pb-6 border-b border-gray-700/40">
                  <button onClick={() => setView('forgot')} className="flex items-center gap-2 text-xs text-gray-500 hover:text-gray-300 transition-colors mb-4 font-mono uppercase tracking-widest">
                    <ArrowLeft className="w-3.5 h-3.5" /> Back
                  </button>
                  <h1 className="text-xl font-bold text-white mb-1">New Password</h1>
                  <p className="text-gray-400 text-xs">Enter your reset token and choose a new password</p>
                </div>

                <form onSubmit={handleSubmit(onReset)} className="px-8 py-6 space-y-5">
                  <div>
                    <label className={labelCls}>Reset Token</label>
                    <input type="text" placeholder="Paste your reset token" className={inputCls}
                      defaultValue={resetToken}
                      {...register('resetToken', { required: 'Token is required' })} />
                    {errors.resetToken && <p className="mt-1 text-xs text-red-400">{errors.resetToken.message}</p>}
                  </div>

                  <div>
                    <label className={labelCls}>New Password</label>
                    <div className="relative">
                      <input type={showNewPw ? 'text' : 'password'} placeholder="••••••••" className={inputCls + ' pr-10'}
                        {...register('newPassword', {
                          required: 'Password is required',
                          minLength: { value: 6, message: 'Min 6 characters' },
                          pattern: { value: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Must have uppercase, lowercase & number' },
                        })} />
                      <button type="button" onClick={() => setShowNewPw(!showNewPw)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-600 hover:text-gray-400 transition-colors">
                        {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.newPassword && <p className="mt-1 text-xs text-red-400">{errors.newPassword.message}</p>}
                    {!errors.newPassword && <p className="mt-1 text-[10px] text-gray-600">Min 6 chars · uppercase · lowercase · number</p>}
                  </div>

                  <button type="submit" disabled={isLoading}
                    className="w-full py-3.5 font-mono font-bold text-sm uppercase tracking-widest text-gray-900 bg-cyan-400 hover:bg-cyan-300 disabled:opacity-50 disabled:cursor-not-allowed rounded-md transition-all duration-300 shadow-lg shadow-cyan-500/20">
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-gray-900/30 border-t-gray-900 rounded-full animate-spin" />
                        Resetting...
                      </span>
                    ) : 'Reset Password'}
                  </button>
                </form>
              </>
            )}

            {/* ══ DONE VIEW ══ */}
            {view === 'done' && (
              <div className="px-8 py-12 text-center">
                <div className="w-14 h-14 rounded-full bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto mb-5">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <h2 className="text-lg font-bold text-white mb-2">Check your email</h2>
                <p className="text-gray-400 text-sm mb-6">If that email is registered, a reset link has been sent. Check your inbox.</p>
                <button onClick={() => setView('login')} className="text-xs font-mono text-cyan-400 hover:text-cyan-300 transition-colors uppercase tracking-widest">
                  ← Back to Login
                </button>
              </div>
            )}

          </div>

          <p className="text-center text-xs text-gray-700 mt-6 font-mono">
            EDUBOT · NEURAL LEARNING SYSTEM v2.0
          </p>
        </div>
      </div>
    </div>
  )
}
