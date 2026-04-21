import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from 'react-query'
import { subjectAPI, practicalAPI } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Trophy, TrendingUp, Target, Calendar,
  BarChart3, Play, Award, Mail, MapPin, Zap
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const StatCard = ({ title, value, icon: Icon, accent, subtitle }) => (
  <div className="stat-card group hover:-translate-y-0.5 transition-transform duration-200">
    <div className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${accent} flex-shrink-0`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <div>
        <p className="text-xs text-gray-500 dark:text-gray-500 font-medium">{title}</p>
        <p className="text-2xl font-bold text-gray-900 dark:text-white leading-tight">{value}</p>
        {subtitle && <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  </div>
)

const QuickCard = ({ title, description, icon: Icon, accent, onClick }) => (
  <button
    onClick={onClick}
    className="card p-6 text-left w-full group hover:-translate-y-1 transition-all duration-200"
  >
    <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
      <Icon className="w-5 h-5 text-white" />
    </div>
    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{title}</h3>
    <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">{description}</p>
  </button>
)

export default function Dashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()

  const { data: recommendedSubjects, isLoading: subjectsLoading } = useQuery(
    'recommendedSubjects',
    () => subjectAPI.getRecommendedSubjects(6),
    { staleTime: 5 * 60 * 1000 }
  )
  const { data: practicalHistory } = useQuery(
    'practicalHistory',
    () => practicalAPI.getHistory(),
    { staleTime: 2 * 60 * 1000, enabled: !!user }
  )

  const practicalCount = Array.isArray(practicalHistory?.data) ? practicalHistory.data.length : 0
  const quizTotal      = user?.progress?.totalQuestions || 0
  const quizCorrect    = user?.progress?.correctAnswers || 0
  const totalAttempts  = quizTotal + practicalCount
  const practicalCorrect = Array.isArray(practicalHistory?.data)
    ? practicalHistory.data.filter(p => (p?.performanceScore || 0) >= 3).length : 0
  const accuracy = totalAttempts === 0 ? 0 : Math.round(((quizCorrect + practicalCorrect) / totalAttempts) * 100)

  const stats = {
    totalQuestions: quizTotal + practicalCount,
    accuracy,
    points: user?.progress?.points || 0,
    streakDays: typeof user?.streak === 'number' ? user.streak : (user?.progress?.streakDays || 0),
    level: typeof user?.level === 'number' ? user.level : (Math.floor((user?.progress?.points || 0) / 100) + 1),
  }

  const questionsToday = user?.progress?.questionsToday || 0
  const dailyGoal      = user?.preferences?.dailyGoal || 10
  const dailyPct       = Math.min(Math.round((questionsToday / dailyGoal) * 100), 100)

  // Recent activity
  const quizHistory = Array.isArray(user?.quizHistory) ? user.quizHistory : []
  const practicals  = Array.isArray(practicalHistory?.data) ? practicalHistory.data : []
  const recentActivities = [
    ...quizHistory.map(q => ({
      type: 'quiz', subject: q.module || 'Unknown',
      result: q.isCorrect ? 'Correct' : 'Incorrect',
      timestamp: new Date(q.timestamp || Date.now()),
      dot: q.isCorrect ? 'bg-emerald-400' : 'bg-red-400',
    })),
    ...practicals.map(p => ({
      type: 'practical', subject: p.subject || 'Unknown',
      result: `Score: ${p.performanceScore || 0}/5`,
      timestamp: new Date(p.timestamp || Date.now()),
      dot: (p.performanceScore || 0) >= 3 ? 'bg-cyan-400' : 'bg-orange-400',
    })),
  ].sort((a, b) => b.timestamp - a.timestamp).slice(0, 6)

  return (
    <div className="space-y-8">
      {/* Welcome banner */}
      <div className="relative overflow-hidden rounded-2xl p-6 md:p-8
                      bg-gradient-to-br from-cyan-500 to-blue-600
                      dark:from-cyan-900 dark:to-blue-950
                      dark:border dark:border-cyan-900
                      shadow-lg">
        {/* subtle grid */}
        <div className="absolute inset-0 grid-overlay opacity-30 dark:opacity-100" />
        <div className="relative z-10">
          <div className="cyber-badge bg-white/20 border-white/30 text-white dark:bg-cyan-950 dark:border-cyan-800 dark:text-cyan-400 mb-4 w-fit">
            <Zap className="w-3 h-3" />
            System Online
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-white dark:text-white mb-1">
            Welcome back, {user?.firstName}
          </h1>
          <p className="text-cyan-100 dark:text-gray-400 text-sm mb-5">
            Ready to continue your learning journey?
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: Trophy,   label: `Level ${stats.level}` },
              { icon: Award,    label: `${stats.points} pts` },
              { icon: Calendar, label: `${stats.streakDays}d streak` },
            ].map(({ icon: Icon, label }) => (
              <div key={label} className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg
                                          bg-white/15 dark:bg-white/5 backdrop-blur-sm
                                          border border-white/20 dark:border-white/10
                                          text-white dark:text-gray-300 text-xs font-medium">
                <Icon className="w-3.5 h-3.5 text-yellow-300 dark:text-cyan-400" />
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="dashboard-grid">
        <StatCard title="Total Questions" value={stats.totalQuestions} icon={BookOpen}  accent="bg-blue-500"   subtitle="Attempted" />
        <StatCard title="Accuracy"        value={`${stats.accuracy}%`} icon={Target}    accent="bg-emerald-500" subtitle="Correct rate" />
        <StatCard title="Points"          value={stats.points}         icon={Trophy}    accent="bg-amber-500"  subtitle="Earned" />
        <StatCard title="Streak"          value={`${stats.streakDays}d`} icon={TrendingUp} accent="bg-violet-500" subtitle="Consecutive" />
      </div>

      {/* Quick actions */}
      <div>
        <h2 className="section-heading">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-4">
          <QuickCard title="Start Practice"   description="AI-generated questions across all subjects" icon={Play}     accent="bg-emerald-500" onClick={() => navigate('/questions')} />
          <QuickCard title="View Progress"    description="Detailed analytics and performance charts"  icon={BarChart3} accent="bg-blue-500"    onClick={() => navigate('/profile')} />
          <QuickCard title="Browse Subjects"  description="Explore subjects and syllabi"               icon={BookOpen}  accent="bg-violet-500"  onClick={() => navigate('/subjects')} />
        </div>
      </div>

      {/* Recommended subjects */}
      {(subjectsLoading || recommendedSubjects?.data?.subjects?.length > 0) && (
        <div>
          <h2 className="section-heading">Recommended for You</h2>
          {subjectsLoading ? (
            <div className="flex justify-center py-10"><LoadingSpinner size="lg" /></div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
              {recommendedSubjects.data.subjects.map((subject) => (
                <div key={subject._id} className="card p-5 group hover:-translate-y-0.5 transition-all duration-200">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                         style={{ backgroundColor: (subject.color || '#06b6d4') + '20' }}>
                      {subject.icon}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
                      <p className="text-xs text-gray-500 dark:text-gray-500">{subject.category}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-500 mb-4 leading-relaxed">{subject.description}</p>
                  <Link to={`/questions?subject=${subject._id}`}
                        className="btn btn-outline btn-sm w-full justify-center gap-1.5">
                    <Play className="w-3 h-3" /> Start
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Activity + Daily goal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent activity */}
        <div>
          <h2 className="section-heading">Recent Activity</h2>
          <div className="card p-5 mt-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="w-10 h-10 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-500">No activity yet. Start learning!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((a, i) => (
                  <div key={i} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-2 rounded-full flex-shrink-0 ${a.dot}`} />
                      <div>
                        <p className="text-xs font-medium text-gray-800 dark:text-gray-200 capitalize">
                          {a.type} · {a.subject.replace(/([A-Z])/g, ' $1').trim()}
                        </p>
                        <p className="text-xs text-gray-400 dark:text-gray-600">{a.result}</p>
                      </div>
                    </div>
                    <span className="text-xs text-gray-400 dark:text-gray-600 flex-shrink-0">
                      {a.timestamp.toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Daily goal */}
        <div>
          <h2 className="section-heading">Daily Goal</h2>
          <div className="card p-5 mt-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {questionsToday} / {dailyGoal} questions
              </span>
              <span className="cyber-label">{dailyPct}%</span>
            </div>
            <div className="progress-bar mb-3">
              <div className="progress-fill" style={{ width: `${dailyPct}%` }} />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500">
              {questionsToday >= dailyGoal
                ? '🎉 Daily goal reached! +20 bonus points awarded.'
                : `${dailyGoal - questionsToday} more to hit your goal today.`}
            </p>

            {/* Mini stats */}
            <div className="grid grid-cols-3 gap-3 mt-5 pt-4 border-t border-gray-100 dark:border-gray-700/50">
              {[
                { label: 'This Week', value: questionsToday * 3 },
                { label: 'Best Streak', value: `${stats.streakDays}d` },
                { label: 'Accuracy', value: `${stats.accuracy}%` },
              ].map(({ label, value }) => (
                <div key={label} className="text-center">
                  <p className="text-base font-bold text-gray-900 dark:text-white">{value}</p>
                  <p className="text-xs text-gray-400 dark:text-gray-600 mt-0.5">{label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 dark:border-gray-700/50 pt-8 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-cyan-400 flex items-center justify-center">
                <Zap className="w-3 h-3 text-gray-900" />
              </div>
              <span className="text-sm font-semibold text-gray-900 dark:text-white">EduBot Mission</span>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-500 leading-relaxed">
              Making quality CS education accessible through AI-powered tools and personalized feedback.
            </p>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Contact</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <Mail className="w-3.5 h-3.5" /> support@edubot.com
              </div>
              <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-gray-500">
                <MapPin className="w-3.5 h-3.5" /> Pillai College of Engineering
              </div>
            </div>
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900 dark:text-white mb-3">Quick Links</p>
            <div className="space-y-1.5">
              {[['Browse Subjects', '/subjects'], ['Practice Questions', '/questions'], ['Your Profile', '/profile']].map(([label, href]) => (
                <Link key={href} to={href} className="block text-xs text-gray-500 dark:text-gray-500 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors">
                  {label}
                </Link>
              ))}
            </div>
          </div>
        </div>
        <div className="border-t border-gray-100 dark:border-gray-700/30 pt-4 text-center">
          <p className="text-xs text-gray-400 dark:text-gray-600 font-mono">
            © {new Date().getFullYear()} EDUBOT LEARNING PLATFORM · ALL RIGHTS RESERVED
          </p>
        </div>
      </footer>
    </div>
  )
}
