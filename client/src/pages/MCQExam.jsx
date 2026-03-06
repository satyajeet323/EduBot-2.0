import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Maximize, Minimize, Clock, CheckCircle, XCircle, Award, TrendingUp } from 'lucide-react';
import axios from 'axios';

const MCQExam = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { subject, subjectName } = location.state || {};

  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [timeElapsed, setTimeElapsed] = useState(0);
  const [examFinished, setExamFinished] = useState(false);
  const [results, setResults] = useState(null);
  const [showReview, setShowReview] = useState(false);

  useEffect(() => {
    if (!subject) {
      navigate('/questions');
      return;
    }
    generateQuestions();
    enterFullscreen();
    
    const timer = setInterval(() => {
      setTimeElapsed(prev => prev + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const generateQuestions = async () => {
    try {
      // Try both sessionStorage and localStorage for token
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        navigate('/login');
        return;
      }
      
      console.log('Generating questions with token:', token ? 'Token found' : 'No token');
      
      const response = await axios.post(
        'http://localhost:5000/api/mcq/generate',
        { subject: subjectName || subject, difficulty: 'intermediate' },
        { 
          headers: { Authorization: `Bearer ${token}` },
          timeout: 30000 // 30 second timeout
        }
      );
      
      if (response.data.status === 'success') {
        setQuestions(response.data.data.questions);
        if (response.data.data.fallback) {
          console.warn('Using fallback questions due to API issues');
        }
      }
    } catch (error) {
      console.error('Error generating questions:', error);
      
      let errorMessage = 'Failed to generate questions. ';
      
      if (error.response?.status === 401) {
        errorMessage = 'Session expired. Please login again.';
        setTimeout(() => navigate('/login'), 2000);
      } else if (error.code === 'ECONNABORTED') {
        errorMessage += 'Request timed out. Please try again.';
      } else if (error.response?.data?.message) {
        errorMessage += error.response.data.message;
      } else if (error.message) {
        errorMessage += error.message;
      } else {
        errorMessage += 'Please check your connection and try again.';
      }
      
      alert(errorMessage);
      navigate('/questions');
    } finally {
      setLoading(false);
    }
  };

  const enterFullscreen = () => {
    const elem = document.documentElement;
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    } else if (document.msExitFullscreen) {
      document.msExitFullscreen();
    }
    setIsFullscreen(false);
  };

  const handleAnswerSelect = (questionId, answer) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(prev => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      const confirm = window.confirm('You have not answered all questions. Submit anyway?');
      if (!confirm) return;
    }

    const answers = questions.map(q => ({
      questionId: q.id,
      selectedAnswer: selectedAnswers[q.id] || null,
      correctAnswer: q.correctAnswer,
      isCorrect: selectedAnswers[q.id] === q.correctAnswer
    }));

    try {
      // Try both sessionStorage and localStorage for token
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      
      if (!token) {
        alert('Authentication required. Please login again.');
        navigate('/login');
        return;
      }
      
      const response = await axios.post(
        'http://localhost:5000/api/mcq/submit',
        {
          subject: subjectName || subject,
          answers,
          totalQuestions: questions.length,
          timeTaken: timeElapsed
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.status === 'success') {
        setResults(response.data.data);
        setExamFinished(true);
        exitFullscreen();
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      
      if (error.response?.status === 401) {
        alert('Session expired. Please login again.');
        navigate('/login');
      } else {
        alert('Failed to submit exam. Please try again.');
      }
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Generating your exam questions...</p>
        </div>
      </div>
    );
  }

  if (examFinished && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full mb-4 ${
                results.score >= 70 ? 'bg-green-100' : 'bg-orange-100'
              }`}>
                <Award className={`w-12 h-12 ${
                  results.score >= 70 ? 'text-green-600' : 'text-orange-600'
                }`} />
              </div>
              <h1 className="text-4xl font-bold text-gray-800 mb-2">Exam Completed!</h1>
              <p className="text-gray-600">Here are your results</p>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-indigo-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Score</p>
                <p className="text-3xl font-bold text-indigo-600">{results.score}%</p>
              </div>
              <div className="bg-green-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Correct</p>
                <p className="text-3xl font-bold text-green-600">{results.correctCount}/{results.totalQuestions}</p>
              </div>
              <div className="bg-purple-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Points Earned</p>
                <p className="text-3xl font-bold text-purple-600">+{results.pointsEarned}</p>
              </div>
              <div className="bg-amber-50 rounded-xl p-4 text-center">
                <p className="text-sm text-gray-600 mb-1">Level</p>
                <p className="text-3xl font-bold text-amber-600">{results.level}</p>
              </div>
            </div>

            {results.leveledUp && (
              <div className="bg-gradient-to-r from-purple-500 to-indigo-600 text-white rounded-xl p-6 mb-6 text-center">
                <TrendingUp className="w-12 h-12 mx-auto mb-2" />
                <h3 className="text-2xl font-bold mb-1">Level Up!</h3>
                <p>Congratulations! You've reached Level {results.level}</p>
              </div>
            )}

            <div className="bg-gray-50 rounded-xl p-6 mb-6">
              <div className="flex justify-between items-center mb-2">
                <span className="text-gray-600">Total Points</span>
                <span className="text-2xl font-bold text-indigo-600">{results.totalPoints}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Overall Accuracy</span>
                <span className="text-xl font-semibold text-gray-800">{results.accuracy}%</span>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                onClick={() => setShowReview(true)}
                className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Review Answers
              </button>
              <button
                onClick={() => navigate('/questions')}
                className="flex-1 bg-gray-200 text-gray-800 py-3 rounded-xl font-semibold hover:bg-gray-300 transition"
              >
                Back to Questions
              </button>
            </div>
          </div>
        </div>

        {showReview && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-800">Answer Review</h2>
                <button
                  onClick={() => setShowReview(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-6">
                {questions.map((q, index) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  
                  return (
                    <div key={q.id} className={`border-2 rounded-xl p-6 ${
                      isCorrect ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                    }`}>
                      <div className="flex items-start gap-3 mb-4">
                        {isCorrect ? (
                          <CheckCircle className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                        ) : (
                          <XCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-1" />
                        )}
                        <div className="flex-1">
                          <p className="font-semibold text-gray-800 mb-3">
                            Q{index + 1}: {q.question}
                          </p>
                          
                          <div className="space-y-2 mb-3">
                            {q.options.map(opt => (
                              <div
                                key={opt.id}
                                className={`p-3 rounded-lg ${
                                  opt.id === q.correctAnswer
                                    ? 'bg-green-100 border-2 border-green-500'
                                    : opt.id === userAnswer && !isCorrect
                                    ? 'bg-red-100 border-2 border-red-500'
                                    : 'bg-white border border-gray-200'
                                }`}
                              >
                                <span className="font-semibold">{opt.id})</span> {opt.text}
                                {opt.id === q.correctAnswer && (
                                  <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                                )}
                                {opt.id === userAnswer && !isCorrect && (
                                  <span className="ml-2 text-red-600 font-semibold">✗ Your answer</span>
                                )}
                              </div>
                            ))}
                          </div>
                          
                          <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                            <p className="text-sm text-gray-700">
                              <span className="font-semibold">Explanation:</span> {q.explanation}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button
                onClick={() => setShowReview(false)}
                className="w-full mt-6 bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Close Review
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">{subjectName || subject} MCQ Exam</h1>
              <p className="text-gray-600">Question {currentQuestion + 1} of {questions.length}</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 bg-indigo-50 px-4 py-2 rounded-lg">
                <Clock className="w-5 h-5 text-indigo-600" />
                <span className="font-semibold text-indigo-600">{formatTime(timeElapsed)}</span>
              </div>
              <button
                onClick={isFullscreen ? exitFullscreen : enterFullscreen}
                className="p-2 hover:bg-gray-100 rounded-lg transition"
              >
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Question Card */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-6">
          <h2 className="text-xl font-semibold text-gray-800 mb-6">
            {currentQ.question}
          </h2>

          <div className="space-y-3">
            {currentQ.options.map(option => (
              <button
                key={option.id}
                onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                  selectedAnswers[currentQ.id] === option.id
                    ? 'border-indigo-600 bg-indigo-50'
                    : 'border-gray-200 hover:border-indigo-300 hover:bg-gray-50'
                }`}
              >
                <span className="font-semibold text-indigo-600">{option.id})</span>{' '}
                <span className="text-gray-800">{option.text}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-xl font-semibold hover:bg-gray-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Previous
            </button>

            <div className="flex gap-2">
              {questions.map((_, index) => (
                <button
                  key={index}
                  onClick={() => setCurrentQuestion(index)}
                  className={`w-10 h-10 rounded-lg font-semibold transition ${
                    index === currentQuestion
                      ? 'bg-indigo-600 text-white'
                      : selectedAnswers[questions[index].id]
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {index + 1}
                </button>
              ))}
            </div>

            {currentQuestion === questions.length - 1 ? (
              <button
                onClick={handleSubmit}
                className="px-6 py-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition"
              >
                Submit Exam
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-semibold hover:bg-indigo-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MCQExam;
