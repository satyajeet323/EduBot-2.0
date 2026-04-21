import React from 'react'
import { useAuth } from '../hooks/useAuth'
import { Link } from 'react-router-dom'
import { BookOpen, Play, Code, Database, Network, Coffee, Cpu, FileText, ChevronRight, Award } from 'lucide-react'

const subjects = [
  { id:1, name:'Computer Network',    icon:Network,  slug:'computer-network', actionLabel:'Playground',  actionLink:'/networking-playground', accent:'bg-blue-500',    ringColor:'#3b82f6', key:'computerNetworks' },
  { id:2, name:'Database Management', icon:Database, slug:'dbms',             actionLabel:'DBMS Quiz',   actionLink:'/dbms-quiz',             accent:'bg-emerald-500', ringColor:'#10b981', key:'dbms' },
  { id:3, name:'Python',              icon:Code,     slug:'python',           actionLabel:'Code Editor', actionLink:'/code-editor',           accent:'bg-amber-500',   ringColor:'#f59e0b', key:'python' },
  { id:4, name:'Java',                icon:Coffee,   slug:'java',             actionLabel:'Code Editor', actionLink:'/code-editor',           accent:'bg-red-500',     ringColor:'#ef4444', key:'java' },
  { id:5, name:'C++',                 icon:Cpu,      slug:'cpp',              actionLabel:'Code Editor', actionLink:'/code-editor',           accent:'bg-violet-500',  ringColor:'#8b5cf6', key:'cpp' },
  { id:6, name:'C Programming',       icon:Cpu,      slug:'c-programming',    actionLabel:'Code Editor', actionLink:'/code-editor',           accent:'bg-indigo-500',  ringColor:'#6366f1', key:'c' },
]

const desc = {
  'Computer Network':    'Network protocols, topologies, and communication systems.',
  'Database Management': 'Database design, SQL queries, and management systems.',
  'Python':              'Python programming from basics to advanced concepts.',
  'Java':                'Object-oriented programming with Java language.',
  'C++':                 'C++ programming with OOP and advanced features.',
  'C Programming':       'Master the fundamentals of C programming language.',
}

function SubjectCard({ subject, progress }) {
  const Icon = subject.icon
  return (
    <div className="card p-6 group hover:-translate-y-1 transition-all duration-200"
         style={{ borderLeftWidth: 3, borderLeftColor: subject.ringColor }}>
      <div className="flex items-start gap-4 mb-4">
        <div className={`w-11 h-11 rounded-xl ${subject.accent} flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 transition-transform`}>
          <Icon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">{subject.name}</h3>
          <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5 leading-relaxed">{desc[subject.name]}</p>
        </div>
      </div>
      <div className="mb-5">
        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-500 mb-1.5">
          <span>Progress</span><span>{progress} tasks</span>
        </div>
        <div className="progress-bar"><div className="progress-fill" style={{ width: `${Math.min(progress, 100)}%` }} /></div>
      </div>
      <div className="flex gap-2">
        <Link to={`/syllabus/${subject.slug}`} className="flex-1 btn btn-secondary btn-sm justify-center gap-1.5 text-xs">
          <FileText className="w-3.5 h-3.5" /> Syllabus
        </Link>
        <Link to={subject.actionLink} className={`flex-1 btn btn-sm justify-center gap-1.5 text-xs text-white ${subject.accent} hover:opacity-90`}>
          <Play className="w-3.5 h-3.5" /> {subject.actionLabel}
        </Link>
      </div>
    </div>
  )
}

export default function Subjects() {
  const { user } = useAuth()
  const mp = user?.moduleProgress || {}
  const totalDone = Object.values(mp).reduce((a, b) => a + b, 0)
  const activeCount = Object.keys(mp).filter(k => mp[k] > 0).length

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-heading">Subjects</h1>
          <p className="section-sub mt-1">Choose a subject to practice or review the syllabus</p>
        </div>
        <div className="cyber-badge hidden sm:flex"><Award className="w-3 h-3" />6 subjects</div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label:'Total Subjects',   value:6,           icon:BookOpen, accent:'bg-blue-500' },
          { label:'Topics Completed', value:totalDone,   icon:Play,     accent:'bg-emerald-500' },
          { label:'Active Subjects',  value:activeCount, icon:Award,    accent:'bg-violet-500' },
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {subjects.map(s => <SubjectCard key={s.id} subject={s} progress={mp[s.key] || 0} />)}
      </div>

      <div className="card p-8 text-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Ready to test your knowledge?</h2>
        <p className="text-sm text-gray-500 dark:text-gray-500 mb-6 max-w-md mx-auto">
          Practice with AI-generated questions tailored to your level across all subjects.
        </p>
        <Link to="/questions" className="inline-flex items-center gap-2 btn btn-primary btn-md px-6">
          Start Practice Session <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  )
}
