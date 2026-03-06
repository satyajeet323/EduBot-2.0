import React, { useState, useRef, useEffect } from "react";
import backgroundImage from "./assets/background.jpg";

const EnglishFluencyRecorder = () => {
  const [recording, setRecording] = useState(false);
  const [mediaRecorder, setMediaRecorder] = useState(null);
  const [audioBlob, setAudioBlob] = useState(null);
  const [timeLeft, setTimeLeft] = useState(60);
  const [audioURL, setAudioURL] = useState(null);
  const [loading, setLoading] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [prosodyData, setProsodyData] = useState(null);
  const [topic, setTopic] = useState("");
  const [topicGenerated, setTopicGenerated] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [fileId, setFileId] = useState(null);
  const [transcript, setTranscript] = useState("");
  const [fillersData, setFillersData] = useState(null);

  const timerRef = useRef(null);
  const chunks = useRef([]);
  const totalTime = 60;

  useEffect(() => {
    if (recording && timeLeft > 0) {
      timerRef.current = setTimeout(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (recording && timeLeft === 0) {
      stopRecording();
    }
    return () => clearTimeout(timerRef.current);
  }, [recording, timeLeft]);

  const fetchTopic = async () => {
    try {
      const res = await fetch("/api/fluency/topic");
      const data = await res.json();
      setTopic(data.topic);
      setTopicGenerated(true);
    } catch (err) {
      console.error(err);
      alert("Couldn't fetch topic.");
    }
  };

  const getFluencyScore = async (transcript, topic, prosody) => {
    try {
      const res = await fetch("/api/fluency/score", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript, topic, prosody }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      return data;
    } catch (err) {
      console.error(err);
      return null;
    }
  };

  const startRecording = async () => {
    if (!topicGenerated) return alert("Generate a topic first.");
    setAudioBlob(null);
    setAudioURL(null);
    setScoreData(null);
    setProsodyData(null);
    setFileId(null);
    setTranscript("");
    setFillersData(null);
    setTimeLeft(totalTime);
    setWordCount(0);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let recorder;
      try {
        recorder = new MediaRecorder(stream, { mimeType: "audio/webm" });
      } catch {
        recorder = new MediaRecorder(stream);
      }

      chunks.current = [];

      recorder.ondataavailable = (e) => e.data.size > 0 && chunks.current.push(e.data);
      recorder.onstop = () => {
        const blob = new Blob(chunks.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((t) => t.stop());
        setAudioBlob(blob);
        setAudioURL(URL.createObjectURL(blob));
        handleSubmit(blob);
      };

      recorder.start();
      setMediaRecorder(recorder);
      setRecording(true);
    } catch (err) {
      alert("Microphone not available.");
      console.error(err);
    }
  };

  const stopRecording = () => {
    if (mediaRecorder && mediaRecorder.state !== "inactive") mediaRecorder.stop();
    setRecording(false);
  };

  const handleSubmit = async (blob = audioBlob) => {
    if (!blob) return;
    setLoading(true);
    const formData = new FormData();
    formData.append("audio", blob, "fluency-test.webm");

    try {
      const response = await fetch("/api/fluency/upload", {
        method: "POST",
        body: formData,
      });
      const data = await response.json();
      if (!response.ok || data.error) {
        alert("Upload failed: " + (data.error || "Unknown error"));
        return;
      }
      setFileId(data.file_id);
      setTranscript(data.transcript || "");
      setProsodyData(data.prosody || {});
      setFillersData(data.fillers ?? null);

      if (data.transcript) {
        const count = data.transcript.trim().split(/\s+/).filter(Boolean).length;
        setWordCount(count);
      }

      const score = await getFluencyScore(data.transcript || "", topic, data.prosody);

      setScoreData(score?.score || null);
    } catch (err) {
      console.error(err);
      alert("Error processing audio.");
    } finally {
      setLoading(false);
    }
  };

  const prettyList = (val) => {
    if (!val) return null;
    if (Array.isArray(val)) return val;
    if (typeof val === "string") return [val];
    if (typeof val === "object") {
      const out = [];
      Object.entries(val).forEach(([k, v]) => {
        if (Array.isArray(v)) v.forEach((i) => out.push(`${k}: ${i}`));
        else out.push(`${k}: ${String(v)}`);
      });
      return out;
    }
    return [String(val)];
  };

  // Updated CircleProgress
// CircleProgress: score inside circle, label outside
const CircleProgress = ({ label, value }) => {
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const progress = (Math.min(Math.max(value || 0, 0), 10) / 10) * circumference;

  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", width: 160 }}>
      <svg width={160} height={160} style={{ display: "block", margin: "0 auto" }}>
        <defs>
          <linearGradient id="gradY" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#fde047" />
            <stop offset="100%" stopColor="#facc15" />
          </linearGradient>
        </defs>
        <circle cx="80" cy="80" r={radius} stroke="#333" strokeWidth="10" fill="none" />
        <circle
          cx="80"
          cy="80"
          r={radius}
          stroke="url(#gradY)"
          strokeWidth="10"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={circumference - progress}
          strokeLinecap="round"
          style={{
            transition: "stroke-dashoffset 0.6s ease",
            transform: "rotate(-90deg) scale(1,-1)",
            transformOrigin: "80px 80px",
            filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.35))",
          }}
        />
        <text
          x="50%"
          y="50%"
          textAnchor="middle"
          dominantBaseline="central"
          fontSize="1.6rem"
          fontWeight="800"
          fill="#fff"
        >
          {value}/10
        </text>
      </svg>
      <p style={{ marginTop: "0.5rem", fontWeight: 700, textAlign: "center", fontSize: "0.9rem" }}>
        {label}
      </p>
    </div>
  );
};



  const totalScore = scoreData
    ? Math.round(
        (scoreData.vocabulary_score +
          scoreData.grammar_score +
          scoreData.sentence_correctness_score +
          scoreData.coherence_score +
          scoreData.clarity_score +
          scoreData.relevance_score +
          scoreData.speech_rate_score +
          scoreData.pause_time_score +
          scoreData.pitch_variability_score +
          scoreData.rhythm_variability_score +
          scoreData.fillers_score) / 11
      )
    : null;

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        position: "relative",
        fontFamily: "'Nunito', sans-serif",
        color: "#fff",
      }}
    >
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "rgba(0,0,0,0.5)",
          backdropFilter: "blur(6px)",
        }}
      ></div>

      <div
        style={{
          position: "relative",
          zIndex: 2,
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          padding: "2rem",
          textAlign: "center",
        }}
      >
        {!topicGenerated ? (
          <>
            <h2 style={{ fontSize: "2.8rem", fontWeight: 700, marginBottom: "1rem" }}>
              ADVANCED COMMUNICATION TEST
            </h2>
            <p
              style={{
                marginBottom: "2rem",
                maxWidth: "600px",
                lineHeight: "1.6",
                fontSize: "1.1rem",
                color: "#d1d5db",
              }}
            >
              Evaluate your English fluency, pronunciation, and vocabulary. Speak confidently on the
              generated topic for 1 minute. Avoid pauses and filler words for best results.
            </p>
            <button
              onClick={fetchTopic}
              style={{
                padding: "0.8rem 2rem",
                fontSize: "1.1rem",
                fontWeight: 600,
                borderRadius: "12px",
                border: "none",
                background: "#facc15",
                color: "#000",
                cursor: "pointer",
                boxShadow: "0 4px 10px rgba(0,0,0,0.4)",
              }}
            >
              🎲 Generate Topic
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "1rem" }}>🗣 Topic: {topic}</h2>

            {/* Stopwatch Countdown */}
            <div style={{ position: "relative", width: "180px", height: "180px", margin: "2rem" }}>
              <svg width="180" height="180">
                <circle cx="90" cy="90" r="80" stroke="#333" strokeWidth="10" fill="none" />
                <circle
                  cx="90"
                  cy="90"
                  r="80"
                  stroke="#facc15"
                  strokeWidth="10"
                  fill="none"
                  strokeDasharray={2 * Math.PI * 80}
                  strokeDashoffset={2 * Math.PI * 80 - (timeLeft / totalTime) * 2 * Math.PI * 80}
                  strokeLinecap="round"
                  style={{
                    transition: "stroke-dashoffset 1s linear",
                    transform: "rotate(-90deg) scale(1,-1)",
                    transformOrigin: "90px 90px",
                    filter: "drop-shadow(0 0 8px rgba(250, 204, 21, 0.35))",
                  }}
                />
              </svg>
              <div
                style={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  fontSize: "2rem",
                  fontWeight: 800,
                }}
              >
                {`${Math.floor(timeLeft / 60)}:${(timeLeft % 60).toString().padStart(2, "0")}`}
              </div>
            </div>

            {/* Recording Controls */}
            <div style={{ display: "flex", gap: "1rem", marginBottom: "2rem" }}>
              <button
                onClick={startRecording}
                disabled={recording}
                style={{
                  padding: "0.8rem 2rem",
                  fontSize: "1.1rem",
                  fontWeight: 700,
                  borderRadius: "12px",
                  border: "none",
                  background: recording ? "#555" : "#8701c5ff",
                  color: "#fff",
                  cursor: recording ? "not-allowed" : "pointer",
                }}
              >
                {recording ? "Recording..." : "🎙 Start"}
              </button>
              {recording && (
                <button
                  onClick={stopRecording}
                  style={{
                    padding: "0.8rem 2rem",
                    fontSize: "1.1rem",
                    fontWeight: 700,
                    borderRadius: "12px",
                    border: "none",
                    background: "#dc2626",
                    color: "#fff",
                    cursor: "pointer",
                  }}
                >
                  ⏹ Stop
                </button>
              )}
            </div>

            {loading && <p>⚙️ Analyzing your speech...</p>}

            {audioURL && (
              <div style={{ marginBottom: "1.5rem", width: "100%", maxWidth: 800 }}>
                <audio controls src={audioURL} style={{ width: "100%", borderRadius: "8px" }} />
                <p style={{ marginTop: "0.5rem", color: "#d1d5db" }}>📝 Words spoken: {wordCount}</p>
              </div>
            )}

            {transcript && (
              <div
                style={{
                  padding: "1rem",
                  background: "rgba(0,0,0,0.4)",
                  borderRadius: "12px",
                  marginBottom: "1.5rem",
                  width: "100%",
                  maxWidth: 900,
                  textAlign: "left",
                }}
              >
                <h3 style={{ fontWeight: 700, marginBottom: "0.5rem", color: "#facc15" }}>Transcript</h3>
                <p style={{ lineHeight: 1.7 }}>{transcript}</p>
              </div>
            )}



{scoreData && (
  <>
    {/* Total Score */}
    <div
      style={{
        marginTop: "0.5rem",
        marginBottom: "1rem",
        background: "#fde047",
        borderRadius: 14,
        padding: "0.9rem 1.2rem",
        display: "inline-flex",
        alignItems: "center",
        gap: "0.75rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.06)",
      }}
    >
      <span style={{ fontWeight: 800, letterSpacing: 0.2, color: "#000000ff" }}>Total Score :</span>
      <span style={{ fontWeight: 900, color:"#000000ff" }}>{totalScore}/10</span>
    </div>

    {/* Vocabulary Card */}
    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "1rem",
        marginBottom: "1.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        width: 1100,   // fixed width
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#ddd" }}>Vocabulary</h3>
      <div style={{ display: "flex", justifyContent: "space-around", gap: "1rem", flexWrap: "nowrap" }}>
        <CircleProgress label="Vocabulary" value={scoreData.vocabulary_score} color="#fde047" />
        <CircleProgress label="Grammar" value={scoreData.grammar_score} color="#fde047" />
        <CircleProgress label="Sentence Correctness" value={scoreData.sentence_correctness_score} color="#fde047" />
        <CircleProgress label="Coherence" value={scoreData.coherence_score} color="#fde047" />
        <CircleProgress label="Clarity" value={scoreData.clarity_score} color="#fde047" />
        <CircleProgress label="Relevance" value={scoreData.relevance_score} color="#fde047" />
      </div>
    </div>

    {/* Fluency Card */}
    <div
      style={{
        background: "rgba(255,255,255,0.1)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "1rem",
        marginBottom: "1.5rem",
        boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
        width: 1100,   // match Vocabulary card
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h3 style={{ fontSize: "1.3rem", marginBottom: "1rem", color: "#ddd" }}>Fluency</h3>
      <div style={{ display: "flex", justifyContent: "space-around", gap: "1rem", flexWrap: "nowrap" }}>
        <CircleProgress label="Speech Rate" value={scoreData.speech_rate_score} color="#60a5fa" />
        <CircleProgress label="Pause Rate" value={scoreData.pause_time_score} color="#60a5fa" />
        <CircleProgress label="Pitch Variability" value={scoreData.pitch_variability_score} color="#60a5fa" />
        <CircleProgress label="Rhythm Variability" value={scoreData.rhythm_variability_score} color="#60a5fa" />
        <CircleProgress label="Inverse Filler Frequency" value={scoreData.fillers_score} color="#60a5fa" />
      </div>
    </div>

    {/* Mistakes Card */}
    <div
      style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "1rem 1.5rem",
        marginTop: "1.5rem",
        marginBottom: "1rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        width: 1100,   // match Vocabulary card
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h4 style={{ fontWeight: 700, color: "#c290e4ff", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
        MISTAKES
      </h4>
      <p style={{ lineHeight: 1.6, color: "#f3f4f6" }}>
        {scoreData.grammatical_mistake || "No major mistakes detected."}
      </p>
    </div>

    {/* Suggestions Card */}
    <div
      style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(10px)",
        borderRadius: "16px",
        padding: "1rem 1.5rem",
        marginBottom: "1.5rem",
        boxShadow: "0 8px 24px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        border: "1px solid rgba(255,255,255,0.1)",
        width: 1100,   // match Vocabulary card
        marginLeft: "auto",
        marginRight: "auto",
      }}
    >
      <h4 style={{ fontWeight: 700, color: "#c290e4ff", marginBottom: "0.75rem", fontSize: "1.1rem" }}>
        SUGGESTIONS
      </h4>
      <p style={{ lineHeight: 1.6, color: "#f3f4f6", whiteSpace: "pre-line" }}>
        {scoreData.improvement_needed || "Good job! Keep practicing!"}
      </p>
    </div>
  </>
)}






            {fillersData && fillersData.total_count > 0 && (
              <div className="mt-6 p-4 bg-white border border-gray-300 rounded-xl shadow">
                <h3 className="text-xl font-bold text-indigo-800 mb-2 text-center">🗣️ Filler Words Detected</h3>
                <p>Total fillers: {fillersData.total_count}</p>
                <ul className="list-disc ml-6 text-gray-800">
                  {fillersData.details.map((f, idx) => {
                    if (typeof f === "string") return <li key={idx}>{f}</li>;
                    else if (f.word) return <li key={idx}>{f.word} {f.start_time ? `(at ${f.start_time.toFixed(2)}s)` : ""}</li>;
                    return null;
                  })}
                </ul>
              </div>
            )}

            {(audioURL || scoreData || transcript) && (
              <button
                onClick={() => {
                  setAudioBlob(null);
                  setAudioURL(null);
                  setScoreData(null);
                  setProsodyData(null);
                  setTranscript("");
                  setFillersData(null);
                  setWordCount(0);
                  setTimeLeft(totalTime);
                }}
                style={{
                  marginTop: "1.5rem",
                  padding: "0.7rem 1.2rem",
                  borderRadius: 10,
                  border: "1px solid rgba(255,255,255,0.1)",
                  background: "rgba(255,255,255,0.07)",
                  color: "#fff",
                  cursor: "pointer",
                }}
              >
                🔁 Retake Test
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default EnglishFluencyRecorder;
