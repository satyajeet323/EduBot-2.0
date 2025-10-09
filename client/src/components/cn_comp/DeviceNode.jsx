import React from "react";
import { Handle, Position } from "react-flow-renderer";

export default function DeviceNode({ data }) {
  const iconMap = {
    pc: "/images/PCICON.png",
    switch: "/images/SWITCHICON.png",
    router: "/images/ROUTER1ICON.png",
  };

  const iconSrc = iconMap[data.deviceType] || null;

  const iface = data.interfaces && data.interfaces.length > 0 ? data.interfaces[0] : null;

  return (
    <div
      className="device-node"
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "flex-start",
        padding: "6px 8px",
        border: "1px solid #555",
        borderRadius: 5,
        backgroundColor: "#1e2530",
        color: "#fff",
        fontSize: 10,
        width: 130,
        gap: 4,
        boxSizing: "border-box",
        position: "relative",
        wordBreak: "break-word",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      }}
    >
      {/* Target handle on the left */}
      <Handle
        type="target"
        position={Position.Left}
        id="input"
        style={{
          background: "#555",
          width: 7,
          height: 7,
          top: "50%",
          transform: "translateY(-50%)",
          borderRadius: "50%",
          position: "absolute",
          left: -3,
          cursor: "pointer",
        }}
      />

      <div style={{ display: "flex", alignItems: "center", gap: 8, width: "100%" }}>
        {iconSrc ? (
          <img
            src={iconSrc}
            alt={`${data.deviceType} icon`}
            style={{
              width: 25,
              height: 25,
              borderRadius: 3,
              flexShrink: 0,
              objectFit: "cover",
              transform: "scale(1.6)",
              transformOrigin: "center",
            }}
          />
        ) : (
          <div
            style={{
              width: 25,
              height: 25,
              backgroundColor: "#666",
              borderRadius: 3,
              flexShrink: 0,
            }}
          />
        )}

        <div
          className="device-label"
          style={{
            overflowWrap: "break-word",
            wordBreak: "break-word",
            flexGrow: 1,
            lineHeight: 1.1,
            whiteSpace: "normal",
            overflow: "visible",
            textOverflow: "clip",
            fontSize: 12,
            fontWeight: "600",
          }}
        >
          {data.label}
        </div>
      </div>

      {/* PC network info */}
      {data.deviceType === "pc" && iface && (
        <div
          className="pc-network-info"
          style={{
            marginTop: 2,
            fontSize: 4, // very very small font
            color: "#bbb",
            width: "100%",
            backgroundColor: "#2a3240",
            padding: "1px 3px",
            borderRadius: 4,
            lineHeight: 1.1,
            userSelect: "text",
            fontWeight: "400",
          }}
        >
          <div>
            <strong style={{ fontWeight: "600" }}>IP:</strong> {iface.ip || <em>Not set</em>}
          </div>
          <div>
            <strong style={{ fontWeight: "600" }}>Subnet:</strong> {iface.subnetMask || <em>Not set</em>}
          </div>
          <div>
            <strong style={{ fontWeight: "600" }}>Gateway:</strong> {iface.gateway || <em>Not set</em>}
          </div>
        </div>
      )}

{data.deviceType === "router" && data.interfaces && (
  <div
    className="router-network-info"
    style={{
      marginTop: 2,
      fontSize: 4,
      color: "#bbb",
      width: "100%",
      backgroundColor: "#2a3240",
      padding: "1px 3px",
      borderRadius: 4,
      lineHeight: 1.1,
      userSelect: "text",
      fontWeight: "400",
    }}
  >
    <div>
      <strong style={{ fontWeight: "600" }}>Interface A:</strong>{" "}
      {data.interfaces[0]?.ip || <em>Not set</em>}
    </div>
    <div>
      <strong style={{ fontWeight: "600" }}>Interface B:</strong>{" "}
      {data.interfaces[1]?.ip || <em>Not set</em>}
    </div>
  </div>
)}


      {/* Source handle on the right */}
      <Handle
        type="source"
        position={Position.Right}
        id="output"
        style={{
          background: "#555",
          width: 7,
          height: 7,
          top: "50%",
          transform: "translateY(-50%)",
          borderRadius: "50%",
          position: "absolute",
          right: -3,
          cursor: "pointer",
        }}
      />
    </div>
  );
}
