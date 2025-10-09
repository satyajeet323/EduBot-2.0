import React from "react";

const tools = [
  { type: "pc", label: "PC" },
  { type: "switch", label: "Switch" },
  { type: "router", label: "Router" },
];

const iconMap = {
  pc: "/images/PCICON.png",
  switch: "/images/SWITCHICON.png",
  router: "/images/ROUTER1ICON.png",
};

// Inline styles based on the provided CSS
const styles = {
  toolbox: {
    background: "#071026",
    padding: "12px",
    borderRadius: "8px",
  },
  toolboxH3: {
    margin: "0 0 8px 0", 
    fontSize: "16px",
    color: "white"
  },
  toolboxItem: {
    display: "flex",
    gap: "8px",
    alignItems: "center",
    padding: "8px",
    marginBottom: "8px",
    borderRadius: "6px",
    background: "rgba(255,255,255,0.02)",
    cursor: "grab",
    color: "white"
  },
  hint: {
    color: "#9aa6b2", 
    fontSize: "12px", 
    marginTop: "8px"
  }
};

export default function Toolbox({ onSelectTool }) {
  const onDragStart = (event, device) => {
    event.dataTransfer.setData(
      "application/reactflow",
      JSON.stringify(device)
    );
    event.dataTransfer.effectAllowed = "move";
  };

  return (
    <aside style={styles.toolbox}>
      <h3 style={styles.toolboxH3}>Toolbox</h3>
      {tools.map((t) => (
        <div
          key={t.type}
          style={styles.toolboxItem}
          draggable
          onDragStart={(e) => onDragStart(e, t)}
        >
          <img
            src={iconMap[t.type]}
            alt={`${t.label} icon`}
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              flexShrink: 0,
              objectFit: "contain",
            }}
          />
          <span>{t.label}</span>
        </div>
      ))}
      <div style={styles.hint}>Drag devices to the canvas to add</div>
    </aside>
  );
}