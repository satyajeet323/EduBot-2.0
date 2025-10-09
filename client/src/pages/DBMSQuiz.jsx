import React, { useState } from 'react';
import axios from 'axios';
import { practicalAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';

const DBMSQuiz = () => {
  const { updateUser } = useAuth();
  const [question, setQuestion] = useState('');
  const [setupSQL, setSetupSQL] = useState('');
  const [userQuery, setUserQuery] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [queryResult, setQueryResult] = useState(null);
  const [evaluation, setEvaluation] = useState(null);
  const [outputRows, setOutputRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [setupTable, setSetupTable] = useState(null);

  const handleGenerateQuestion = async () => {
    setLoading(true);
    try {
      const res = await axios.get('http://localhost:5001/generate-sql-question');
      const data = res.data.data;
      setQuestion(data.question);
      setSetupSQL(data.setup_sql);
      setUserQuery('');
      setEvaluation(null);
      setQueryResult(null);
      setSessionId('');
      setSetupTable(null);
    } catch (err) {
      alert('Error fetching question: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleRunSetup = async () => {
    try {
      const res = await axios.post('http://localhost:5001/run-setup', {
        setup_sql: setupSQL,
        session_id: sessionId || undefined
      });
      const sid = res.data.session_id;
      setSessionId(sid);
      alert('Setup successful!');
      await fetchSetupTable(sid);
    } catch (err) {
      alert('Setup Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const fetchSetupTable = async (sid) => {
    try {
      const res = await axios.post('http://localhost:5001/get-table', {
        session_id: sid});
      if (res.data.status === 'success') {
        setSetupTable(res.data.data);
      }
    } catch (err) {
      alert('Table Fetch Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleRunQuery = async () => {
    try {
      const res = await axios.post('http://localhost:5001/run-query', {
        session_id: sessionId,
        user_query: userQuery
      });
      setQueryResult(res.data);
      setOutputRows(res.data.rows);
    } catch (err) {
      alert('Query Error: ' + (err.response?.data?.message || err.message));
    }
  };

  const handleEvaluate = async () => {
    try {
      const res = await axios.post('http://localhost:5001/evaluate-sql', {
        question,
        setup_sql: setupSQL,
        user_query: userQuery,
        user_output: outputRows
      });
      setEvaluation(res.data.evaluation);
      // Also submit as practical result with configurable scoring (score 0-5)
      const score = Number(res.data.evaluation?.score ?? 0);
      try {
        const submitRes = await practicalAPI.submit({
          subject: 'dbms',
          task: question || 'DBMS Practical',
          performanceScore: Math.max(0, Math.min(5, Math.round(score))),
          meta: { suggested_query: res.data.evaluation?.suggested_query || null }
        });
        // Hydrate user progress in session
        const updatedUser = {
          ...(JSON.parse(sessionStorage.getItem('user')) || {}),
          progress: submitRes.data.data.progress,
          moduleProgress: submitRes.data.data.moduleProgress,
          streak: submitRes.data.data.streak,
          lastSolvedDate: submitRes.data.data.lastSolvedDate
        };
        sessionStorage.setItem('user', JSON.stringify(updatedUser));
        updateUser(updatedUser);
      } catch (e) {
        // Non-fatal for UI
        console.error('Practical submit failed:', e);
      }
    } catch (err) {
      alert('Evaluation Error: ' + (err.response?.data?.message || err.message));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 py-8 px-4">
      <div className="max-w-6xl mx-auto bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-200 dark:border-gray-700">
        <h2 className="text-3xl md:text-4xl font-bold text-center mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
          🧠 DBMS SQL Evaluator
        </h2>
        
        <button
          className={`w-full mb-8 py-3 px-6 rounded-xl font-semibold text-white transition-all duration-300 ${
            loading 
              ? 'bg-gray-400 cursor-not-allowed' 
              : 'bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 shadow-lg hover:shadow-xl'
          } flex items-center justify-center gap-2`}
          onClick={handleGenerateQuestion}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              Generating...
            </>
          ) : (
            <>
              <span>🎲</span> Generate New Question
            </>
          )}
        </button>

        {question && (
          <>
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm">📌</span>
                </div>
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Question:</h3>
              </div>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-6 border-l-4 border-blue-500">
                <p className="text-blue-800 dark:text-blue-200 font-medium leading-relaxed">
                  {question}
                </p>
              </div>
            </div>

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-blue-500">⚙️</span>
                Reference Setup SQL:
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4 mb-4">
                <pre className="font-mono text-sm text-gray-800 dark:text-gray-200 overflow-x-auto">
                  {setupSQL}
                </pre>
              </div>
              <button
                className="w-full py-3 px-6 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                onClick={handleRunSetup}
              >
                <span>▶️</span> Run Setup
              </button>
            </div>

            {setupTable && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📋</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Setup Table Data:</h3>
                </div>
                <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                        <tr>
                          {setupTable.columns.map((col, idx) => (
                            <th 
                              key={idx} 
                              className="px-6 py-4 text-left font-bold text-blue-600 dark:text-blue-300 text-sm uppercase tracking-wider"
                            >
                              {col}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                        {setupTable.rows.map((row, idx) => (
                          <tr 
                            key={idx} 
                            className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                          >
                            {row.map((cell, i) => (
                              <td 
                                key={i} 
                                className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-medium"
                              >
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            <div className="mb-8">
              <label className="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-3 flex items-center gap-2">
                <span className="text-blue-500">📝</span>
                Your SQL Query:
              </label>
              <textarea
                className="w-full h-40 p-4 border-2 border-gray-300 dark:border-gray-600 rounded-xl resize-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-800 bg-white dark:bg-gray-700 text-gray-800 dark:text-gray-200 font-mono text-sm transition-all duration-300"
                value={userQuery}
                onChange={(e) => setUserQuery(e.target.value)}
                placeholder="Write your SQL query here..."
              ></textarea>
              <button
                className="w-full mt-4 py-3 px-6 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                onClick={handleRunQuery}
              >
                <span>▶️</span> Run Query
              </button>
            </div>

            {queryResult && (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-8 h-8 bg-indigo-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">📄</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Query Result:</h3>
                </div>
                {queryResult.columns.length > 0 ? (
                  <div className="rounded-xl overflow-hidden shadow-lg border border-gray-200 dark:border-gray-600">
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead className="bg-gradient-to-r from-gray-50 to-gray-100 dark:from-gray-700 dark:to-gray-600">
                          <tr>
                            {queryResult.columns.map((col, idx) => (
                              <th 
                                key={idx} 
                                className="px-6 py-4 text-left font-bold text-blue-600 dark:text-blue-300 text-sm uppercase tracking-wider"
                              >
                                {col}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 dark:divide-gray-600">
                          {queryResult.rows.map((row, idx) => (
                            <tr 
                              key={idx} 
                              className={idx % 2 === 0 ? 'bg-white dark:bg-gray-800' : 'bg-gray-50 dark:bg-gray-700'}
                            >
                              {row.map((cell, i) => (
                                <td 
                                  key={i} 
                                  className="px-6 py-4 text-sm text-gray-800 dark:text-gray-200 font-medium"
                                >
                                  {cell}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ) : (
                  <div className="bg-amber-50 dark:bg-amber-900/20 border-l-4 border-amber-500 rounded-xl p-6">
                    <p className="text-amber-800 dark:text-amber-200 font-medium">
                      No rows returned or non-SELECT query.
                    </p>
                  </div>
                )}
              </div>
            )}

            <div className="mb-8">
              <button
                className="w-full py-3 px-6 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 flex items-center justify-center gap-2"
                onClick={handleEvaluate}
              >
                <span>🧪</span> Submit for Evaluation
              </button>
            </div>

            {evaluation && (
              <div className="bg-gray-50 dark:bg-gray-700 rounded-2xl p-6 mb-6 border border-gray-200 dark:border-gray-600">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">✅</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-800 dark:text-white">Gemini Evaluation:</h3>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div className="bg-white dark:bg-gray-600 rounded-xl p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Correct:</p>
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${
                      evaluation.is_correct 
                        ? 'bg-green-100 text-green-800 dark:bg-green-800 dark:text-green-100' 
                        : 'bg-red-100 text-red-800 dark:bg-red-800 dark:text-red-100'
                    }`}>
                      {evaluation.is_correct ? '✅ Yes' : '❌ No'}
                    </span>
                  </div>
                  
                  <div className="bg-white dark:bg-gray-600 rounded-xl p-4 shadow-sm">
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Score:</p>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                      {evaluation.score} / 5
                    </span>
                  </div>
                </div>
                
                <div className="mb-6">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Feedback:</p>
                  <p className={`text-lg font-medium ${
                    evaluation.is_correct ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
                  }`}>
                    {evaluation.feedback}
                  </p>
                </div>
                
                {evaluation.suggested_query && (
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">Suggested Query:</p>
                    <pre className="bg-gray-900 rounded-xl p-4 overflow-x-auto text-green-400 font-mono text-sm">
                      {evaluation.suggested_query}
                    </pre>
                  </div>
                )}
              </div>
            )}
          </>
        )}
        
        <footer className="text-center pt-6 border-t border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            DBMS SQL Evaluator &copy; {new Date().getFullYear()}
          </p>
        </footer>
      </div>
    </div>
  );
};

export default DBMSQuiz;