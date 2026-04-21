import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { BookOpen, Play, Code, Database, Network, Coffee, Cpu, BarChart3, Search, HelpCircle } from 'lucide-react'

const subjects = [
  { id:1, name:'Computer Network',    icon:Network,  accent:'bg-blue-500',    ringColor:'#3b82f6', progress:65, completed:78,  dept:'computer' },
  { id:2, name:'Database Management', icon:Database, accent:'bg-emerald-500', ringColor:'#10b981', progress:40, completed:38,  dept:'computer' },
  { id:3, name:'Python',              icon:Code,     accent:'bg-amber-500',   ringColor:'#f59e0b', progress:80, completed:120, dept:'computer' },
  { id:4, name:'Java',                icon:Coffee,   accent:'bg-red-500',     ringColor:'#ef4444', progress:30, completed:33,  dept:'computer' },
  { id:5, name:'C++',                 icon:Cpu,      accent:'bg-violet-500',  ringColor:'#8b5cf6', progress:20, completed:17,  dept:'computer' },
  { id:6, name:'C',                   icon:Cpu,      accent:'bg-indigo-500',  ringColor:'#6366f1', progress:50, completed:38,  dept:'computer' },
]

const desc = {
  'Computer Network':    'Network protocols, topologies, and communication systems.',
  'Database Management': 'Database design, SQL queries, and management systems.',
  'Python':              'Python programming from basics to advanced concepts.',
  'Java':                'Object-oriented programming with Java language.',
  'C++':                 'C++ programming with OOP and advanced features.',
  'C':                   'Fundamentals of C programming language.',
}

function SubjectCard({ subject }) {
  const navigate = useNavigate()
  const Icon = subject.icon

  const handleMCQ = () => navigate('/mcq-exam', { state: { subject: subject.name.toLowerCase().replace(/\s+/g,'-'), subjectName: subject.name } })
  const handlePractical = () => {
    const map = { 'Database Management':'/dbms-quiz', 'Computer Network':'/networking-playground' }
    navigate(map[subject.name] || '/code-editor')
  }

  return (
    <div className="card p-6 group hover:-translate-y-1 transition-all duration-200"
         style={{ borderLeftWidth: 3, borderLeftColor: subject.ringColor }}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-11 h-11 rounded-xl ${subject.accent} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 leading-relaxed">{desc[subject.name]}</p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-500 mb-4">
        <BarChart3 className="w-3.5 h-3.5" />
        {subject.completed} completed
      </div>

      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mb-1.5">
          <span>Progress</span><span>{subject.progress}%</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${subject.progress}%` }} /></div>
      </div>

      <div className="flex gap-2">
        <button onClick={handleMCQ}
                className="flex-1 btn btn-primary btn-sm justify-center gap-1.5 text-xs">
          <BookOpen className="w-3.5 h-3.5" /> MCQ
        </button>
        <button onClick={handlePractical}
                className="flex-1 btn btn-secondary btn-sm justify-center gap-1.5 text-xs">
          <Play className="w-3.5 h-3.5" /> Practical
        </button>
      </div>
    </div>
  )
}

export default function Questions() {
  const [search, setSearch] = useState('')
  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(search.toLowerCase()) ||
    (desc[s.name] || '').toLowerCase().includes(search.toLowerCase())
  )
  const totalCompleted = subjects.reduce((t, s) => t + s.completed, 0)
  const avgProgress    = Math.round(subjects.reduce((t, s) => t + s.progress, 0) / subjects.length)

  return (
    <div className="space-y-8">
      <div>
        <h1 className="section-heading">Questions</h1>
        <p className="section-sub mt-1">Browse subjects and track your progress</p>
      </div>

      {/* Search */}
      <div className="card p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-600" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="input pl-9"
          />
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:'Total Subjects',      value:subjects.length, icon:BookOpen,   accent:'bg-blue-500' },
          { label:'Questions Completed', value:totalCompleted,  icon:BarChart3,  accent:'bg-violet-500' },
          { label:'Avg Mastery',         value:`${avgProgress}%`, icon:HelpCircle, accent:'bg-emerald-500' },
        ].map(({ label, value, icon: Icon, accent }) => (
          <div key={label} className="card p-5 flex items-center gap-4">
            <div className={`w-10 h-10 rounded-xl ${accent} flex items-center justify-center flex-shrink-0`}>
              <Icon className="w-4 h-4 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500 dark:text-gray-500">{label}</p>
              <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map(s => <SubjectCard key={s.id} subject={s} />)}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16">
          <HelpCircle className="w-12 h-12 text-gray-300 dark:text-gray-700 mx-auto mb-3" />
          <p className="text-sm text-gray-500 dark:text-gray-500">No subjects match your search.</p>
        </div>
      )}
    </div>
  )
}
