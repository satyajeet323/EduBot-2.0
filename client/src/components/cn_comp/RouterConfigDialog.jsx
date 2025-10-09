import React, { useState, useEffect } from "react";

export default function RouterConfigDialog({ open, initialData, onClose, onSave }) {
  const [interfaceA, setInterfaceA] = useState("");
  const [interfaceB, setInterfaceB] = useState("");

  useEffect(() => {
    if (initialData) {
      setInterfaceA(initialData.interfaceA || "");
      setInterfaceB(initialData.interfaceB || "");
    }
  }, [initialData]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ interfaceA, interfaceB });
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: 24,
          borderRadius: 8,
          minWidth: 320,
          boxShadow: "0 2px 12px rgba(0,0,0,0.4)",
          fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
          color: "#222",
        }}
      >
        <h3 style={{ marginTop: 0, marginBottom: 16, fontWeight: "600" }}>
          Configure Router Interfaces
        </h3>

        <label style={{ display: "block", marginBottom: 12, fontWeight: "500" }}>
          Interface A (Source) IP:
          <input
            type="text"
            value={interfaceA}
            onChange={(e) => setInterfaceA(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "8px 10px",
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 14,
              boxSizing: "border-box",
              outlineColor: "#0078d4",
              transition: "border-color 0.2s",
            }}
          />
        </label>

        <label style={{ display: "block", marginBottom: 20, fontWeight: "500" }}>
          Interface B (Destination) IP:
          <input
            type="text"
            value={interfaceB}
            onChange={(e) => setInterfaceB(e.target.value)}
            style={{
              width: "100%",
              marginTop: 6,
              padding: "8px 10px",
              borderRadius: 5,
              border: "1px solid #ccc",
              fontSize: 14,
              boxSizing: "border-box",
              outlineColor: "#0078d4",
              transition: "border-color 0.2s",
            }}
          />
        </label>

        <div style={{ textAlign: "right" }}>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 18px",
              borderRadius: 5,
              border: "none",
              backgroundColor: "#0078d4",
              color: "#fff",
              fontWeight: "600",
              cursor: "pointer",
              marginRight: 8,
              boxShadow: "0 2px 6px rgba(0,120,212,0.5)",
              transition: "background-color 0.3s",
            }}
            onMouseEnter={e => (e.currentTarget.style.backgroundColor = "#005a9e")}
            onMouseLeave={e => (e.currentTarget.style.backgroundColor = "#0078d4")}
          >
            OK
          </button>

          <button
            onClick={onClose}
            style={{
              padding: "8px 18px",
              borderRadius: 5,
              border: "1px solid #ccc",
              backgroundColor: "#f5f5f5",
              color: "#333",
              fontWeight: "600",
              cursor: "pointer",
              transition: "background-color 0.3s, border-color 0.3s",
            }}
            onMouseEnter={e => {
              e.currentTarget.style.backgroundColor = "#e0e0e0";
              e.currentTarget.style.borderColor = "#999";
            }}
            onMouseLeave={e => {
              e.currentTarget.style.backgroundColor = "#f5f5f5";
              e.currentTarget.style.borderColor = "#ccc";
            }}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
