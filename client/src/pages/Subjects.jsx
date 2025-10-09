import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { 
  BookOpen, 
  Play, 
  Code, 
  Database, 
  Network, 
  Coffee,
  Cpu,
  ChevronRight,
  BarChart3,
  Clock,
  Award,
  FileText
} from 'lucide-react'

const Subjects = () => {
  const { user } = useAuth()

  const subjects = [
    {
      id: 1,
      name: 'Computer Network',
      icon: Network,
      description: 'Learn about network protocols, topologies, and communication systems.',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      slug: 'computer-network',
      // difficulty: 'Intermediate'
    },
    {
      id: 2,
      name: 'Database Management',
      icon: Database,
      description: 'Master database design, SQL queries, and management systems.',
      color: 'bg-green-500',
      textColor: 'text-green-500',
      borderColor: 'border-green-500',
      slug: 'dbms',
      // difficulty: 'Intermediate'
    },
    {
      id: 3,
      name: 'Python',
      icon: Code,
      description: 'Learn Python programming from basics to advanced concepts.',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      slug: 'python',
      // difficulty: 'Beginner'
    },
    {
      id: 4,
      name: 'Java',
      icon: Coffee,
      description: 'Object-oriented programming with Java language.',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      borderColor: 'border-red-500',
      slug: 'java',
      // difficulty: 'Intermediate'
    },
    {
      id: 5,
      name: 'C++',
      icon: Cpu,
      description: 'Learn C++ programming with OOP and advanced features.',
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500',
      slug: 'cpp',
      // difficulty: 'Advanced'
    },
    {
      id: 6,
      name: 'C Programming',
      icon: Cpu,
      description: 'Master the fundamentals of C programming language.',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      borderColor: 'border-indigo-500',
      slug: 'c-programming',
      // difficulty: 'Intermediate'
    }
  ]

  const SubjectCard = ({ subject }) => {
    const Icon = subject.icon
    // Map display name to moduleProgress key
    const nameToKey = {
      'Database Management': 'dbms',
      'Computer Network': 'computerNetworks',
      'Python': 'python',
      'Java': 'java',
      'C++': 'cpp',
      'C Programming': 'c'
    }
    const moduleKey = nameToKey[subject.name]
    const progressCount = moduleKey && user?.moduleProgress ? (user.moduleProgress[moduleKey] || 0) : 0
    
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700 overflow-hidden transition-all duration-300 hover:shadow-lg">
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${subject.color} text-white`}>
                <Icon className="w-6 h-6" />
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {subject.name}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {subject.description}
                </p>
              </div>
            </div>
            <span className={`px-2 py-1 text-xs font-medium rounded-full ${subject.textColor} bg-opacity-20`}>
              {subject.difficulty}
            </span>
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{progressCount} tasks</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${subject.color}`}
                style={{ width: `${Math.min(progressCount, 100)}%` }}
              ></div>
            </div>
          </div>

          <div className="mt-6 flex space-x-3">
            {/* <Link
              to={`/questions?subject=${subject.slug}`}
              className="flex-1 flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
            >
              <Play className="w-4 h-4 mr-2" />
              Practice
            </Link> */}
            <Link
              to={`/syllabus/${subject.slug}`}
              className="flex-1 flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <FileText className="w-4 h-4 mr-2" />
              View Syllabus
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Subjects</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Choose a subject to start practicing or review syllabus
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md">
                <Award className="w-4 h-4 text-yellow-500" />
                <span>6 subjects available</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">6</p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {subjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>

        {/* Call to Action */}
        <div className="mt-12 text-center">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 border border-gray-200 dark:border-gray-700">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Ready to test your knowledge?
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-2xl mx-auto">
              Practice with AI-generated questions tailored to your learning level. 
              Track your progress and improve your skills across all subjects.
            </p>
            <Link
              to="/questions"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              Start Practice Session
              <ChevronRight className="ml-2 w-5 h-5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Subjects