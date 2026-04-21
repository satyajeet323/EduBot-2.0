import React, { useState, useEffect } from "react";
import { Monitor, X } from "lucide-react";

const isDark = () => document.documentElement.classList.contains("dark");

export default function PCConfigDialog({ open, initialData, onClose, onSave }) {
  const [ip,      setIp]      = useState("");
  const [subnet,  setSubnet]  = useState("255.255.255.0");
  const [gateway, setGateway] = useState("");
  const [dark,    setDark]    = useState(isDark);

  useEffect(() => {
    const obs = new MutationObserver(() => setDark(isDark()));
    obs.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => obs.disconnect();
  }, []);

  useEffect(() => {
    if (initialData) {
      setIp(initialData.ip || "");
      setSubnet(initialData.subnetMask || "255.255.255.0");
      setGateway(initialData.gateway || "");
    }
  }, [initialData]);

  if (!open) return null;

  const bg    = dark ? "#111827" : "#ffffff";
  const bdr   = dark ? "rgba(6,182,212,0.2)" : "rgba(6,182,212,0.3)";
  const txt   = dark ? "#f1f5f9" : "#0f172a";
  const sub   = dark ? "#64748b" : "#94a3b8";
  const inBg  = dark ? "#0d1117" : "#f8fafc";
  const inBdr = dark ? "rgba(100,116,139,0.3)" : "#e2e8f0";
  const inFoc = "rgba(6,182,212,0.5)";

  const inputStyle = {
    width: "100%", marginTop: 6, padding: "9px 12px",
    borderRadius: 7, border: `1px solid ${inBdr}`,
    background: inBg, color: txt, fontSize: 13,
    fontFamily: "monospace", outline: "none",
    boxSizing: "border-box", transition: "border-color 0.2s",
  };

  const fields = [
    { label: "IP Address",   placeholder: "192.168.1.10",  value: ip,      setter: setIp },
    { label: "Subnet Mask",  placeholder: "255.255.255.0", value: subnet,  setter: setSubnet },
    { label: "Gateway IP",   placeholder: "192.168.1.1",   value: gateway, setter: setGateway },
  ];

  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.65)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:9999, backdropFilter:"blur(4px)" }}>
      <div style={{ background: bg, border: `1px solid ${bdr}`, borderRadius: 14, width: 380, padding: "24px 28px", boxShadow: dark ? "0 0 40px rgba(6,182,212,0.15), 0 20px 40px rgba(0,0,0,0.5)" : "0 20px 40px rgba(0,0,0,0.12)", display:"flex", flexDirection:"column", gap:16 }}>
        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:32, height:32, borderRadius:8, background:"rgba(6,182,212,0.12)", border:"1px solid rgba(6,182,212,0.25)", display:"flex", alignItems:"center", justifyContent:"center" }}>
              <Monitor size={16} color="#22d3ee" />
            </div>
            <div>
              <div style={{ color: txt, fontWeight:700, fontSize:14 }}>Configure PC</div>
              <div style={{ color: sub, fontSize:11, fontFamily:"monospace" }}>Network Settings</div>
            </div>
          </div>
          <button onClick={onClose} style={{ background:"transparent", border:"none", cursor:"pointer", color: sub, padding:4, borderRadius:6, display:"flex", alignItems:"center" }}
            onMouseEnter={e => e.currentTarget.style.color="#f87171"}
            onMouseLeave={e => e.currentTarget.style.color=sub}>
            <X size={16} />
          </button>
        </div>

        {/* Divider */}
        <div style={{ height:1, background: bdr }} />

        {/* Fields */}
        {fields.map(({ label, placeholder, value, setter }) => (
          <label key={label} style={{ display:"flex", flexDirection:"column", fontSize:12, fontWeight:600, color: sub, fontFamily:"monospace", textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {label}
            <input
              type="text" value={value} placeholder={placeholder}
              onChange={e => setter(e.target.value)}
              style={inputStyle}
              onFocus={e => e.target.style.borderColor = inFoc}
              onBlur={e => e.target.style.borderColor = inBdr}
            />
          </label>
        ))}

        {/* Actions */}
        <div style={{ display:"flex", gap:10, justifyContent:"flex-end", marginTop:4 }}>
          <button onClick={onClose}
            style={{ padding:"8px 18px", borderRadius:7, border:`1px solid ${inBdr}`, background:"transparent", color: sub, fontSize:13, fontWeight:600, cursor:"pointer", transition:"all 0.2s" }}
            onMouseEnter={e => { e.currentTarget.style.borderColor="#94a3b8"; e.currentTarget.style.color=txt; }}
            onMouseLeave={e => { e.currentTarget.style.borderColor=inBdr; e.currentTarget.style.color=sub; }}>
            Cancel
          </button>
          <button onClick={() => onSave({ ip, subnetMask: subnet, gateway })}
            style={{ padding:"8px 22px", borderRadius:7, border:"none", background:"linear-gradient(135deg,#06b6d4,#3b82f6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 12px rgba(6,182,212,0.35)", transition:"opacity 0.2s" }}
            onMouseEnter={e => e.currentTarget.style.opacity="0.85"}
            onMouseLeave={e => e.currentTarget.style.opacity="1"}>
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
