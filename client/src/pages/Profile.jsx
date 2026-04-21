import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { User, Mail, Trophy, Target, TrendingUp, Calendar, BookOpen, Zap } from 'lucide-react'

export default function Profile() {
  const { user } = useAuth()
  const points  = user?.progress?.points || 0
  const level   = Math.floor(points / 100) + 1
  const streak  = typeof user?.streak === 'number' ? user.streak : (user?.progress?.streakDays || 0)
  const accuracy = user?.progress?.totalQuestions
    ? Math.round((user.progress.correctAnswers / user.progress.totalQuestions) * 100)
    : 0

  const stats = [
    { label:'Level',     value:level,                          icon:Zap,        accent:'bg-cyan-500' },
    { label:'Points',    value:points,                         icon:Trophy,     accent:'bg-amber-500' },
    { label:'Streak',    value:`${streak}d`,                   icon:Calendar,   accent:'bg-violet-500' },
    { label:'Questions', value:user?.progress?.totalQuestions||0, icon:BookOpen, accent:'bg-blue-500' },
    { label:'Accuracy',  value:`${accuracy}%`,                 icon:Target,     accent:'bg-emerald-500' },
    { label:'Correct',   value:user?.progress?.correctAnswers||0, icon:TrendingUp, accent:'bg-pink-500' },
  ]

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h1 className="section-heading">Profile</h1>
        <p className="section-sub mt-1">Your account and learning stats</p>
      </div>

      {/* Identity card */}
      <div className="card p-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 rounded-2xl bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center flex-shrink-0">
            <User className="w-8 h-8 text-cyan-600 dark:text-cyan-400" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              {user?.firstName} {user?.lastName}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-500 dark:text-gray-500">
              <Mail className="w-3.5 h-3.5" />
              {user?.email}
            </div>
            <div className="flex gap-2 mt-3">
              <span className="cyber-badge">Level {level}</span>
              <span className="cyber-badge">{points} pts</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats grid */}
      <div>
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-4">Learning Stats</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {stats.map(({ label, value, icon: Icon, accent }) => (
            <div key={label} className="card p-5 flex items-center gap-3">
              <div className={`w-9 h-9 rounded-xl ${accent} flex items-center justify-center flex-shrink-0`}>
                <Icon className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-500">{label}</p>
                <p className="text-lg font-bold text-gray-900 dark:text-white">{value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* XP progress */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Level Progress</h2>
          <span className="cyber-label">Level {level} → {level + 1}</span>
        </div>
        <div className="progress-bar mb-2">
          <div className="progress-fill" style={{ width: `${points % 100}%` }} />
        </div>
        <p className="text-xs text-gray-500 dark:text-gray-500">
          {points % 100} / 100 XP to next level
        </p>
      </div>

      {/* Preferences */}
      {user?.preferences && (
        <div className="card p-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Preferences</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            {[
              { label:'Daily Goal',       value:`${user.preferences.dailyGoal || 10} questions` },
              { label:'Learning Pace',    value:user.preferences.learningPace || 'Moderate' },
              { label:'Difficulty',       value:user.preferences.difficultyLevel || 'Beginner' },
            ].map(({ label, value }) => (
              <div key={label}>
                <p className="cyber-label mb-1">{label}</p>
                <p className="text-gray-800 dark:text-gray-200 capitalize">{value}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
