import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom' // Add useNavigate import
// ... other imports ...
import { 
  BookOpen, 
  Play, 
  Code, 
  Database, 
  Network, 
  Coffee,
  Cpu,
  BarChart3,
  Search,
  Filter,
  HelpCircle,
  Monitor,
  CpuIcon,
  Zap,
  Factory,
  Building
} from 'lucide-react'

const Questions = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedDepartment, setSelectedDepartment] = useState('all')

  const departments = [
    { id: 'all', name: 'All Departments', icon: Monitor },
    { id: 'computer', name: 'Computer Science', icon: CpuIcon },
    { id: 'it', name: 'Information Technology', icon: Monitor },
    { id: 'extc', name: 'Electronics & Telecommunication', icon: Zap },
    { id: 'electrical', name: 'Electrical Engineering', icon: Zap },
    { id: 'civil', name: 'Civil Engineering', icon: Building },
    { id: 'chemical', name: 'Chemical Engineering', icon: Factory }
  ]

  const subjects = [
    {
      id: 1,
      name: 'Computer Network',
      icon: Network,
      description: 'Network protocols, topologies, and communication systems.',
      color: 'bg-blue-500',
      textColor: 'text-blue-500',
      borderColor: 'border-blue-500',
      progress: 65,
      // difficulty: 'Intermediate',
      completed: 78,
      department: 'computer'
    },
    {
      id: 2,
      name: 'Database Management',
      icon: Database,
      description: 'Database design, SQL queries, and management systems.',
      color: 'bg-green-500',
      textColor: 'text-green-500',
      borderColor: 'border-green-500',
      progress: 40,
      // difficulty: 'Intermediate',
      completed: 38,
      department: 'computer'
    },
    {
      id: 3,
      name: 'Python',
      icon: Code,
      description: 'Python programming from basics to advanced concepts.',
      color: 'bg-yellow-500',
      textColor: 'text-yellow-500',
      borderColor: 'border-yellow-500',
      progress: 80,
      // difficulty: 'Beginner',
      completed: 120,
      department: 'computer'
    },
    {
      id: 4,
      name: 'Java',
      icon: Coffee,
      description: 'Object-oriented programming with Java language.',
      color: 'bg-red-500',
      textColor: 'text-red-500',
      borderColor: 'border-red-500',
      progress: 30,
      // difficulty: 'Intermediate',
      completed: 33,
      department: 'computer'
    },
    {
      id: 5,
      name: 'C++',
      icon: Cpu,
      description: 'C++ programming with OOP and advanced features.',
      color: 'bg-purple-500',
      textColor: 'text-purple-500',
      borderColor: 'border-purple-500',
      progress: 20,
      // difficulty: 'Advanced',
      completed: 17,
      department: 'computer'
    },
    {
      id: 6,
      name: 'C',
      icon: Cpu,
      description: 'Fundamentals of C programming language.',
      color: 'bg-indigo-500',
      textColor: 'text-indigo-500',
      borderColor: 'border-indigo-500',
      progress: 50,
      // difficulty: 'Intermediate',
      completed: 38,
      department: 'computer'
     },
    // {
    //   id: 7,
    //   name: 'Compiler Design',
    //   icon: Code,
    //   description: 'Compiler design, parsing, and optimization techniques.',
    //   color: 'bg-pink-500',
    //   textColor: 'text-pink-500',
    //   borderColor: 'border-pink-500',
    //   progress: 15,
    //   // difficulty: 'Advanced',
    //   completed: 9,
    //   department: 'computer'
    // },
    // {
    //   id: 8,
    //   name: 'Digital Electronics',
    //   icon: CpuIcon,
    //   description: 'Logic gates, circuits, and digital system design.',
    //   color: 'bg-teal-500',
    //   textColor: 'text-teal-500',
    //   borderColor: 'border-teal-500',
    //   progress: 45,
    //   // difficulty: 'Intermediate',
    //   completed: 42,
    //   department: 'extc'
    // },
    // {
    //   id: 9,
    //   name: 'Signals & Systems',
    //   icon: Zap,
    //   description: 'Signal processing and system analysis techniques.',
    //   color: 'bg-orange-500',
    //   textColor: 'text-orange-500',
    //   borderColor: 'border-orange-500',
    //   progress: 30,
    //   // difficulty: 'Advanced',
    //   completed: 24,
    //   department: 'extc'
    // },
    // {
    //   id: 10,
    //   name: 'Power Systems',
    //   icon: Zap,
    //   description: 'Electrical power generation, transmission, and distribution.',
    //   color: 'bg-amber-500',
    //   textColor: 'text-amber-500',
    //   borderColor: 'border-amber-500',
    //   progress: 25,
    //   // difficulty: 'Intermediate',
    //   completed: 18,
    //   department: 'electrical'
    // },
    // {
    //   id: 11,
    //   name: 'Structural Analysis',
    //   icon: Building,
    //   description: 'Analysis of structures and load-bearing systems.',
    //   color: 'bg-stone-500',
    //   textColor: 'text-stone-500',
    //   borderColor: 'border-stone-500',
    //   progress: 20,
    //   // difficulty: 'Intermediate',
    //   completed: 15,
    //   department: 'civil'
    // },
    // {
    //   id: 12,
    //   name: 'Thermodynamics',
    //   icon: Factory,
    //   description: 'Principles of energy transfer and conversion.',
    //   color: 'bg-rose-500',
    //   textColor: 'text-rose-500',
    //   borderColor: 'border-rose-500',
    //   progress: 35,
    //   // difficulty: 'Advanced',
    //   completed: 28,
    //   department: 'chemical'
    // }
  ]

  const filteredSubjects = subjects.filter(subject => {
    const matchesSearch = subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         subject.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesDepartment = selectedDepartment === 'all' || 
                             subject.department === selectedDepartment
    return matchesSearch && matchesDepartment
  })

  const SubjectCard = ({ subject }) => {
    const Icon = subject.icon
    const navigate = useNavigate()

     const handlePracticeClick = () => {
    if (subject.name === 'Database Management') {
      navigate('/dbms-quiz') // Navigate to DBMS Quiz for Database Management
    } 
    else if(subject.name === 'Computer Network') {
      navigate('/networking-playground')
    }
    else if(subject.name === 'Python') {
      navigate('/code-editor')
    }
    else if(subject.name === 'Java') {
      navigate('/code-editor')
    }
    else if(subject.name === 'C++') {
      navigate('/code-editor')
    }
    else if(subject.name === 'C') {
      navigate('/code-editor')
    }
  
    else {
      navigate(`/practice/${subject.id}`) // Default practice route for other subjects
    }
  }
    
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
          
          <div className="mt-4 flex items-center text-sm text-gray-600 dark:text-gray-400">
            <BarChart3 className="w-4 h-4 mr-1" />
            {subject.completed} completed
          </div>
          
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
              <span>Progress</span>
              <span>{subject.progress}%</span>
            </div>
            <div className="bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className={`h-2 rounded-full ${subject.color}`}
                style={{ width: `${subject.progress}%` }}
              ></div>
            </div>
          </div>
          
          <div className="mt-6 flex space-x-3">
          <Link
            to={`/questions/${subject.id}`}
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-md bg-blue-600 text-white font-medium hover:bg-blue-700 transition-colors"
          >
            <BookOpen className="w-4 h-4 mr-2" />
            MCQ
          </Link>
          <button
            onClick={handlePracticeClick} // Use the new handler
            className="flex-1 flex items-center justify-center px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
          >
            <Play className="w-4 h-4 mr-2" />
            Practical
          </button>
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
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Questions</h1>
              <p className="mt-2 text-gray-600 dark:text-gray-400">
                Browse questions by department and track your progress
              </p>
            </div>
          </div>
        </div>

        {/* Search and Filter */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700 mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search subjects..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-400" />
              <span className="text-sm text-gray-600 dark:text-gray-400">Department:</span>
              <select 
                className="border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
              >
                {departments.map(dept => {
                  const DeptIcon = dept.icon
                  return (
                    <option key={dept.id} value={dept.id}>
                      {dept.name}
                    </option>
                  )
                })}
              </select>
            </div>
          </div>
        </div>

        {/* Progress Summary - Simplified */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Subjects</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{subjects.length}</p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                <BarChart3 className="w-5 h-5 text-purple-600 dark:text-purple-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Questions Completed</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {subjects.reduce((total, subject) => total + subject.completed, 0)}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-5 border border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
                <HelpCircle className="w-5 h-5 text-green-600 dark:text-green-300" />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Mastery Level</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.round(subjects.reduce((total, subject) => total + subject.progress, 0) / subjects.length)}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Subjects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredSubjects.map((subject) => (
            <SubjectCard key={subject.id} subject={subject} />
          ))}
        </div>

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <HelpCircle className="w-16 h-16 text-gray-300 dark:text-gray-600 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No subjects found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search or filter to find what you're looking for.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}

export default Questions