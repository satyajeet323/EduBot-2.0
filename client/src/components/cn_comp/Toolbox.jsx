import React from "react";

const tools = [
  { type: "pc",     label: "PC",     icon: "/images/PCICON.png",      desc: "End device" },
  { type: "switch", label: "Switch", icon: "/images/SWITCHICON.png",  desc: "Layer 2" },
  { type: "router", label: "Router", icon: "/images/ROUTER1ICON.png", desc: "Layer 3" },
];

export default function Toolbox({ dark = true }) {
  const bg    = dark ? "#0d1117"              : "#ffffff";
  const bdr   = dark ? "rgba(6,182,212,0.12)" : "rgba(6,182,212,0.25)";
  const txt   = dark ? "#f1f5f9"              : "#0f172a";
  const sub   = dark ? "#64748b"              : "#94a3b8";
  const item  = dark ? "rgba(255,255,255,0.03)" : "rgba(6,182,212,0.04)";
  const itemH = dark ? "rgba(6,182,212,0.08)"   : "rgba(6,182,212,0.12)";
  const itemB = dark ? "rgba(6,182,212,0.12)"   : "rgba(6,182,212,0.2)";

  const onDragStart = (e, device) => {
    e.dataTransfer.setData("application/reactflow", JSON.stringify(device));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside style={{
      width: 180,
      background: bg,
      borderRight: `1px solid ${bdr}`,
      padding: "16px 12px",
      display: "flex",
      flexDirection: "column",
      gap: 4,
      flexShrink: 0,
      overflowY: "auto",
    }}>
      {/* Header */}
      <div style={{ marginBottom: 12 }}>
        <div style={{ fontSize: "0.65rem", fontFamily: "monospace", fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#22d3ee", marginBottom: 2 }}>
          Device Library
        </div>
        <div style={{ fontSize: "0.7rem", color: sub }}>Drag to canvas</div>
      </div>

      {/* Device items */}
      {tools.map((t) => (
        <div
          key={t.type}
          draggable
          onDragStart={(e) => onDragStart(e, t)}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 10,
            padding: "10px 10px",
            borderRadius: 8,
            background: item,
            border: `1px solid ${itemB}`,
            cursor: "grab",
            transition: "all 0.18s",
            marginBottom: 4,
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = itemH;
            e.currentTarget.style.borderColor = "rgba(34,211,238,0.35)";
            e.currentTarget.style.transform = "translateX(2px)";
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = item;
            e.currentTarget.style.borderColor = itemB;
            e.currentTarget.style.transform = "translateX(0)";
          }}
        >
          <div style={{ width: 34, height: 34, borderRadius: 7, background: dark ? "rgba(6,182,212,0.1)" : "rgba(6,182,212,0.08)", border: `1px solid ${dark?"rgba(6,182,212,0.2)":"rgba(6,182,212,0.25)"}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <img src={t.icon} alt={t.label} style={{ width: 20, height: 20, objectFit: "contain" }} />
          </div>
          <div>
            <div style={{ color: txt, fontSize: "0.8rem", fontWeight: 600, lineHeight: 1.2 }}>{t.label}</div>
            <div style={{ color: sub, fontSize: "0.65rem", fontFamily: "monospace" }}>{t.desc}</div>
          </div>
        </div>
      ))}

      {/* Divider */}
      <div style={{ height: 1, background: bdr, margin: "8px 0" }} />

      {/* Tips */}
      <div style={{ fontSize: "0.65rem", color: sub, lineHeight: 1.6 }}>
        <div style={{ color: "#22d3ee", fontWeight: 600, marginBottom: 4, fontFamily: "monospace", fontSize: "0.6rem", textTransform: "uppercase", letterSpacing: "0.08em" }}>Tips</div>
        <div>• Drag devices to canvas</div>
        <div>• Double-click to configure</div>
        <div>• Drag handles to connect</div>
      </div>
    </aside>
  );
}
