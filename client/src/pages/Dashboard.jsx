import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { useQuery } from 'react-query'
import { subjectAPI, practicalAPI } from '../services/api'
import { Link, useNavigate } from 'react-router-dom'
import { 
  BookOpen, 
  Trophy, 
  TrendingUp, 
  Target, 
  Calendar,
  BarChart3,
  Play,
  Award,
  Mail,
  MapPin,
  Heart
} from 'lucide-react'
import LoadingSpinner from '../components/LoadingSpinner'

const Dashboard = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const { data: recommendedSubjects, isLoading: subjectsLoading } = useQuery(
    'recommendedSubjects',
    () => subjectAPI.getRecommendedSubjects(6),
    { staleTime: 5 * 60 * 1000 }
  );

  // Fetch practical history to include in recent activity
  const { data: practicalHistory } = useQuery(
    'practicalHistory',
    () => practicalAPI.getHistory(),
    { 
      staleTime: 2 * 60 * 1000,
      enabled: !!user // Only fetch if user is logged in
    }
  );

  const stats = {
    // Calculate total questions from quiz history + practical history
    totalQuestions: (() => {
      const quizCount = user?.progress?.totalQuestions || 0;
      const practicalCount = Array.isArray(practicalHistory?.data) ? practicalHistory.data.length : 0;
      return quizCount + practicalCount;
    })(),
    correctAnswers: user?.progress?.correctAnswers || 0,
    accuracy: (() => {
      const quizCorrect = user?.progress?.correctAnswers || 0;
      const quizTotal = user?.progress?.totalQuestions || 0;
      const practicalCount = Array.isArray(practicalHistory?.data) ? practicalHistory.data.length : 0;
      const totalAttempts = quizTotal + practicalCount;
      
      if (totalAttempts === 0) return 0;
      
      // Count practical submissions with score >= 3 as "correct"
      const practicalCorrect = Array.isArray(practicalHistory?.data) 
        ? practicalHistory.data.filter(p => (p?.performanceScore || 0) >= 3).length 
        : 0;
      
      const totalCorrect = quizCorrect + practicalCorrect;
      return Math.round((totalCorrect / totalAttempts) * 100);
    })(),
    points: user?.progress?.points || 0,
    // Prefer top-level streak and level if available, fallback to legacy progress
    streakDays: typeof user?.streak === 'number' ? user.streak : (user?.progress?.streakDays || 0),
    level: typeof user?.level === 'number' ? user.level : (Math.floor((user?.progress?.points || 0) / 100) + 1)
  };

  const questionsToday = user?.progress?.questionsToday || 0;
  const dailyGoal = user?.preferences?.dailyGoal || 10;
  const dailyPct = Math.min(Math.round((questionsToday / dailyGoal) * 100), 100);

  // Function to navigate to subjects page
  const navigateToSubjects = () => {
    navigate('/subjects');
  }

  // Function to navigate to questions page for a random subject
  const navigateToPractice = () => {
      navigate('/questions');
    }
  

  const StatCard = ({ title, value, icon: Icon, color, subtitle }) => (
    <div className="stat-card">
      <div className="flex items-center">
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="ml-4">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold text-foreground">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
      </div>
    </div>
  )

  const QuickActionCard = ({ title, description, icon: Icon, color, onClick }) => (
    <button
      onClick={onClick}
      className="card text-left hover:shadow-soft-md transition-all duration-300 group"
    >
      <div className={`p-3 rounded-lg ${color} w-fit mb-4 group-hover:scale-105 transition-transform`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </button>
  )

  const SubjectCard = ({ subject }) => (
    <div className="card hover:shadow-soft-md transition-all duration-300 group">
      <div className="flex items-center mb-4">
        <div 
          className="w-12 h-12 rounded-lg flex items-center justify-center text-2xl group-hover:scale-105 transition-transform"
          style={{ backgroundColor: subject.color + '20' }}
        >
          {subject.icon}
        </div>
        <div className="ml-4">
          <h3 className="text-lg font-semibold text-foreground">{subject.name}</h3>
          <p className="text-sm text-muted-foreground">{subject.category}</p>
        </div>
      </div>
      <p className="text-sm text-muted-foreground mb-4">{subject.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">
          {subject.activeTopicsCount || 0} topics
        </span>
        <Link 
          to={`/questions?subject=${subject._id}`}
          className="btn btn-primary btn-sm group-hover:scale-105 transition-transform"
        >
          <Play className="w-4 h-4 mr-1" />
          Start Learning
        </Link>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
      <div className="flex-1 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Welcome Section */}
          <div className="bg-gradient-to-r from-primary-500 to-primary-600 rounded-xl p-6 md:p-8 text-white shadow-soft mb-8">
            <h1 className="text-2xl md:text-3xl font-bold mb-2">
              Welcome back, {user?.firstName}! 👋
            </h1>
            <p className="text-primary-100 opacity-90">
              Ready to continue your learning journey? You're doing great!
            </p>
            <div className="mt-6 flex items-center space-x-4 flex-wrap gap-2">
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Trophy className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                <span className="text-sm">Level {stats.level}</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Award className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                <span className="text-sm">{stats.points} points</span>
              </div>
              <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1">
                <Calendar className="w-4 h-4 md:w-5 md:h-5 text-yellow-300" />
                <span className="text-sm">{stats.streakDays} day streak</span>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="dashboard-grid mb-8">
            <StatCard
              title="Total Questions"
              value={stats.totalQuestions}
              icon={BookOpen}
              color="bg-blue-500"
              subtitle="Questions attempted"
            />
            <StatCard
              title="Accuracy"
              value={`${stats.accuracy}%`}
              icon={Target}
              color="bg-green-500"
              subtitle="Correct answers"
            />
            <StatCard
              title="Points Earned"
              value={stats.points}
              icon={Trophy}
              color="bg-yellow-500"
              subtitle="Total points"
            />
            <StatCard
              title="Streak Days"
              value={stats.streakDays}
              icon={TrendingUp}
              color="bg-purple-500"
              subtitle="Consecutive days"
            />
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <QuickActionCard
                title="Start Practice"
                description="Begin a new practice session with AI-generated questions"
                icon={Play}
                color="bg-green-500"
                onClick={navigateToPractice}
              />
              <QuickActionCard
                title="View Progress"
                description="Check your detailed progress and performance analytics"
                icon={BarChart3}
                color="bg-blue-500"
                onClick={() => {/* Navigate to progress */}}
              />
              <QuickActionCard
                title="Browse Subjects"
                description="Explore different subjects and topics to learn"
                icon={BookOpen}
                color="bg-purple-500"
                onClick={navigateToSubjects}
              />
            </div>
          </div>

          {/* Recommended Subjects */}
          <div className="mb-8">
            <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Recommended for You</h2>
            {subjectsLoading ? (
              <div className="flex justify-center py-8">
                <LoadingSpinner size="lg" />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recommendedSubjects?.data?.subjects?.map((subject) => (
                  <SubjectCard key={subject._id} subject={subject} />
                ))}
              </div>
            )}
          </div>

          {/* Recent Activity & Daily Goal - Side by side on larger screens */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Recent Activity */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Recent Activity</h2>
              <div className="card p-6">
                {(() => {
                  // Combine quiz history and practical history
                  const quizHistory = Array.isArray(user?.quizHistory) ? user.quizHistory : [];
                  const practicals = Array.isArray(practicalHistory?.data) ? practicalHistory.data : [];
                  
                  const recentActivities = [
                    ...quizHistory.map(quiz => ({
                      type: 'quiz',
                      subject: quiz.module || 'Unknown',
                      result: quiz.isCorrect ? 'Correct' : 'Incorrect',
                      timestamp: new Date(quiz.timestamp || Date.now()),
                      color: quiz.isCorrect ? 'bg-green-500' : 'bg-red-500'
                    })),
                    ...practicals.map(practical => ({
                      type: 'practical',
                      subject: practical.subject || 'Unknown',
                      result: `Score: ${practical.performanceScore || 0}/5`,
                      timestamp: new Date(practical.timestamp || Date.now()),
                      color: (practical.performanceScore || 0) >= 3 ? 'bg-emerald-500' : 'bg-orange-500'
                    }))
                  ]
                    .sort((a, b) => b.timestamp - a.timestamp)
                    .slice(0, 6); // Show last 6 activities

                  if (recentActivities.length === 0) {
                    return (
                      <div className="text-center py-8">
                        <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                        <p className="text-muted-foreground">No activity yet. Start learning to see your progress!</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-3">
                      {recentActivities.map((activity, index) => (
                        <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-b-0">
                          <div className="flex items-center space-x-3">
                            <div className={`w-2 h-2 rounded-full ${activity.color}`}></div>
                            <div>
                              <span className="text-sm font-medium text-foreground capitalize">
                                {activity.type} - {activity.subject.replace(/([A-Z])/g, ' $1').trim()}
                              </span>
                              <p className="text-xs text-muted-foreground">{activity.result}</p>
                            </div>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {activity.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>

            {/* Daily Goal Progress */}
            <div>
              <h2 className="text-xl md:text-2xl font-bold text-foreground mb-6">Daily Goal</h2>
              <div className="card p-6">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-sm font-medium text-foreground">
                    Questions Today: {questionsToday}/{dailyGoal}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    {dailyPct}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-secondary-700 rounded-full h-2">
                  <div 
                    className="bg-primary-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${dailyPct}%` }}
                  ></div>
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {questionsToday >= dailyGoal ? 'Daily goal reached! +20 bonus points awarded.' : 'Keep going! You are close to your daily goal.'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Paper Texture Footer - Enhanced with Glass Morphism */}
<footer className="bg-background/80 backdrop-blur-lg border-t border-border/50 mt-auto supports-backdrop-blur:bg-background/60">
  <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      {/* EduBot Mission */}
      <div className="text-center md:text-left">
        <h3 className="text-lg font-semibold text-foreground mb-4">EduBot Mission</h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          Making quality education accessible to everyone through AI-powered learning experiences. 
          We believe in empowering students with interactive tools and personalized feedback.
        </p>
      </div>

      {/* Contact Information */}
      <div className="text-center">
        <h3 className="text-lg font-semibold text-foreground mb-4">Contact Us</h3>
        <div className="space-y-3">   
          <div className="flex items-center justify-center md:justify-start">
            <Mail className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">support@edubot.com</span>
          </div>
          <div className="flex items-center justify-center md:justify-start">
            <MapPin className="w-4 h-4 text-muted-foreground mr-2" />
            <span className="text-sm text-muted-foreground">Pillai College of Engineering</span>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="text-center md:text-right">
        <h3 className="text-lg font-semibold text-foreground mb-4">Quick Links</h3>
        <div className="space-y-2">
          <Link to="/subjects" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
            Browse Subjects
          </Link>
          <Link to="/questions" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
            Practice Questions
          </Link>
          <Link to="/profile" className="block text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
            Your Profile
          </Link>
        </div>
      </div>
    </div>

    {/* Copyright */}
    <div className="border-t border-border/30 mt-8 pt-6 text-center">
      {/* <div className="flex items-center justify-center mb-2">
        <span className="text-sm text-muted-foreground mr-1">Made with</span>
        <Heart className="w-4 h-4 text-destructive fill-current animate-pulse" />
        <span className="text-sm text-muted-foreground ml-1">for learners worldwide</span>
      </div> */}
      <p className="text-sm text-muted-foreground">
        © {new Date().getFullYear()} EduBot Learning Platform. All rights reserved.
      </p>
    </div>
  </div>
</footer>
    </div>
  )
}

export default Dashboard