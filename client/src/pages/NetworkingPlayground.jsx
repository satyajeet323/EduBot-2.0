import React, { useState, useRef, useEffect } from "react";
import CanvasFlow from "../components/cn_comp/CanvasFlow";
import Toolbox from "../components/cn_comp/Toolbox";
import { Undo2, Redo2, Network, Moon, Sun } from "lucide-react";

const NetworkingPlayground = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const canvasRef = useRef();
  const [dark, setDark] = useState(
    () => document.documentElement.classList.contains("dark")
  );

  useEffect(() => {
    const obs = new MutationObserver(() =>
      setDark(document.documentElement.classList.contains("dark"))
    );
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  const bg   = dark ? "#0a0e1a" : "#f0f9ff";
  const hdr  = dark ? "#0d1117" : "#ffffff";
  const bdr  = dark ? "rgba(6,182,212,0.15)" : "rgba(6,182,212,0.3)";
  const txt  = dark ? "#f1f5f9" : "#0f172a";
  const sub  = dark ? "#64748b" : "#94a3b8";

  return (
    <div style={{ height: "100vh", display: "flex", flexDirection: "column", background: bg, fontFamily: "'Inter','Segoe UI',sans-serif" }}>
      {/* Header */}
      <header style={{
        padding: "0 1.25rem",
        height: 56,
        background: hdr,
        borderBottom: `1px solid ${bdr}`,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        flexShrink: 0,
        boxShadow: dark ? "0 1px 0 rgba(6,182,212,0.08)" : "0 1px 3px rgba(0,0,0,0.06)",
      }}>
        {/* Brand */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{ width: 30, height: 30, borderRadius: 8, background: "linear-gradient(135deg,#06b6d4,#3b82f6)", display: "flex", alignItems: "center", justifyContent: "center", boxShadow: "0 0 12px rgba(6,182,212,0.4)" }}>
            <Network size={15} color="#fff" />
          </div>
          <div>
            <div style={{ color: txt, fontWeight: 700, fontSize: "0.9rem", letterSpacing: "0.02em" }}>Networking Playground</div>
            <div style={{ color: sub, fontSize: "0.65rem", fontFamily: "monospace", letterSpacing: "0.08em", textTransform: "uppercase" }}>EduBot · Network Lab</div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <button onClick={() => canvasRef.current?.undo()} title="Undo"
            style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"transparent", color: sub, border:`1px solid ${dark?"rgba(148,163,184,0.15)":"#e2e8f0"}`, borderRadius:6, cursor:"pointer", fontSize:"0.78rem", fontWeight:600, transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.color = "#22d3ee"; e.currentTarget.style.borderColor = "rgba(34,211,238,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.color = sub; e.currentTarget.style.borderColor = dark?"rgba(148,163,184,0.15)":"#e2e8f0"; }}
          >
            <Undo2 size={13} /> Undo
          </button>
          <button onClick={() => canvasRef.current?.redo()} title="Redo"
            style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 12px", background:"linear-gradient(135deg,#06b6d4,#3b82f6)", color:"#fff", border:"none", borderRadius:6, cursor:"pointer", fontSize:"0.78rem", fontWeight:700, boxShadow:"0 2px 8px rgba(6,182,212,0.3)", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.opacity = "0.85"; }}
            onMouseLeave={e => { e.currentTarget.style.opacity = "1"; }}
          >
            <Redo2 size={13} /> Redo
          </button>
        </div>
      </header>

      {/* Workspace */}
      <div style={{ flex: 1, display: "flex", overflow: "hidden" }}>
        <Toolbox dark={dark} />
        <CanvasFlow ref={canvasRef} onNodeClick={setSelectedNode} dark={dark} />
      </div>
    </div>
  );
};

export default NetworkingPlayground;
