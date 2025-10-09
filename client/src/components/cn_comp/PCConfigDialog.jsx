import React, { useState, useEffect } from "react";

export default function PCConfigDialog({ open, initialData, onClose, onSave }) {
  const [ip, setIp] = useState("");
  const [subnet, setSubnet] = useState("");
  const [gateway, setGateway] = useState("");

  useEffect(() => {
    if (initialData) {
      setIp(initialData.ip || "");
      setSubnet(initialData.subnetMask || "");
      setGateway(initialData.gateway || "");
    }
  }, [initialData]);

  if (!open) return null;

  const handleSave = () => {
    onSave({ ip, subnetMask: subnet, gateway });
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        backgroundColor: "rgba(0, 0, 0, 0.6)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 9999,
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      <div
        style={{
          backgroundColor: "#fff",
          padding: "24px 32px",
          borderRadius: 12,
          width: 360,
          boxShadow:
            "0 8px 16px rgba(0,0,0,0.2), 0 4px 6px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: 16,
        }}
      >
        <h2 style={{ margin: 0, color: "#222" }}>Configure PC Network Settings</h2>

        {[
          { label: "IP Address", value: ip, setter: setIp },
          { label: "Subnet Mask", value: subnet, setter: setSubnet, },
          { label: "Gateway IP", value: gateway, setter: setGateway },
        ].map(({ label, value, setter, placeholder }) => (
          <label
            key={label}
            style={{
              display: "flex",
              flexDirection: "column",
              fontWeight: "600",
              fontSize: 14,
              color: "#444",
            }}
          >
            {label}
            <input
              type="text"
              value={value}
              onChange={(e) => setter(e.target.value)}
              placeholder={placeholder}
              style={{
                marginTop: 6,
                padding: "8px 12px",
                borderRadius: 6,
                border: "1.5px solid #ccc",
                fontSize: 14,
                outlineColor: "#007bff",
                transition: "border-color 0.2s ease",
              }}
              onFocus={(e) => (e.target.style.borderColor = "#007bff")}
              onBlur={(e) => (e.target.style.borderColor = "#ccc")}
            />
          </label>
        ))}

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 8 }}>
          <button
            onClick={onClose}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#ddd",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: 14,
              color: "#333",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#ccc")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#ddd")}
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            style={{
              padding: "8px 16px",
              borderRadius: 6,
              border: "none",
              backgroundColor: "#007bff",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: 14,
              color: "#fff",
              boxShadow: "0 2px 6px rgba(0,123,255,0.5)",
              transition: "background-color 0.2s",
            }}
            onMouseEnter={(e) => (e.target.style.backgroundColor = "#0056b3")}
            onMouseLeave={(e) => (e.target.style.backgroundColor = "#007bff")}
          >
            OK
          </button>
        </div>
      </div>
    </div>
  );
}
