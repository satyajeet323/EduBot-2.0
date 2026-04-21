import React from "react";
import { Handle, Position } from "react-flow-renderer";

const deviceColors = {
  pc:     { accent: "#06b6d4", bg: "#0e7490" },
  switch: { accent: "#f59e0b", bg: "#b45309" },
  router: { accent: "#8b5cf6", bg: "#6d28d9" },
};

export default function DeviceNode({ data }) {
  const iconMap = {
    pc:     "/images/PCICON.png",
    switch: "/images/SWITCHICON.png",
    router: "/images/ROUTER1ICON.png",
  };

  const iconSrc = iconMap[data.deviceType] || null;
  const iface   = data.interfaces?.[0] || null;
  const colors  = deviceColors[data.deviceType] || { accent: "#64748b", bg: "#475569" };

  const handleStyle = {
    background: colors.accent,
    width: 8,
    height: 8,
    borderRadius: "50%",
    border: "2px solid #0a0e1a",
    cursor: "crosshair",
  };

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      padding: "8px 10px",
      borderRadius: 10,
      background: "linear-gradient(145deg, #111827, #0d1117)",
      border: `1px solid ${colors.accent}40`,
      boxShadow: `0 0 12px ${colors.accent}18, 0 2px 8px rgba(0,0,0,0.4)`,
      color: "#f1f5f9",
      fontSize: 10,
      width: 140,
      gap: 5,
      boxSizing: "border-box",
      position: "relative",
      fontFamily: "'Inter','Segoe UI',sans-serif",
      transition: "box-shadow 0.2s",
    }}>
      {/* Target handle */}
      <Handle type="target" position={Position.Left} id="input" style={{ ...handleStyle, left: -4 }} />

      {/* Header row */}
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        {/* Icon badge */}
        <div style={{
          width: 28, height: 28, borderRadius: 6,
          background: `${colors.accent}18`,
          border: `1px solid ${colors.accent}35`,
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {iconSrc
            ? <img src={iconSrc} alt={data.deviceType} style={{ width: 18, height: 18, objectFit: "contain" }} />
            : <div style={{ width: 18, height: 18, background: "#475569", borderRadius: 3 }} />
          }
        </div>

        {/* Label */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "#f1f5f9", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
            {data.label}
          </div>
          <div style={{ fontSize: 9, color: colors.accent, fontFamily: "monospace", textTransform: "uppercase", letterSpacing: "0.06em" }}>
            {data.deviceType}
          </div>
        </div>
      </div>

      {/* PC info */}
      {data.deviceType === "pc" && iface && (
        <div style={{
          background: "rgba(6,182,212,0.06)",
          border: "1px solid rgba(6,182,212,0.15)",
          borderRadius: 5,
          padding: "4px 6px",
          fontSize: 9,
          color: "#94a3b8",
          lineHeight: 1.6,
          fontFamily: "monospace",
        }}>
          <div><span style={{ color: "#22d3ee" }}>IP</span>  {iface.ip || <span style={{ color: "#475569" }}>—</span>}</div>
          <div><span style={{ color: "#22d3ee" }}>GW</span>  {iface.gateway || <span style={{ color: "#475569" }}>—</span>}</div>
          <div><span style={{ color: "#22d3ee" }}>SN</span>  {iface.subnetMask || <span style={{ color: "#475569" }}>—</span>}</div>
        </div>
      )}

      {/* Router info */}
      {data.deviceType === "router" && data.interfaces?.length >= 2 && (
        <div style={{
          background: "rgba(139,92,246,0.06)",
          border: "1px solid rgba(139,92,246,0.15)",
          borderRadius: 5,
          padding: "4px 6px",
          fontSize: 9,
          color: "#94a3b8",
          lineHeight: 1.6,
          fontFamily: "monospace",
        }}>
          <div><span style={{ color: "#a78bfa" }}>A</span>  {data.interfaces[0]?.ip || <span style={{ color: "#475569" }}>—</span>}</div>
          <div><span style={{ color: "#a78bfa" }}>B</span>  {data.interfaces[1]?.ip || <span style={{ color: "#475569" }}>—</span>}</div>
        </div>
      )}

      {/* Source handle */}
      <Handle type="source" position={Position.Right} id="output" style={{ ...handleStyle, right: -4 }} />
    </div>
  );
}
