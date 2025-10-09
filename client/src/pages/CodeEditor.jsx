import React, { useState } from 'react';
import axios from 'axios';
import CodeMirror from '@uiw/react-codemirror';
import { cpp } from '@codemirror/lang-cpp';
import { java } from '@codemirror/lang-java';
import { python } from '@codemirror/lang-python';
import { useAuth } from '../hooks/useAuth';
import { Cpu, Play, RefreshCw } from 'lucide-react';

const CodeEditor = () => {
  const { user } = useAuth();
  const [code, setCode] = useState('// Write your code here');
  const [output, setOutput] = useState('');
  const [aiFeedback, setAiFeedback] = useState('');
  const [language, setLanguage] = useState('python');
  const [question, setQuestion] = useState('');
  const [loadingQuestion, setLoadingQuestion] = useState(false);
  const [isRunning, setIsRunning] = useState(false);

  const getLanguageExtension = () => {
    switch (language) {
      case 'python': return python();
      case 'c':
      case 'cpp': return cpp();
      case 'java': return java();
      default: return python();
    }
  };

  const handleGenerateQuestion = async () => {
    setLoadingQuestion(true);
    setQuestion('Generating question...');
    try {
      const res = await axios.get('http://localhost:5001/generate-coding-question');
      setQuestion(res.data.question || 'Failed to generate question.');
    } catch (err) {
      setQuestion('❌ Error generating question. Please try again.');
      console.error('Error generating question:', err);
    } finally {
      setLoadingQuestion(false);
    }
  };

  const handleRun = async () => {
    setIsRunning(true);
    setOutput('Running your code...');
    setAiFeedback('');
    try {
      const response = await axios.post('http://localhost:5001/run-code', {
        code,
        language,
        question,
      });
      setOutput(response.data.output);
      setAiFeedback(response.data.ai_feedback || '');
    } catch (error) {
      console.error('Error running code:', error);
      setOutput('⚠️ Error connecting to server or running code');
      setAiFeedback('');
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-cyan-400 mb-2">
            <Cpu className="inline-block w-8 h-8 mr-3" />
            Code Editor & AI Evaluator
          </h1>
          <p className="text-gray-400">
            Write, run, and get AI feedback on your code in multiple programming languages
          </p>
        </div>

        {/* Controls */}
        <div className="flex flex-col lg:flex-row gap-6 mb-6">
          <div className="flex-1">
            <div className="flex flex-wrap gap-4 items-center mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  Select Language:
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                >
                  <option value="python">Python</option>
                  <option value="c">C</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                </select>
              </div>

              <button
                onClick={handleGenerateQuestion}
                disabled={loadingQuestion}
                className="btn btn-primary flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loadingQuestion ? 'animate-spin' : ''}`} />
                {loadingQuestion ? 'Generating...' : 'Generate Question'}
              </button>
            </div>

            {/* Question Area */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                AI-Generated Question:
              </label>
              <textarea
                value={question}
                onChange={(e) => setQuestion(e.target.value)}
                rows={3}
                className="w-full bg-gray-800 text-white border border-gray-600 rounded-lg px-4 py-2 focus:ring-2 focus:ring-cyan-500 focus:border-transparent resize-none"
                placeholder="Click 'Generate Question' to get a coding challenge"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Editor */}
          <div className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700">
            <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
              <h3 className="text-sm font-medium text-gray-300">Editor</h3>
            </div>
            <CodeMirror
              value={code}
              height="400px"
              extensions={[getLanguageExtension()]}
              onChange={(value) => setCode(value)}
              theme="dark"
              basicSetup={{
                lineNumbers: true,
                highlightActiveLine: true,
                foldGutter: true,
              }}
              className="text-sm"
            />
          </div>

          {/* Output & Feedback */}
          <div className="space-y-6">
            <div className="bg-gray-800 rounded-lg border border-gray-700">
              <div className="bg-gray-900 px-4 py-2 border-b border-gray-700 flex justify-between items-center">
                <h3 className="text-sm font-medium text-gray-300">Output</h3>
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="btn btn-primary btn-sm flex items-center"
                >
                  <Play className="w-4 h-4 mr-1" />
                  {isRunning ? 'Running...' : 'Run Code'}
                </button>
              </div>
              <div className="p-4">
                <pre className="bg-gray-900 text-green-400 p-3 rounded-lg overflow-auto max-h-40 text-sm whitespace-pre-wrap">
                  {output}
                </pre>
              </div>
            </div>

            {aiFeedback && (
              <div className="bg-gray-800 rounded-lg border border-gray-700">
                <div className="bg-gray-900 px-4 py-2 border-b border-gray-700">
                  <h3 className="text-sm font-medium text-gray-300">AI Feedback</h3>
                </div>
                <div className="p-4">
                  <div className="bg-yellow-900/20 text-yellow-200 p-3 rounded-lg text-sm whitespace-pre-wrap">
                    {aiFeedback}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-900/20 border border-blue-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-blue-300 mb-2">How to use:</h3>
          <ul className="text-blue-200 text-sm space-y-1">
            <li>• Select your programming language</li>
            <li>• Generate a question or write your own code</li>
            <li>• Click "Run Code" to execute and get AI feedback</li>
            <li>• The AI will analyze your code and provide suggestions</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default CodeEditor;