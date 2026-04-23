import React, { useState, useRef, useEffect } from "react";
import { Mic, MicOff, Square, RefreshCw, Zap, MessageSquare, BarChart3, AlertCircle, CheckCircle, Volume2 } from "lucide-react";

const getIsDark = () => document.documentElement.classList.contains("dark");

/* ── Score ring ── */
function ScoreRing({ label, value, accent }) {
  var r = 36;
  var circ = 2 * Math.PI * r;
  var pct = Math.min(Math.max(value || 0, 0), 10) / 10;
  var offset = circ - pct * circ;
  var col = accent || "#22d3ee";
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 80 }}>
      <svg width={88} height={88} style={{ display: "block" }}>
        <circle cx={44} cy={44} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={7} fill="none" />
        <circle cx={44} cy={44} r={r} stroke={col} strokeWidth={7} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.7s ease", transform: "rotate(-90deg) scale(1,-1)", transformOrigin: "44px 44px", filter: "drop-shadow(0 0 6px " + col + "66)" }} />
        <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central" fontSize="1rem" fontWeight="800" fill="#f1f5f9">
          {value || 0}
        </text>
      </svg>
      <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.06em", color: "rgba(241,245,249,0.55)", textAlign: "center", lineHeight: 1.3 }}>
        {label}
      </span>
    </div>
  );
}

/* ── Timer ring ── */
function TimerRing({ timeLeft, total }) {
  var r = 70;
  var circ = 2 * Math.PI * r;
  var offset = circ - (timeLeft / total) * circ;
  var urgent = timeLeft <= 10;
  var col = urgent ? "#f87171" : "#22d3ee";
  var mm = Math.floor(timeLeft / 60);
  var ss = (timeLeft % 60).toString().padStart(2, "0");
  return (
    <div style={{ position: "relative", width: 160, height: 160 }}>
      <svg width={160} height={160}>
        <circle cx={80} cy={80} r={r} stroke="rgba(255,255,255,0.06)" strokeWidth={8} fill="none" />
        <circle cx={80} cy={80} r={r} stroke={col} strokeWidth={8} fill="none"
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1s linear", transform: "rotate(-90deg) scale(1,-1)", transformOrigin: "80px 80px", filter: "drop-shadow(0 0 10px " + col + "88)" }} />
      </svg>
      <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%,-50%)", textAlign: "center" }}>
        <div style={{ fontSize: "1.8rem", fontWeight: 900, color: col, fontFamily: "monospace", lineHeight: 1 }}>{mm}:{ss}</div>
        <div style={{ fontSize: 10, color: "rgba(241,245,249,0.4)", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em", marginTop: 4 }}>remaining</div>
      </div>
    </div>
  );
}

/* ── Score section ── */
function ScoreSection({ title, scores, accent }) {
  return (
    <div style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.07)", borderRadius: 14, padding: "18px 20px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <div style={{ width: 3, height: 16, borderRadius: 2, background: accent }} />
        <span style={{ fontSize: 11, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: accent }}>
          {title}
        </span>
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 16, justifyContent: "center" }}>
        {scores.map(function(s) {
          return <ScoreRing key={s.label} label={s.label} value={s.value} accent={accent} />;
        })}
      </div>
    </div>
  );
}

/* ── Main component ── */
const EnglishFluencyRecorder = () => {
  var recordingState    = useState(false);
  var recording         = recordingState[0]; var setRecording = recordingState[1];
  var mrState           = useState(null);
  var mediaRecorder     = mrState[0]; var setMediaRecorder = mrState[1];
  var blobState         = useState(null);
  var audioBlob         = blobState[0]; var setAudioBlob = blobState[1];
  var tlState           = useState(60);
  var timeLeft          = tlState[0]; var setTimeLeft = tlState[1];
  var urlState          = useState(null);
  var audioURL          = urlState[0]; var setAudioURL = urlState[1];
  var loadState         = useState(false);
  var loading           = loadState[0]; var setLoading = loadState[1];
  var sdState           = useState(null);
  var scoreData         = sdState[0]; var setScoreData = sdState[1];
  var pdState           = useState(null);
  var prosodyData       = pdState[0]; var setProsodyData = pdState[1];
  var topicState        = useState("");
  var topic             = topicState[0]; var setTopic = topicState[1];
  var tgState           = useState(false);
  var topicGenerated    = tgState[0]; var setTopicGenerated = tgState[1];
  var wcState           = useState(0);
  var wordCount         = wcState[0]; var setWordCount = wcState[1];
  var fiState           = useState(null);
  var fileId            = fiState[0]; var setFileId = fiState[1];
  var trState           = useState("");
  var transcript        = trState[0]; var setTranscript = trState[1];
  var fdState           = useState(null);
  var fillersData       = fdState[0]; var setFillersData = fdState[1];
  var darkState         = useState(() => getIsDark());
  var dark              = darkState[0]; var setDark = darkState[1];

  var timerRef = useRef(null);
  var chunks   = useRef([]);
  var totalTime = 60;

  useEffect(function() {
    var obs = new MutationObserver(function() { setDark(getIsDark()); });
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return function() { obs.disconnect(); };
  }, []);

  useEffect(function() {
    if (recording && timeLeft > 0) {
      timerRef.current = setTimeout(function() { setTimeLeft(function(p) { return p - 1; }); }, 1000);
    } else if (recording && timeLeft === 0) {
      stopRecording();
    }
    return function() { clearTimeout(timerRef.current); };
  }, [recording, timeLeft]);

  async function fetchTopic() {
    try {
      var res = await fetch("/api/fluency/topic");
      var data = await res.json();
      if (!res.ok || data.error || !data.topic) {
        alert("Could not fetch topic: " + (data.error || "Empty response"));
        return;
      }
      setTopic(data.topic);
      setTopicGenerated(true);
    } catch(err) {
      console.error(err);
      alert("Could not fetch topic.");
    }
  }

  async function getFluencyScore(tr, tp, prosody) {
    try {
      var res = await fetch("/api/fluency/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: tr, topic: tp, prosody: prosody }),
      });
      var data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch(err) {
      console.error(err);
      return null;
    }
  }

  async function startRecording() {
    if (!topicGenerated) return alert("Generate a topic first.");
    setAudioBlob(null); setAudioURL(null); setScoreData(null); setProsodyData(null);
    setFileId(null); setTranscript(""); setFillersData(null);
    setTimeLeft(totalTime); setWordCount(0);
    try {
      var stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      var recorder;
      try { recorder = new MediaRecorder(stream, { mimeType: "audio/webm" }); }
      catch(e) { recorder = new MediaRecorder(stream); }
      chunks.current = [];
      recorder.ondataavailable = function(e) { if (e.data.size > 0) chunks.current.push(e.data); };
      recorder.onstop = function() {
        var blob = new Blob(chunks.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach(function(t) { t.stop(); });
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        handleSubmit(blob);
      };
      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch(err) {
      alert("Microphone not available.");
      console.error(err);
    }
  }

  function stopRecording() {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    setRecording(false);
  }

  async function handleSubmit(blob) {
    var b = blob || audioBlob;
    if (!b) return;
    setLoading(true);
    var formData = new FormData();
    formData.append("audio", b, "fluency-test.webm");
    try {
      var response = await fetch("/api/fluency/upload", { method: "POST", body: formData });
      var data = await response.json();
      if (!response.ok || data.error) { alert("Upload failed: " + (data.error || "Unknown error")); return; }
      setFileId(data.file_id);
      setTranscript(data.transcript || "");
      setProsodyData(data.prosody || {});
      setFillersData(data.fillers || null);
      if (data.transcript) {
        var count = data.transcript.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(count);
      }
      var score = await getFluencyScore(data.transcript || "", topic, data.prosody);
      setScoreData(score && score.score ? score.score : null);
    } catch(err) {
      console.error(err);
      alert("Error processing audio.");
    } finally { setLoading(false); }
  }

  function resetTest() {
    setAudioBlob(null); setAudioURL(null); setScoreData(null); setProsodyData(null);
    setTranscript(""); setFillersData(null); setWordCount(0); setTimeLeft(totalTime);
  }

  var totalScore = scoreData ? Math.round(
    (scoreData.vocabulary_score + scoreData.grammar_score + scoreData.sentence_correctness_score +
     scoreData.coherence_score + scoreData.clarity_score + scoreData.relevance_score +
     scoreData.speech_rate_score + scoreData.pause_time_score + scoreData.pitch_variability_score +
     scoreData.rhythm_variability_score + scoreData.fillers_score) / 11
  ) : null;

  /* ── theme ── */
  var bg    = dark ? "#0a0e1a" : "#f0f9ff";
  var panel = dark ? "#0d1117" : "#ffffff";
  var bdr   = dark ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.25)";
  var txt   = dark ? "#f1f5f9" : "#0f172a";
  var sub   = dark ? "#64748b" : "#94a3b8";

  var btnBase = { display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px 24px", borderRadius: 10, border: "none", fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Inter','Segoe UI',sans-serif", transition: "opacity 0.2s" };

  return (
    <div style={{ minHeight: "calc(100vh - 64px)", background: bg, fontFamily: "'Inter','Segoe UI',sans-serif" }}>

      {/* Header */}
      <div style={{ background: panel, borderBottom: "1px solid " + bdr, padding: "0 24px", height: 56, display: "flex", alignItems: "center", gap: 12, position: "sticky", top: 0, zIndex: 40 }}>
        <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(139,92,246,0.4)" }}>
          <Mic size={15} color="#fff" />
        </div>
        <div>
          <div style={{ color: txt, fontWeight: 700, fontSize: "0.9rem" }}>English Fluency Lab</div>
          <div style={{ color: sub, fontSize: "0.65rem", fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.08em" }}>AI Speech Assessment</div>
        </div>
      </div>

      <div style={{ maxWidth: 900, margin: "0 auto", padding: "32px 20px" }}>

        {/* ── STEP 1: Generate topic ── */}
        {!topicGenerated && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", minHeight: "calc(100vh - 184px)", gap: 24, textAlign: "center" }}>
            <div style={{ width: 80, height: 80, borderRadius: 24, background: "rgba(139,92,246,0.1)", border: "1px solid rgba(139,92,246,0.25)", display: "flex", alignItems: "center", justifyContent: "center" }}>
              <Mic size={36} color="#a78bfa" />
            </div>
            <div>
              <div style={{ color: txt, fontSize: 26, fontWeight: 800, marginBottom: 10 }}>Advanced Communication Test</div>
              <div style={{ color: sub, fontSize: 14, maxWidth: 480, lineHeight: 1.7, margin: "0 auto" }}>
                Evaluate your English fluency, pronunciation, and vocabulary. Speak confidently on the generated topic for 1 minute. Avoid pauses and filler words for best results.
              </div>
            </div>
            <button onClick={fetchTopic}
              style={Object.assign({}, btnBase, { background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff", padding: "13px 36px", fontSize: 15, boxShadow: "0 4px 20px rgba(139,92,246,0.4)" })}
              onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.85"; }}
              onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}>
              <Zap size={16} /> Generate Topic
            </button>
          </div>
        )}

        {/* ── STEP 2: Record ── */}
        {topicGenerated && (
          <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

            {/* Topic card */}
            <div style={{ background: panel, border: "1px solid " + bdr, borderRadius: 14, padding: "18px 22px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                <MessageSquare size={14} color="#a78bfa" />
                <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#a78bfa" }}>Your Topic</span>
              </div>
              <p style={{ color: txt, fontSize: 15, fontWeight: 600, lineHeight: 1.6, margin: 0 }}>{topic}</p>
            </div>

            {/* Timer + controls */}
            <div style={{ background: panel, border: "1px solid " + bdr, borderRadius: 14, padding: "24px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 20 }}>
              <TimerRing timeLeft={timeLeft} total={totalTime} />

              <div style={{ display: "flex", flexDirection: "column", gap: 12, flex: 1, minWidth: 200 }}>
                <div style={{ color: sub, fontSize: 12, lineHeight: 1.6 }}>
                  {recording
                    ? "Recording in progress — speak clearly and confidently."
                    : audioURL
                    ? "Recording complete. Processing your speech..."
                    : "Press Start when you are ready to begin speaking."}
                </div>

                <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                  {!recording && !loading && (
                    <button onClick={startRecording}
                      style={Object.assign({}, btnBase, { background: "linear-gradient(135deg,#8b5cf6,#6d28d9)", color: "#fff", boxShadow: "0 2px 14px rgba(139,92,246,0.4)" })}
                      onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}>
                      <Mic size={15} /> {audioURL ? "Retake" : "Start Recording"}
                    </button>
                  )}

                  {recording && (
                    <button onClick={stopRecording}
                      style={Object.assign({}, btnBase, { background: "linear-gradient(135deg,#ef4444,#dc2626)", color: "#fff", boxShadow: "0 2px 14px rgba(239,68,68,0.4)" })}
                      onMouseEnter={function(e) { e.currentTarget.style.opacity = "0.85"; }}
                      onMouseLeave={function(e) { e.currentTarget.style.opacity = "1"; }}>
                      <Square size={14} /> Stop
                    </button>
                  )}

                  {loading && (
                    <div style={{ display: "flex", alignItems: "center", gap: 8, color: "#a78bfa", fontSize: 13, fontWeight: 600 }}>
                      <div style={{ width: 16, height: 16, border: "2px solid rgba(167,139,250,0.2)", borderTop: "2px solid #a78bfa", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
                      Analyzing speech...
                    </div>
                  )}
                </div>

                {recording && (
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#ef4444", animation: "pulse 1s ease infinite" }} />
                    <span style={{ color: "#f87171", fontSize: 12, fontFamily: "monospace", fontWeight: 600 }}>LIVE</span>
                  </div>
                )}
              </div>
            </div>

            {/* Audio playback */}
            {audioURL && (
              <div style={{ background: panel, border: "1px solid " + bdr, borderRadius: 14, padding: "16px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <Volume2 size={14} color="#22d3ee" />
                  <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22d3ee" }}>Playback</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: sub, fontFamily: "monospace" }}>{wordCount} words</span>
                </div>
                <audio controls src={audioURL} style={{ width: "100%", borderRadius: 8, height: 36 }} />
              </div>
            )}

            {/* Transcript */}
            {transcript && (
              <div style={{ background: panel, border: "1px solid " + bdr, borderRadius: 14, padding: "16px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                  <MessageSquare size={14} color="#22d3ee" />
                  <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#22d3ee" }}>Transcript</span>
                </div>
                <p style={{ color: txt, fontSize: 13, lineHeight: 1.8, margin: 0 }}>{transcript}</p>
              </div>
            )}

            {/* Filler words */}
            {fillersData && fillersData.total_count > 0 && (
              <div style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.2)", borderRadius: 14, padding: "16px 22px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                  <AlertCircle size={14} color="#f59e0b" />
                  <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f59e0b" }}>Filler Words Detected</span>
                  <span style={{ marginLeft: "auto", fontSize: 11, color: "#f59e0b", fontFamily: "monospace", fontWeight: 700 }}>{fillersData.total_count} total</span>
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {fillersData.details && fillersData.details.map(function(f, idx) {
                    var label = typeof f === "string" ? f : (f.word ? f.word + (f.start_time ? " @" + f.start_time.toFixed(1) + "s" : "") : String(f));
                    return (
                      <span key={idx} style={{ padding: "3px 10px", borderRadius: 6, background: "rgba(245,158,11,0.12)", border: "1px solid rgba(245,158,11,0.25)", color: "#fbbf24", fontSize: 12, fontFamily: "monospace" }}>
                        {label}
                      </span>
                    );
                  })}
                </div>
              </div>
            )}

            {/* ── Scores ── */}
            {scoreData && (
              <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>

                {/* Total score banner */}
                <div style={{ background: "linear-gradient(135deg,rgba(139,92,246,0.15),rgba(6,182,212,0.1))", border: "1px solid rgba(139,92,246,0.25)", borderRadius: 14, padding: "16px 22px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <CheckCircle size={20} color="#a78bfa" />
                    <span style={{ color: txt, fontWeight: 700, fontSize: 15 }}>Assessment Complete</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <span style={{ color: sub, fontSize: 12, fontFamily: "monospace" }}>OVERALL SCORE</span>
                    <div style={{ background: "linear-gradient(135deg,#8b5cf6,#06b6d4)", borderRadius: 10, padding: "6px 18px", fontSize: 20, fontWeight: 900, color: "#fff", fontFamily: "monospace", boxShadow: "0 2px 14px rgba(139,92,246,0.4)" }}>
                      {totalScore}/10
                    </div>
                  </div>
                </div>

                {/* Language scores */}
                <ScoreSection title="Language Quality" accent="#a78bfa" scores={[
                  { label: "Vocabulary",    value: scoreData.vocabulary_score },
                  { label: "Grammar",       value: scoreData.grammar_score },
                  { label: "Sentence",      value: scoreData.sentence_correctness_score },
                  { label: "Coherence",     value: scoreData.coherence_score },
                  { label: "Clarity",       value: scoreData.clarity_score },
                  { label: "Relevance",     value: scoreData.relevance_score },
                ]} />

                {/* Fluency scores */}
                <ScoreSection title="Fluency Metrics" accent="#22d3ee" scores={[
                  { label: "Speech Rate",   value: scoreData.speech_rate_score },
                  { label: "Pause Rate",    value: scoreData.pause_time_score },
                  { label: "Pitch",         value: scoreData.pitch_variability_score },
                  { label: "Rhythm",        value: scoreData.rhythm_variability_score },
                  { label: "Fillers",       value: scoreData.fillers_score },
                ]} />

                {/* Mistakes */}
                <div style={{ background: "rgba(239,68,68,0.05)", border: "1px solid rgba(239,68,68,0.15)", borderRadius: 14, padding: "16px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, background: "#f87171" }} />
                    <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#f87171" }}>Grammatical Mistakes</span>
                  </div>
                  <p style={{ color: txt, fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>
                    {Array.isArray(scoreData.grammatical_mistake)
                      ? scoreData.grammatical_mistake.length === 0
                        ? "No major mistakes detected."
                        : scoreData.grammatical_mistake.map(function(m, i) {
                            if (typeof m === "object" && m !== null) {
                              return (m.mistake || "") + (m.correction ? " → " + m.correction : "");
                            }
                            return String(m);
                          }).join("\n")
                      : scoreData.grammatical_mistake || "No major mistakes detected."}
                  </p>
                </div>

                {/* Suggestions */}
                <div style={{ background: "rgba(16,185,129,0.05)", border: "1px solid rgba(16,185,129,0.15)", borderRadius: 14, padding: "16px 22px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 10 }}>
                    <div style={{ width: 3, height: 16, borderRadius: 2, background: "#34d399" }} />
                    <span style={{ fontSize: 10, fontFamily: "monospace", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em", color: "#34d399" }}>Improvement Tips</span>
                  </div>
                  <p style={{ color: txt, fontSize: 13, lineHeight: 1.8, margin: 0, whiteSpace: "pre-line" }}>
                    {scoreData.improvement_needed || "Great job! Keep practicing!"}
                  </p>
                </div>

                {/* Retake */}
                <div style={{ display: "flex", justifyContent: "center", paddingTop: 8 }}>
                  <button onClick={resetTest}
                    style={Object.assign({}, btnBase, { background: "transparent", color: sub, border: "1px solid rgba(255,255,255,0.1)", fontSize: 13 })}
                    onMouseEnter={function(e) { e.currentTarget.style.borderColor = "rgba(139,92,246,0.4)"; e.currentTarget.style.color = "#a78bfa"; }}
                    onMouseLeave={function(e) { e.currentTarget.style.borderColor = "rgba(255,255,255,0.1)"; e.currentTarget.style.color = sub; }}>
                    <RefreshCw size={14} /> Retake Test
                  </button>
                </div>
              </div>
            )}

          </div>
        )}
      </div>

      <style>{"@keyframes spin { to { transform: rotate(360deg); } } @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:0.4} }"}</style>
    </div>
  );
};

export default EnglishFluencyRecorder;
