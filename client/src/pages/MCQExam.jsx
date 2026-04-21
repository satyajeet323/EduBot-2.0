import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Clock, CheckCircle, XCircle, Award, TrendingUp, ChevronLeft, ChevronRight, BookOpen, Zap, X, Maximize, Minimize } from 'lucide-react';
import axios from 'axios';

const getIsDark = () => document.documentElement.classList.contains('dark');

function CyberLabel({ children, color }) {
  return (
    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: color || '#22d3ee' }}>
      {children}
    </span>
  );
}

export default function MCQExam() {
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
  const [dark, setDark] = useState(getIsDark);

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(getIsDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (!subject) { navigate('/questions'); return; }
    generateQuestions();
    enterFullscreen();
    const timer = setInterval(() => setTimeElapsed(p => p + 1), 1000);
    return () => clearInterval(timer);
  }, []);

  const generateQuestions = async () => {
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) { alert('Authentication required. Please login again.'); navigate('/login'); return; }
      const response = await axios.post('http://localhost:5000/api/mcq/generate',
        { subject: subjectName || subject, difficulty: 'intermediate' },
        { headers: { Authorization: 'Bearer ' + token }, timeout: 30000 }
      );
      if (response.data.status === 'success') setQuestions(response.data.data.questions);
    } catch (error) {
      let msg = 'Failed to generate questions. ';
      if (error.response?.status === 401) { msg = 'Session expired. Please login again.'; setTimeout(() => navigate('/login'), 2000); }
      else if (error.response?.data?.message) msg += error.response.data.message;
      else msg += error.message;
      alert(msg); navigate('/questions');
    } finally { setLoading(false); }
  };

  const enterFullscreen = () => {
    const e = document.documentElement;
    if (e.requestFullscreen) e.requestFullscreen();
    else if (e.webkitRequestFullscreen) e.webkitRequestFullscreen();
    setIsFullscreen(true);
  };

  const exitFullscreen = () => {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
    setIsFullscreen(false);
  };

  const handleAnswerSelect = (qId, answer) => setSelectedAnswers(p => ({ ...p, [qId]: answer }));

  const handleSubmit = async () => {
    if (Object.keys(selectedAnswers).length < questions.length) {
      if (!window.confirm('You have unanswered questions. Submit anyway?')) return;
    }
    const answers = questions.map(q => ({
      questionId: q.id, selectedAnswer: selectedAnswers[q.id] || null,
      correctAnswer: q.correctAnswer, isCorrect: selectedAnswers[q.id] === q.correctAnswer
    }));
    try {
      const token = sessionStorage.getItem('token') || localStorage.getItem('token');
      if (!token) { alert('Authentication required.'); navigate('/login'); return; }
      const response = await axios.post('http://localhost:5000/api/mcq/submit',
        { subject: subjectName || subject, answers, totalQuestions: questions.length, timeTaken: timeElapsed },
        { headers: { Authorization: 'Bearer ' + token } }
      );
      if (response.data.status === 'success') {
        setResults(response.data.data); setExamFinished(true); exitFullscreen();
      }
    } catch (error) {
      if (error.response?.status === 401) { alert('Session expired.'); navigate('/login'); }
      else alert('Failed to submit exam. Please try again.');
    }
  };

  const formatTime = (s) => Math.floor(s / 60) + ':' + (s % 60).toString().padStart(2, '0');

  const bg    = dark ? '#0a0e1a' : '#f0f9ff';
  const panel = dark ? '#0d1117' : '#ffffff';
  const card  = dark ? '#111827' : '#ffffff';
  const bdr   = dark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.25)';
  const txt   = dark ? '#f1f5f9' : '#0f172a';
  const sub   = dark ? '#64748b' : '#94a3b8';
  const inputBdr = dark ? 'rgba(100,116,139,0.3)' : '#e2e8f0';

  const btnBase = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 20px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter','Segoe UI',sans-serif", transition: 'opacity 0.2s' };
  const primaryBtn = Object.assign({}, btnBase, { background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: '#fff', boxShadow: '0 2px 12px rgba(6,182,212,0.3)' });
  const ghostBtn   = Object.assign({}, btnBase, { background: 'transparent', color: sub, border: '1px solid ' + inputBdr });
  const successBtn = Object.assign({}, btnBase, { background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff', boxShadow: '0 2px 12px rgba(16,185,129,0.3)' });

  // ── Loading ──
  if (loading) return (
    <div style={{ minHeight: '100vh', background: bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      <div style={{ width: 48, height: 48, border: '3px solid rgba(6,182,212,0.15)', borderTop: '3px solid #22d3ee', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <div style={{ color: sub, fontSize: 14, fontFamily: 'monospace' }}>Generating exam questions...</div>
      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );

  // ── Results screen ──
  if (examFinished && results) {
    const passed = results.score >= 70;
    return (
      <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter','Segoe UI',sans-serif", padding: '32px 20px' }}>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Result header */}
          <div style={{ background: panel, border: '1px solid ' + bdr, borderRadius: 16, padding: '32px 28px', textAlign: 'center' }}>
            <div style={{ width: 72, height: 72, borderRadius: '50%', background: passed ? 'rgba(16,185,129,0.12)' : 'rgba(245,158,11,0.12)', border: '2px solid ' + (passed ? 'rgba(16,185,129,0.3)' : 'rgba(245,158,11,0.3)'), display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <Award size={32} color={passed ? '#10b981' : '#f59e0b'} />
            </div>
            <div style={{ color: txt, fontSize: 24, fontWeight: 800, marginBottom: 6 }}>Exam Complete</div>
            <div style={{ color: sub, fontSize: 14 }}>{subjectName || subject} · {formatTime(timeElapsed)} taken</div>
          </div>

          {/* Stats grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 12 }}>
            {[
              { label: 'Score', value: results.score + '%', color: '#22d3ee' },
              { label: 'Correct', value: results.correctCount + '/' + results.totalQuestions, color: '#10b981' },
              { label: 'Points Earned', value: '+' + results.pointsEarned, color: '#a78bfa' },
              { label: 'Level', value: results.level, color: '#f59e0b' },
            ].map(function(s) {
              return (
                <div key={s.label} style={{ background: panel, border: '1px solid ' + bdr, borderRadius: 12, padding: '16px 12px', textAlign: 'center' }}>
                  <div style={{ color: sub, fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{s.label}</div>
                  <div style={{ color: s.color, fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>{s.value}</div>
                </div>
              );
            })}
          </div>

          {/* Level up banner */}
          {results.leveledUp && (
            <div style={{ background: 'linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))', border: '1px solid rgba(139,92,246,0.3)', borderRadius: 12, padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <TrendingUp size={28} color="#a78bfa" />
              <div>
                <div style={{ color: '#a78bfa', fontWeight: 800, fontSize: 16, marginBottom: 2 }}>Level Up!</div>
                <div style={{ color: sub, fontSize: 13 }}>You reached Level {results.level}</div>
              </div>
              <div style={{ marginLeft: 'auto', background: 'linear-gradient(135deg,#8b5cf6,#06b6d4)', borderRadius: 10, padding: '8px 20px', fontSize: 20, fontWeight: 900, color: '#fff', fontFamily: 'monospace' }}>
                Lv {results.level}
              </div>
            </div>
          )}

          {/* Total points */}
          <div style={{ background: panel, border: '1px solid ' + bdr, borderRadius: 12, padding: '16px 22px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ color: sub, fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Total Points</div>
              <div style={{ color: '#22d3ee', fontSize: 26, fontWeight: 900, fontFamily: 'monospace' }}>{results.totalPoints}</div>
            </div>
            <div>
              <div style={{ color: sub, fontSize: 11, fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 4 }}>Accuracy</div>
              <div style={{ color: txt, fontSize: 22, fontWeight: 800, fontFamily: 'monospace' }}>{results.accuracy}%</div>
            </div>
          </div>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 12 }}>
            <button onClick={() => setShowReview(true)} style={Object.assign({}, primaryBtn, { flex: 1, padding: '12px 20px', fontSize: 14 })}
              onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
              onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
              <BookOpen size={15} /> Review Answers
            </button>
            <button onClick={() => navigate('/questions')} style={Object.assign({}, ghostBtn, { flex: 1, padding: '12px 20px', fontSize: 14 })}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = inputBdr; e.currentTarget.style.color = sub; }}>
              Back to Questions
            </button>
          </div>
        </div>

        {/* ── Review Modal ── */}
        {showReview && (
          <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: 20, backdropFilter: 'blur(6px)' }}
            onClick={() => setShowReview(false)}>
            <div style={{ background: dark ? '#111827' : '#fff', border: '1px solid ' + bdr, borderRadius: 16, width: 'min(720px,95vw)', maxHeight: '88vh', overflowY: 'auto', display: 'flex', flexDirection: 'column' }}
              onClick={e => e.stopPropagation()}>

              {/* Modal header */}
              <div style={{ padding: '18px 22px', borderBottom: '1px solid ' + bdr, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, background: dark ? '#111827' : '#fff', zIndex: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <BookOpen size={16} color="#22d3ee" />
                  <span style={{ color: txt, fontWeight: 700, fontSize: 15 }}>Answer Review</span>
                  <span style={{ fontSize: 11, color: sub, fontFamily: 'monospace' }}>{questions.length} questions</span>
                </div>
                <button onClick={() => setShowReview(false)} style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: sub, padding: 4, borderRadius: 6, display: 'flex' }}
                  onMouseEnter={e => { e.currentTarget.style.color = '#f87171'; }}
                  onMouseLeave={e => { e.currentTarget.style.color = sub; }}>
                  <X size={18} />
                </button>
              </div>

              {/* Questions */}
              <div style={{ padding: '16px 22px', display: 'flex', flexDirection: 'column', gap: 16 }}>
                {questions.map((q, index) => {
                  const userAnswer = selectedAnswers[q.id];
                  const isCorrect = userAnswer === q.correctAnswer;
                  const accentColor = isCorrect ? '#10b981' : '#ef4444';
                  const accentBg = isCorrect ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)';
                  const accentBdr = isCorrect ? 'rgba(16,185,129,0.2)' : 'rgba(239,68,68,0.2)';
                  return (
                    <div key={q.id} style={{ background: accentBg, border: '1px solid ' + accentBdr, borderRadius: 12, padding: '16px 18px' }}>
                      {/* Q header */}
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, marginBottom: 14 }}>
                        {isCorrect ? <CheckCircle size={18} color="#10b981" style={{ flexShrink: 0, marginTop: 2 }} /> : <XCircle size={18} color="#ef4444" style={{ flexShrink: 0, marginTop: 2 }} />}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, color: accentColor, background: accentBg, border: '1px solid ' + accentBdr, borderRadius: 4, padding: '1px 7px' }}>Q{index + 1}</span>
                            <span style={{ fontSize: 10, fontFamily: 'monospace', color: accentColor }}>{isCorrect ? 'CORRECT' : 'INCORRECT'}</span>
                          </div>
                          <p style={{ color: txt, fontSize: 14, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{q.question}</p>
                        </div>
                      </div>

                      {/* Options */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
                        {q.options.map(opt => {
                          const isCorrectOpt = opt.id === q.correctAnswer;
                          const isUserWrong  = opt.id === userAnswer && !isCorrect;
                          let optBg  = dark ? 'rgba(255,255,255,0.03)' : '#f8fafc';
                          let optBdr = dark ? 'rgba(100,116,139,0.2)' : '#e2e8f0';
                          let optTxt = dark ? '#94a3b8' : '#64748b';
                          if (isCorrectOpt) { optBg = 'rgba(16,185,129,0.1)'; optBdr = 'rgba(16,185,129,0.4)'; optTxt = '#10b981'; }
                          if (isUserWrong)  { optBg = 'rgba(239,68,68,0.08)'; optBdr = 'rgba(239,68,68,0.35)'; optTxt = '#ef4444'; }
                          return (
                            <div key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '9px 14px', borderRadius: 8, background: optBg, border: '1px solid ' + optBdr }}>
                              <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 800, color: optTxt, flexShrink: 0 }}>{opt.id}</span>
                              <span style={{ color: optTxt, fontSize: 13, flex: 1 }}>{opt.text}</span>
                              {isCorrectOpt && <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#10b981', fontWeight: 700 }}>CORRECT</span>}
                              {isUserWrong  && <span style={{ fontSize: 10, fontFamily: 'monospace', color: '#ef4444', fontWeight: 700 }}>YOUR ANSWER</span>}
                            </div>
                          );
                        })}
                      </div>

                      {/* Explanation */}
                      <div style={{ background: dark ? 'rgba(6,182,212,0.05)' : 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 8, padding: '10px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 5 }}>
                          <Zap size={11} color="#22d3ee" />
                          <CyberLabel>Explanation</CyberLabel>
                        </div>
                        <p style={{ color: dark ? '#94a3b8' : '#475569', fontSize: 13, lineHeight: 1.7, margin: 0 }}>{q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ padding: '16px 22px', borderTop: '1px solid ' + bdr, position: 'sticky', bottom: 0, background: dark ? '#111827' : '#fff' }}>
                <button onClick={() => setShowReview(false)} style={Object.assign({}, primaryBtn, { width: '100%', padding: '12px 20px', fontSize: 14 })}
                  onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                  Close Review
                </button>
              </div>
            </div>
          </div>
        )}
        <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
      </div>
    );
  }

  // ── Exam screen ──
  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const answered = Object.keys(selectedAnswers).length;

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter','Segoe UI',sans-serif", display: 'flex', flexDirection: 'column' }}>

      {/* Top bar */}
      <div style={{ background: panel, borderBottom: '1px solid ' + bdr, padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40, flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 7, background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <BookOpen size={13} color="#fff" />
          </div>
          <div>
            <div style={{ color: txt, fontWeight: 700, fontSize: '0.85rem' }}>{subjectName || subject}</div>
            <div style={{ color: sub, fontSize: '0.6rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>MCQ Exam</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '5px 12px', borderRadius: 8, background: dark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.06)', border: '1px solid rgba(6,182,212,0.2)' }}>
            <Clock size={13} color="#22d3ee" />
            <span style={{ color: '#22d3ee', fontFamily: 'monospace', fontWeight: 700, fontSize: 13 }}>{formatTime(timeElapsed)}</span>
          </div>
          <div style={{ color: sub, fontSize: 12, fontFamily: 'monospace' }}>{answered}/{questions.length} answered</div>
          <button onClick={isFullscreen ? exitFullscreen : enterFullscreen}
            style={{ background: 'transparent', border: '1px solid ' + inputBdr, borderRadius: 7, padding: '5px 8px', cursor: 'pointer', color: sub, display: 'flex', alignItems: 'center' }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee'; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = inputBdr; e.currentTarget.style.color = sub; }}>
            {isFullscreen ? <Minimize size={14} /> : <Maximize size={14} />}
          </button>
        </div>
      </div>

      {/* Progress bar */}
      <div style={{ height: 3, background: dark ? 'rgba(255,255,255,0.05)' : '#e2e8f0', flexShrink: 0 }}>
        <div style={{ height: '100%', background: 'linear-gradient(90deg,#06b6d4,#3b82f6)', width: progress + '%', transition: 'width 0.3s ease' }} />
      </div>

      {/* Main content */}
      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 220px', gap: 0, overflow: 'hidden' }}>

        {/* Question area */}
        <div style={{ overflowY: 'auto', padding: '24px 28px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 11, fontFamily: 'monospace', fontWeight: 700, color: '#22d3ee', background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 6, padding: '2px 10px' }}>
              Q{currentQuestion + 1} / {questions.length}
            </span>
            <span style={{ color: sub, fontSize: 12 }}>Select the best answer</span>
          </div>

          <div style={{ background: panel, border: '1px solid ' + bdr, borderRadius: 14, padding: '22px 24px' }}>
            <p style={{ color: txt, fontSize: 16, fontWeight: 600, lineHeight: 1.7, margin: 0 }}>{currentQ.question}</p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {currentQ.options.map(option => {
              const selected = selectedAnswers[currentQ.id] === option.id;
              return (
                <button key={option.id} onClick={() => handleAnswerSelect(currentQ.id, option.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', borderRadius: 12, border: '2px solid ' + (selected ? '#22d3ee' : (dark ? 'rgba(100,116,139,0.2)' : '#e2e8f0')), background: selected ? (dark ? 'rgba(6,182,212,0.08)' : 'rgba(6,182,212,0.05)') : panel, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', width: '100%' }}
                  onMouseEnter={e => { if (!selected) { e.currentTarget.style.borderColor = 'rgba(6,182,212,0.4)'; e.currentTarget.style.background = dark ? 'rgba(6,182,212,0.04)' : 'rgba(6,182,212,0.02)'; } }}
                  onMouseLeave={e => { if (!selected) { e.currentTarget.style.borderColor = dark ? 'rgba(100,116,139,0.2)' : '#e2e8f0'; e.currentTarget.style.background = panel; } }}>
                  <div style={{ width: 28, height: 28, borderRadius: 8, background: selected ? '#22d3ee' : (dark ? 'rgba(100,116,139,0.1)' : '#f1f5f9'), border: '1px solid ' + (selected ? '#22d3ee' : (dark ? 'rgba(100,116,139,0.2)' : '#e2e8f0')), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: selected ? '#0f172a' : sub, fontFamily: 'monospace', flexShrink: 0 }}>
                    {option.id}
                  </div>
                  <span style={{ color: selected ? (dark ? '#f1f5f9' : '#0f172a') : txt, fontSize: 14, lineHeight: 1.5 }}>{option.text}</span>
                </button>
              );
            })}
          </div>

          {/* Prev / Next */}
          <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 8 }}>
            <button onClick={() => setCurrentQuestion(p => p - 1)} disabled={currentQuestion === 0}
              style={Object.assign({}, ghostBtn, { opacity: currentQuestion === 0 ? 0.3 : 1, cursor: currentQuestion === 0 ? 'not-allowed' : 'pointer' })}
              onMouseEnter={e => { if (currentQuestion > 0) { e.currentTarget.style.borderColor = '#22d3ee'; e.currentTarget.style.color = '#22d3ee'; } }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = inputBdr; e.currentTarget.style.color = sub; }}>
              <ChevronLeft size={15} /> Previous
            </button>

            {currentQuestion === questions.length - 1 ? (
              <button onClick={handleSubmit} style={Object.assign({}, successBtn, { padding: '9px 24px' })}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                Submit Exam <Zap size={14} />
              </button>
            ) : (
              <button onClick={() => setCurrentQuestion(p => p + 1)} style={Object.assign({}, primaryBtn, { padding: '9px 24px' })}
                onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
                onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
                Next <ChevronRight size={15} />
              </button>
            )}
          </div>
        </div>

        {/* Right panel — question navigator */}
        <div style={{ background: panel, borderLeft: '1px solid ' + bdr, padding: '20px 16px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <CyberLabel>Navigator</CyberLabel>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {questions.map((q, i) => {
                const isCurrent  = i === currentQuestion;
                const isAnswered = !!selectedAnswers[q.id];
                let bg2  = dark ? 'rgba(100,116,139,0.1)' : '#f1f5f9';
                let bdr2 = dark ? 'rgba(100,116,139,0.2)' : '#e2e8f0';
                let col2 = sub;
                if (isCurrent)  { bg2 = '#22d3ee'; bdr2 = '#22d3ee'; col2 = '#0f172a'; }
                else if (isAnswered) { bg2 = 'rgba(16,185,129,0.12)'; bdr2 = 'rgba(16,185,129,0.35)'; col2 = '#10b981'; }
                return (
                  <button key={i} onClick={() => setCurrentQuestion(i)}
                    style={{ width: 34, height: 34, borderRadius: 8, background: bg2, border: '1px solid ' + bdr2, color: col2, fontSize: 12, fontWeight: 700, cursor: 'pointer', fontFamily: 'monospace', transition: 'all 0.15s' }}>
                    {i + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div style={{ height: 1, background: bdr }} />

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[['#22d3ee', 'Current'], ['#10b981', 'Answered'], [dark ? 'rgba(100,116,139,0.3)' : '#e2e8f0', 'Unanswered']].map(([c, l]) => (
              <div key={l} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 12, height: 12, borderRadius: 3, background: c, flexShrink: 0 }} />
                <span style={{ color: sub, fontSize: 11 }}>{l}</span>
              </div>
            ))}
          </div>

          <div style={{ height: 1, background: bdr }} />

          <div style={{ background: dark ? 'rgba(6,182,212,0.05)' : 'rgba(6,182,212,0.04)', border: '1px solid rgba(6,182,212,0.15)', borderRadius: 10, padding: '12px 14px' }}>
            <div style={{ color: sub, fontSize: 11, marginBottom: 6 }}>Progress</div>
            <div style={{ height: 4, background: dark ? 'rgba(255,255,255,0.06)' : '#e2e8f0', borderRadius: 99, overflow: 'hidden', marginBottom: 6 }}>
              <div style={{ height: '100%', background: 'linear-gradient(90deg,#06b6d4,#3b82f6)', width: (answered / questions.length * 100) + '%', transition: 'width 0.3s' }} />
            </div>
            <div style={{ color: '#22d3ee', fontSize: 12, fontFamily: 'monospace', fontWeight: 700 }}>{answered}/{questions.length} answered</div>
          </div>

          <button onClick={handleSubmit} style={Object.assign({}, successBtn, { width: '100%', padding: '10px 16px', fontSize: 13, marginTop: 'auto' })}
            onMouseEnter={e => { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = '1'; }}>
            <Zap size={13} /> Submit
          </button>
        </div>
      </div>

      <style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style>
    </div>
  );
}
