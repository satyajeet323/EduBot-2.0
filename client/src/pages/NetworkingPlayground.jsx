import React, { useState, useRef } from "react";
import CanvasFlow from "../components/cn_comp/CanvasFlow";
import Toolbox from "../components/cn_comp/Toolbox";

const NetworkingPlayground = () => {
  const [selectedNode, setSelectedNode] = useState(null);
  const canvasRef = useRef();

  return (
    <div className="app" style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="topbar" style={{ 
        padding: '1rem', 
        background: '#f8fafc', 
        borderBottom: '1px solid #e2e8f0',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h2 style={{ margin: 0, color: '#334155' }}>EduBot — Networking Playground</h2>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => canvasRef.current?.undo()}
            title="Undo last action"
            style={{
              padding: '0.5rem 1rem',
              background: '#6366f1',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Undo
          </button>

          <button
            onClick={() => canvasRef.current?.redo()}
            title="Redo last undone action"
            style={{
              padding: '0.5rem 1rem',
              background: '#10b981',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Redo
          </button>
        </div>
      </header>

      <div className="workspace" style={{ flex: 1, display: 'flex', height: 'calc(100vh - 80px)' }}>
        <Toolbox />
        <CanvasFlow ref={canvasRef} onNodeClick={setSelectedNode} />
      </div>
    </div>
  );
};

export default NetworkingPlayground;