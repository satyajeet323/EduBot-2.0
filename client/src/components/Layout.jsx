import React, { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import {
  Home, BookOpen, HelpCircle, User, Menu, X, LogOut,
  Trophy, BarChart3, Sun, Moon, Mic, ChevronRight, Zap
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard',       href: '/dashboard',       icon: Home },
  { name: 'Subjects',        href: '/subjects',         icon: BookOpen },
  { name: 'Questions',       href: '/questions',        icon: HelpCircle },
  { name: 'English Fluency', href: '/english-fluency',  icon: Mic },
  { name: 'Profile',         href: '/profile',          icon: User },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [darkMode, setDarkMode] = useState(true)

  useEffect(() => {
    const isDark =
      localStorage.getItem('theme') === 'dark' ||
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    setDarkMode(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggleDark = () => {
    const next = !darkMode
    setDarkMode(next)
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('theme', next ? 'dark' : 'light')
  }

  const isActive = (path) => location.pathname === path
  const points = user?.progress?.points || 0
  const level  = Math.floor(points / 100) + 1

  return (
    <div className="min-h-screen bg-background flex">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── Sidebar ── */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 flex flex-col
        bg-white dark:bg-gray-950
        border-r border-gray-200 dark:border-gray-800
        shadow-xl
        transform transition-transform duration-300 ease-in-out
        lg:relative lg:translate-x-0 lg:z-auto
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        {/* Brand */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-400/30">
              <Zap className="w-4 h-4 text-gray-900" />
            </div>
            <span className="text-lg font-bold text-gray-900 dark:text-white tracking-tight">EduBot</span>
          </div>
          <button onClick={() => setSidebarOpen(false)} className="lg:hidden btn-ghost p-1 rounded">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User info */}
        <div className="px-4 py-4 border-b border-gray-200 dark:border-gray-700/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-cyan-500/10 dark:bg-cyan-500/20 border border-cyan-500/30 flex items-center justify-center">
              <User className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                {user?.firstName} {user?.lastName}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navigation.map(({ name, href, icon: Icon }) => (
            <Link
              key={name}
              to={href}
              onClick={() => setSidebarOpen(false)}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200"
              style={{
                background: isActive(href) ? 'rgba(6,182,212,0.1)' : 'transparent',
                color: isActive(href) ? '#22d3ee' : undefined,
                border: isActive(href) ? '1px solid rgba(6,182,212,0.2)' : '1px solid transparent',
              }}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              <span>{name}</span>
              {isActive(href) && <ChevronRight className="w-3 h-3 ml-auto text-cyan-500" />}
            </Link>
          ))}
        </nav>

        {/* Stats */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700/50">
          <p className="cyber-label mb-3">Your Progress</p>
          <div className="space-y-2">
            {[
              { label: 'Points', value: points },
              { label: 'Streak', value: `${user?.progress?.streakDays || 0}d` },
              { label: 'Level',  value: level },
            ].map(({ label, value }) => (
              <div key={label} className="flex justify-between items-center">
                <span className="text-xs text-gray-500 dark:text-gray-500">{label}</span>
                <span className="text-xs font-semibold text-gray-800 dark:text-gray-200">{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Logout */}
        <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-700/50">
          <button
            onClick={() => { logout(); navigate('/login') }}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium rounded-lg
                       text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800/60
                       hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600 dark:hover:text-red-400
                       border border-transparent hover:border-red-200 dark:hover:border-red-500/20
                       transition-all duration-200"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </button>
        </div>
      </aside>

      {/* ── Main ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <header className="sticky top-0 z-30 h-16 flex items-center justify-between px-4 sm:px-6
                           bg-white/90 dark:bg-gray-950/90 backdrop-blur-xl
                           border-b border-gray-200 dark:border-gray-800
                           shadow-sm">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Breadcrumb hint */}
            <div className="hidden lg:flex items-center gap-2">
              <span className="cyber-badge">
                <Trophy className="w-3 h-3" />
                {points} pts
              </span>
              <span className="cyber-badge">
                <BarChart3 className="w-3 h-3" />
                Lv {level}
              </span>
            </div>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggleDark}
            className="p-2 rounded-lg text-gray-500 dark:text-gray-400
                       hover:bg-gray-100 dark:hover:bg-gray-800
                       hover:text-gray-900 dark:hover:text-white
                       border border-transparent hover:border-gray-200 dark:hover:border-gray-700
                       transition-all duration-200"
            aria-label="Toggle theme"
          >
            {darkMode
              ? <Sun className="w-4 h-4" />
              : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-auto">
          {['/networking-playground', '/dbms-quiz', '/english-fluency'].includes(location.pathname) ? (
            <Outlet />
          ) : (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <Outlet />
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
