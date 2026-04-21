import React, { useState } from 'react'
import axios from 'axios'
import CodeMirror from '@uiw/react-codemirror'
import { cpp } from '@codemirror/lang-cpp'
import { java } from '@codemirror/lang-java'
import { python } from '@codemirror/lang-python'
import { Play, RefreshCw, Terminal, Cpu, Lightbulb } from 'lucide-react'

const LANGS = ['python', 'c', 'cpp', 'java']

export default function CodeEditor() {
  const [code, setCode]               = useState('# Write your Python code here\nprint("Hello, World!")')
  const [output, setOutput]           = useState('')
  const [aiFeedback, setAiFeedback]   = useState('')
  const [language, setLanguage]       = useState('python')
  const [question, setQuestion]       = useState('Write a program that prints "Hello, World!" to the console.')
  const [loadingQ, setLoadingQ]       = useState(false)
  const [running, setRunning]         = useState(false)

  const ext = () => {
    if (language === 'python') return python()
    if (language === 'java')   return java()
    return cpp()
  }

  const generateQuestion = async () => {
    setLoadingQ(true)
    setQuestion('Generating...')
    try {
      const res = await axios.get('/api/coding/generate-question')
      setQuestion(res.data.question || 'Failed to generate.')
    } catch { setQuestion('Error generating question.') }
    finally { setLoadingQ(false) }
  }

  const runCode = async () => {
    setRunning(true)
    setOutput('Running...')
    setAiFeedback('')
    try {
      const res = await axios.post('/api/coding/run', { code, language, question })
      setOutput(res.data.output || 'No output')
      setAiFeedback(res.data.ai_feedback || '')
    } catch (e) {
      setOutput(e.response?.data?.error || 'Error connecting to server')
    } finally { setRunning(false) }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="section-heading flex items-center gap-2">
            <Cpu className="w-6 h-6 text-cyan-500" /> Code Editor
          </h1>
          <p className="section-sub mt-1">Write, run, and get AI feedback on your code</p>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-5 flex flex-wrap items-end gap-4">
        <div>
          <label className="cyber-label mb-2 block">Language</label>
          <select
            value={language}
            onChange={e => setLanguage(e.target.value)}
            className="input w-36"
          >
            {LANGS.map(l => <option key={l} value={l}>{l.toUpperCase()}</option>)}
          </select>
        </div>
        <button onClick={generateQuestion} disabled={loadingQ}
                className="btn btn-outline btn-md gap-2">
          <RefreshCw className={`w-4 h-4 ${loadingQ ? 'animate-spin' : ''}`} />
          {loadingQ ? 'Generating...' : 'New Question'}
        </button>
      </div>

      {/* Question */}
      <div className="card p-5">
        <label className="cyber-label mb-2 block">AI-Generated Question</label>
        <textarea
          value={question}
          onChange={e => setQuestion(e.target.value)}
          rows={3}
          className="input resize-none"
          placeholder="Click 'New Question' to get a coding challenge"
        />
      </div>

      {/* Editor + Output */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Editor */}
        <div className="card overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
            <span className="cyber-label">Editor</span>
            <span className="text-xs text-gray-400 dark:text-gray-600 font-mono">{language.toUpperCase()}</span>
          </div>
          <CodeMirror
            value={code}
            height="380px"
            extensions={[ext()]}
            onChange={v => setCode(v)}
            theme="dark"
            basicSetup={{ lineNumbers: true, highlightActiveLine: true, foldGutter: true }}
            className="text-sm"
          />
        </div>

        {/* Output panel */}
        <div className="space-y-4">
          <div className="card overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
              <span className="cyber-label flex items-center gap-1.5"><Terminal className="w-3.5 h-3.5" />Output</span>
              <button onClick={runCode} disabled={running}
                      className="btn btn-primary btn-sm gap-1.5">
                <Play className="w-3.5 h-3.5" />
                {running ? 'Running...' : 'Run'}
              </button>
            </div>
            <div className="p-4">
              <pre className="bg-gray-950 dark:bg-black/40 text-emerald-400 p-4 rounded-lg overflow-auto max-h-44 text-xs font-mono whitespace-pre-wrap leading-relaxed">
                {output || '// Output will appear here'}
              </pre>
            </div>
          </div>

          {aiFeedback && (
            <div className="card overflow-hidden">
              <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700/50">
                <span className="cyber-label flex items-center gap-1.5"><Lightbulb className="w-3.5 h-3.5" />AI Feedback</span>
              </div>
              <div className="p-4">
                <div className="bg-amber-50 dark:bg-amber-500/5 border border-amber-200 dark:border-amber-500/20 text-amber-800 dark:text-amber-300 p-4 rounded-lg text-xs leading-relaxed whitespace-pre-wrap">
                  {aiFeedback}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Tips */}
      <div className="card p-5 border-cyan-500/20 dark:border-cyan-500/20 bg-cyan-50/50 dark:bg-cyan-500/5">
        <h3 className="cyber-label mb-3">How to use</h3>
        <ul className="space-y-1.5 text-xs text-gray-600 dark:text-gray-400">
          {['Select your programming language from the dropdown.',
            'Click "New Question" to get an AI-generated coding challenge.',
            'Write your solution in the editor.',
            'Click "Run" to execute and receive AI feedback.'].map(t => (
            <li key={t} className="flex items-start gap-2">
              <span className="text-cyan-500 mt-0.5">›</span>{t}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
