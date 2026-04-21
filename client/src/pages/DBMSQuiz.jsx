import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { practicalAPI } from '../services/api';
import { useAuth } from '../hooks/useAuth';
import { Database, Play, RefreshCw, CheckCircle, XCircle, Terminal, Table, Lightbulb, ChevronRight, Loader, BookOpen, Zap, AlertCircle } from 'lucide-react';

const getIsDark = () => document.documentElement.classList.contains('dark');

function CyberLabel({ children }) {
  return (
    <span style={{ fontSize: 10, fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#22d3ee' }}>
      {children}
    </span>
  );
}

function DataTable({ columns, rows, dark }) {
  if (!columns || columns.length === 0) return null;
  var bg  = dark ? '#0d1117' : '#f8fafc';
  var hdr = dark ? '#111827' : '#f1f5f9';
  var bdr = dark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.2)';
  var txt = dark ? '#e2e8f0' : '#1e293b';
  var sub = dark ? '#64748b' : '#94a3b8';
  var alt = dark ? 'rgba(6,182,212,0.04)' : 'rgba(6,182,212,0.03)';
  return (
    <div style={{ borderRadius: 8, border: '1px solid ' + bdr, overflow: 'hidden', fontSize: 12 }}>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: hdr }}>
              {columns.map(function(col, i) {
                return (
                  <th key={i} style={{ padding: '8px 14px', textAlign: 'left', color: '#22d3ee', fontFamily: 'monospace', fontSize: 11, fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', borderBottom: '1px solid ' + bdr, whiteSpace: 'nowrap' }}>
                    {col}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} style={{ padding: '16px 14px', textAlign: 'center', color: sub, fontStyle: 'italic', fontSize: 12 }}>
                  No rows returned
                </td>
              </tr>
            ) : rows.map(function(row, ri) {
              return (
                <tr key={ri} style={{ background: ri % 2 === 0 ? bg : alt }}>
                  {row.map(function(cell, ci) {
                    return (
                      <td key={ci} style={{ padding: '7px 14px', color: txt, fontFamily: 'monospace', fontSize: 12, borderBottom: '1px solid ' + bdr, whiteSpace: 'nowrap' }}>
                        {cell === null ? <span style={{ color: sub, fontStyle: 'italic' }}>NULL</span> : String(cell)}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div style={{ padding: '5px 14px', background: hdr, borderTop: '1px solid ' + bdr, color: sub, fontSize: 10, fontFamily: 'monospace' }}>
        {rows.length} row{rows.length !== 1 ? 's' : ''}
      </div>
    </div>
  );
}

function StepBadge({ n, label, active, done, dark }) {
  var color    = done ? '#10b981' : active ? '#22d3ee' : (dark ? '#334155' : '#cbd5e1');
  var txtColor = done || active ? '#fff' : (dark ? '#475569' : '#94a3b8');
  var lblColor = active ? '#22d3ee' : (dark ? '#64748b' : '#94a3b8');
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
      <div style={{ width: 24, height: 24, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: txtColor, flexShrink: 0 }}>
        {done ? '✓' : n}
      </div>
      <span style={{ fontSize: 12, fontWeight: 600, color: lblColor }}>{label}</span>
    </div>
  );
}

export default function DBMSQuiz() {
  var authCtx = useAuth();
  var updateUser = authCtx.updateUser;

  var darkState = useState(getIsDark);
  var dark = darkState[0];
  var setDark = darkState[1];

  var qState = useState('');
  var question = qState[0]; var setQuestion = qState[1];

  var sqlState = useState('');
  var setupSQL = sqlState[0]; var setSetupSQL = sqlState[1];

  var uqState = useState('');
  var userQuery = uqState[0]; var setUserQuery = uqState[1];

  var sidState = useState('');
  var sessionId = sidState[0]; var setSessionId = sidState[1];

  var tblState = useState(null);
  var setupTable = tblState[0]; var setSetupTable = tblState[1];

  var qrState = useState(null);
  var queryResult = qrState[0]; var setQueryResult = qrState[1];

  var orState = useState([]);
  var outputRows = orState[0]; var setOutputRows = orState[1];

  var evalState = useState(null);
  var evaluation = evalState[0]; var setEvaluation = evalState[1];

  var loadState = useState(false);
  var loading = loadState[0]; var setLoading = loadState[1];

  var sdState = useState(false);
  var setupDone = sdState[0]; var setSetupDone = sdState[1];

  var toastState = useState(null);
  var toast = toastState[0]; var setToast = toastState[1];

  useEffect(function() {
    var obs = new MutationObserver(function() { setDark(getIsDark()); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    return function() { obs.disconnect(); };
  }, []);

  function showToast(msg, type) {
    setToast({ msg: msg, type: type });
    setTimeout(function() { setToast(null); }, 3500);
  }

  var step = !question ? 0 : !setupDone ? 1 : !queryResult ? 2 : !evaluation ? 3 : 4;

  var bg       = dark ? '#0a0e1a'  : '#f0f9ff';
  var panel    = dark ? '#0d1117'  : '#ffffff';
  var card     = dark ? '#111827'  : '#ffffff';
  var bdr      = dark ? 'rgba(6,182,212,0.12)' : 'rgba(6,182,212,0.25)';
  var txt      = dark ? '#f1f5f9'  : '#0f172a';
  var sub      = dark ? '#64748b'  : '#94a3b8';
  var inputBg  = dark ? '#0d1117'  : '#f8fafc';
  var inputBdr = dark ? 'rgba(100,116,139,0.3)' : '#e2e8f0';

  async function handleGenerate() {
    setLoading(true);
    setQuestion(''); setSetupSQL(''); setUserQuery(''); setSessionId('');
    setSetupTable(null); setQueryResult(null); setEvaluation(null); setSetupDone(false); setOutputRows([]);
    try {
      var res = await axios.get('/api/sql/generate-question');
      // Node wraps Flask response: res.data = { status, data: { status, data: { question, setup_sql } } }
      var payload = res.data.data && res.data.data.data ? res.data.data.data : res.data.data;
      setQuestion(payload.question);
      setSetupSQL(payload.setup_sql);
    } catch(e) {
      showToast('Failed to generate: ' + (e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message), 'error');
    } finally { setLoading(false); }
  }

  async function handleSetup() {
    try {
      var res = await axios.post('/api/sql/run-setup', { setup_sql: setupSQL, session_id: sessionId || undefined });
      // res.data = { status, session_id }
      var sid = res.data.session_id;
      setSessionId(sid);
      var tbl = await axios.post('/api/sql/get-table', { session_id: sid });
      // tbl.data = { status, data: { status, data: { columns, rows } } }
      var tblPayload = tbl.data.data && tbl.data.data.data ? tbl.data.data.data : tbl.data.data;
      if (tblPayload && tblPayload.columns) setSetupTable(tblPayload);
      setSetupDone(true);
      showToast('Database initialized', 'success');
    } catch(e) {
      showToast('Setup failed: ' + (e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message), 'error');
    }
  }

  async function handleRunQuery() {
    try {
      var res = await axios.post('/api/sql/run-query', { session_id: sessionId, user_query: userQuery });
      // res.data = { status, columns, rows }
      setQueryResult(res.data);
      setOutputRows(res.data.rows || []);
      setEvaluation(null);
    } catch(e) {
      showToast('Query error: ' + (e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message), 'error');
    }
  }

  async function handleEvaluate() {
    try {
      var res = await axios.post('/api/sql/evaluate', { question: question, setup_sql: setupSQL, user_query: userQuery, user_output: outputRows });
      // res.data = { status, evaluation: { status, evaluation: { is_correct, score, feedback, suggested_query } } }
      var raw = res.data.evaluation;
      var evalData = raw && raw.evaluation ? raw.evaluation : raw;
      setEvaluation(evalData);
      var score = Number(evalData && evalData.score != null ? evalData.score : 0);
      try {
        var sub2 = await practicalAPI.submit({ subject: 'dbms', task: question || 'DBMS Practical', performanceScore: Math.max(0, Math.min(5, Math.round(score))), meta: { suggested_query: evalData && evalData.suggested_query ? evalData.suggested_query : null } });
        var prev = JSON.parse(sessionStorage.getItem('user') || '{}');
        var updated = Object.assign({}, prev, { progress: sub2.data.data.progress, moduleProgress: sub2.data.data.moduleProgress, streak: sub2.data.data.streak });
        sessionStorage.setItem('user', JSON.stringify(updated));
        updateUser(updated);
      } catch(err) {
        // Non-fatal — user may not be logged in or token expired
        console.warn('Practical submit skipped:', err.message);
      }
    } catch(e) {
      showToast('Evaluation failed: ' + (e.response && e.response.data && e.response.data.message ? e.response.data.message : e.message), 'error');
    }
  }

  var btnBase    = { display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '9px 18px', borderRadius: 8, border: 'none', fontSize: 13, fontWeight: 700, cursor: 'pointer', fontFamily: "'Inter','Segoe UI',sans-serif" };
  var primaryBtn = Object.assign({}, btnBase, { background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', color: '#fff', boxShadow: '0 2px 12px rgba(6,182,212,0.3)' });
  var successBtn = Object.assign({}, btnBase, { background: 'linear-gradient(135deg,#10b981,#059669)', color: '#fff' });
  var warnBtn    = Object.assign({}, btnBase, { background: 'linear-gradient(135deg,#f59e0b,#d97706)', color: '#fff' });

  var steps = [['Question', 1], ['Setup DB', 2], ['Write Query', 3], ['Evaluate', 4]];

  return (
    <div style={{ minHeight: '100vh', background: bg, fontFamily: "'Inter','Segoe UI',sans-serif", paddingBottom: 40 }}>

      {toast && (
        <div style={{ position: 'fixed', top: 20, right: 20, zIndex: 9999, padding: '12px 18px', borderRadius: 10, background: toast.type === 'error' ? '#1e1b1b' : '#0d1117', border: '1px solid ' + (toast.type === 'error' ? '#f87171' : '#10b981'), color: toast.type === 'error' ? '#f87171' : '#34d399', fontSize: 13, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8, boxShadow: '0 4px 20px rgba(0,0,0,0.4)', maxWidth: 360 }}>
          {toast.type === 'error' ? React.createElement(AlertCircle, { size: 15 }) : React.createElement(CheckCircle, { size: 15 })}
          {toast.msg}
        </div>
      )}

      <div style={{ background: panel, borderBottom: '1px solid ' + bdr, padding: '0 24px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: 'linear-gradient(135deg,#06b6d4,#3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 12px rgba(6,182,212,0.4)' }}>
            <Database size={15} color="#fff" />
          </div>
          <div>
            <div style={{ color: txt, fontWeight: 700, fontSize: '0.9rem' }}>SQL Lab</div>
            <div style={{ color: sub, fontSize: '0.65rem', fontFamily: 'monospace', textTransform: 'uppercase', letterSpacing: '0.08em' }}>DBMS Practice</div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          {steps.map(function(item, i) {
            return (
              <React.Fragment key={item[1]}>
                <StepBadge n={item[1]} label={item[0]} active={step === i + 1} done={step > i + 1} dark={dark} />
                {i < 3 && <ChevronRight size={12} color={sub} />}
              </React.Fragment>
            );
          })}
        </div>

        <button onClick={handleGenerate} disabled={loading}
          style={Object.assign({}, primaryBtn, { padding: '7px 16px', fontSize: 12, opacity: loading ? 0.7 : 1 })}
          onMouseEnter={function(e) { e.currentTarget.style.opacity = '0.85'; }}
          onMouseLeave={function(e) { e.currentTarget.style.opacity = loading ? '0.7' : '1'; }}>
          {loading ? React.createElement(Loader, { size: 13, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(RefreshCw, { size: 13 })}
          {loading ? 'Generating...' : 'New Question'}
        </button>
      </div>

      {!question ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: 'calc(100vh - 56px)', gap: 20, padding: 24 }}>
          <div style={{ width: 72, height: 72, borderRadius: 20, background: 'rgba(6,182,212,0.1)', border: '1px solid rgba(6,182,212,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Database size={32} color="#22d3ee" />
          </div>
          <div style={{ textAlign: 'center' }}>
            <div style={{ color: txt, fontSize: 22, fontWeight: 700, marginBottom: 8 }}>SQL Practice Lab</div>
            <div style={{ color: sub, fontSize: 14, maxWidth: 380, lineHeight: 1.6 }}>Generate an AI-powered SQL question, set up the database, write your query, and get instant feedback.</div>
          </div>
          <button onClick={handleGenerate} disabled={loading}
            style={Object.assign({}, primaryBtn, { padding: '12px 32px', fontSize: 14 })}
            onMouseEnter={function(e) { e.currentTarget.style.opacity = '0.85'; }}
            onMouseLeave={function(e) { e.currentTarget.style.opacity = '1'; }}>
            {loading ? React.createElement(Loader, { size: 15, style: { animation: 'spin 1s linear infinite' } }) : React.createElement(Zap, { size: 15 })}
            {loading ? 'Generating...' : 'Generate Question'}
          </button>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: '340px 1fr', height: 'calc(100vh - 56px)', overflow: 'hidden' }}>

          <div style={{ background: panel, borderRight: '1px solid ' + bdr, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

            <div style={{ padding: '16px 18px', borderBottom: '1px solid ' + bdr, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                <BookOpen size={14} color="#22d3ee" />
                <CyberLabel>Question</CyberLabel>
              </div>
              <div style={{ background: dark ? 'rgba(6,182,212,0.05)' : 'rgba(6,182,212,0.04)', border: '1px solid ' + bdr, borderRadius: 8, padding: '12px 14px' }}>
                <p style={{ color: txt, fontSize: 13, lineHeight: 1.7, margin: 0 }}>{question}</p>
              </div>
            </div>

            <div style={{ padding: '14px 18px', borderBottom: '1px solid ' + bdr, flexShrink: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Terminal size={13} color="#22d3ee" />
                  <CyberLabel>Schema SQL</CyberLabel>
                </div>
                <button onClick={handleSetup}
                  style={Object.assign({}, successBtn, { padding: '5px 12px', fontSize: 11 })}
                  onMouseEnter={function(e) { e.currentTarget.style.opacity = '0.85'; }}
                  onMouseLeave={function(e) { e.currentTarget.style.opacity = '1'; }}>
                  <Play size={11} /> Init DB
                </button>
              </div>
              <pre style={{ background: inputBg, border: '1px solid ' + inputBdr, borderRadius: 7, padding: '10px 12px', fontSize: 11, fontFamily: 'monospace', color: dark ? '#94a3b8' : '#475569', overflowX: 'auto', margin: 0, lineHeight: 1.6, maxHeight: 140, overflowY: 'auto' }}>
                {setupSQL}
              </pre>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px' }}>
              {setupTable ? (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Table size={13} color="#10b981" />
                    <CyberLabel>Table Preview</CyberLabel>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: '#10b981', fontFamily: 'monospace' }}>READY</span>
                  </div>
                  <DataTable columns={setupTable.columns} rows={setupTable.rows} dark={dark} />
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: 10, color: sub }}>
                  <Table size={28} color={dark ? '#1e293b' : '#e2e8f0'} />
                  <span style={{ fontSize: 12 }}>Click Init DB to load the schema</span>
                </div>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', background: bg }}>

            <div style={{ padding: '14px 18px', borderBottom: '1px solid ' + bdr, flexShrink: 0, background: panel }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Terminal size={13} color="#22d3ee" />
                  <CyberLabel>SQL Editor</CyberLabel>
                  {sessionId && (
                    <span style={{ fontSize: 10, color: '#10b981', fontFamily: 'monospace', background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.2)', borderRadius: 4, padding: '1px 6px' }}>
                      SESSION ACTIVE
                    </span>
                  )}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={handleRunQuery} disabled={!setupDone || !userQuery.trim()}
                    style={Object.assign({}, primaryBtn, { padding: '6px 14px', fontSize: 12, opacity: (!setupDone || !userQuery.trim()) ? 0.4 : 1, cursor: (!setupDone || !userQuery.trim()) ? 'not-allowed' : 'pointer' })}
                    onMouseEnter={function(e) { if (setupDone && userQuery.trim()) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={function(e) { e.currentTarget.style.opacity = (!setupDone || !userQuery.trim()) ? '0.4' : '1'; }}>
                    <Play size={12} /> Run
                  </button>
                  <button onClick={handleEvaluate} disabled={!queryResult}
                    style={Object.assign({}, warnBtn, { padding: '6px 14px', fontSize: 12, opacity: !queryResult ? 0.4 : 1, cursor: !queryResult ? 'not-allowed' : 'pointer' })}
                    onMouseEnter={function(e) { if (queryResult) e.currentTarget.style.opacity = '0.85'; }}
                    onMouseLeave={function(e) { e.currentTarget.style.opacity = !queryResult ? '0.4' : '1'; }}>
                    <Zap size={12} /> Evaluate
                  </button>
                </div>
              </div>
              <textarea
                value={userQuery}
                onChange={function(e) { setUserQuery(e.target.value); }}
                placeholder="-- Write your SQL query here"
                style={{ width: '100%', height: 130, background: inputBg, border: '1px solid ' + inputBdr, borderRadius: 8, padding: '10px 14px', fontSize: 13, fontFamily: 'monospace', color: txt, resize: 'none', outline: 'none', boxSizing: 'border-box', lineHeight: 1.6 }}
                onFocus={function(e) { e.target.style.borderColor = 'rgba(6,182,212,0.5)'; }}
                onBlur={function(e) { e.target.style.borderColor = inputBdr; }}
              />
            </div>

            <div style={{ flex: 1, overflowY: 'auto', padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 16 }}>

              {queryResult && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
                    <Table size={13} color="#22d3ee" />
                    <CyberLabel>Query Output</CyberLabel>
                    <span style={{ marginLeft: 'auto', fontSize: 10, color: sub, fontFamily: 'monospace' }}>{outputRows.length} row{outputRows.length !== 1 ? 's' : ''}</span>
                  </div>
                  {queryResult.columns && queryResult.columns.length > 0
                    ? <DataTable columns={queryResult.columns} rows={queryResult.rows} dark={dark} />
                    : <div style={{ background: dark ? 'rgba(245,158,11,0.06)' : 'rgba(245,158,11,0.05)', border: '1px solid rgba(245,158,11,0.2)', borderRadius: 8, padding: '12px 14px', color: '#f59e0b', fontSize: 13 }}>Non-SELECT query or no rows returned.</div>
                  }
                </div>
              )}

              {evaluation && (
                <div style={{ background: card, border: '1px solid ' + bdr, borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid ' + bdr, display: 'flex', alignItems: 'center', gap: 10, background: evaluation.is_correct ? 'rgba(16,185,129,0.06)' : 'rgba(239,68,68,0.06)' }}>
                    {evaluation.is_correct ? <CheckCircle size={18} color="#10b981" /> : <XCircle size={18} color="#ef4444" />}
                    <span style={{ fontWeight: 700, fontSize: 14, color: evaluation.is_correct ? '#10b981' : '#ef4444' }}>
                      {evaluation.is_correct ? 'Correct Answer' : 'Incorrect Answer'}
                    </span>
                    <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6 }}>
                      <span style={{ fontSize: 11, color: sub, fontFamily: 'monospace' }}>SCORE</span>
                      <div style={{ display: 'flex', gap: 3 }}>
                        {[1,2,3,4,5].map(function(n) {
                          return (
                            <div key={n} style={{ width: 18, height: 18, borderRadius: 4, background: n <= evaluation.score ? 'linear-gradient(135deg,#06b6d4,#3b82f6)' : (dark ? '#1e293b' : '#e2e8f0'), border: '1px solid ' + (n <= evaluation.score ? 'rgba(6,182,212,0.4)' : inputBdr), fontSize: 9, fontWeight: 800, color: n <= evaluation.score ? '#fff' : sub, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'monospace' }}>
                              {n}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                  <div style={{ padding: '14px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                        <Lightbulb size={12} color="#f59e0b" />
                        <CyberLabel>Feedback</CyberLabel>
                      </div>
                      <p style={{ color: txt, fontSize: 13, lineHeight: 1.7, margin: 0, background: dark ? 'rgba(255,255,255,0.02)' : 'rgba(0,0,0,0.02)', borderRadius: 7, padding: '10px 12px', border: '1px solid ' + bdr }}>
                        {evaluation.feedback}
                      </p>
                    </div>
                    {evaluation.suggested_query && (
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                          <Terminal size={12} color="#22d3ee" />
                          <CyberLabel>Suggested Query</CyberLabel>
                        </div>
                        <pre style={{ background: dark ? '#060d1a' : '#0f172a', border: '1px solid rgba(6,182,212,0.2)', borderRadius: 8, padding: '12px 14px', fontSize: 12, fontFamily: 'monospace', color: '#4ade80', overflowX: 'auto', margin: 0, lineHeight: 1.6 }}>
                          {evaluation.suggested_query}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {!queryResult && !evaluation && (
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 10, color: sub, minHeight: 200 }}>
                  <Terminal size={32} color={dark ? '#1e293b' : '#e2e8f0'} />
                  <span style={{ fontSize: 13 }}>
                    {!setupDone ? 'Initialize the database first, then write your query.' : 'Write a query and click Run to see results.'}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </div>
  );
}
