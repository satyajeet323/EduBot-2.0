import React, {
  forwardRef,
  useCallback,
  useImperativeHandle,
  useRef,
  useState,
  useEffect,
} from "react";
import ReactFlow, {
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  addEdge,
} from "react-flow-renderer";
import DeviceNode from "./DeviceNode";
import { v4 as uuidv4 } from "uuid";
import PCConfigDialog from "./PCConfigDialog";
import RouterConfigDialog from "./RouterConfigDialog";
import ReactMarkdown from "react-markdown";
import { practicalAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";


const nodeTypes = { deviceNode: DeviceNode };
const initialNodes = [];
const initialEdges = [];

const CanvasFlow = forwardRef(({ onNodeClick, selectedTool }, ref) => {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const reactFlowWrapper = useRef(null);
  const [rfInstance, setRfInstance] = useState(null);

  // Undo and Redo stacks
  const undoStack = useRef([]);
  const redoStack = useRef([]);

  // Dialog states
  const [configDialogOpen, setConfigDialogOpen] = useState(false);
  const [configNode, setConfigNode] = useState(null);

  const [routerDialogOpen, setRouterDialogOpen] = useState(false);
  const [routerConfigNode, setRouterConfigNode] = useState(null);

  // Evaluation result state (for temporary card)
  const [evalResult, setEvalResult] = useState(null);
  const [evalLoading, setEvalLoading] = useState(false);
  const [evalError, setEvalError] = useState(null);

  // Question modal state
  const [introModalOpen, setIntroModalOpen] = useState(true);  // Show intro first
  const [questionModalOpen, setQuestionModalOpen] = useState(false); // Question modal hidden initially
  const [questionText, setQuestionText] = useState("");
  const [questionLoading, setQuestionLoading] = useState(false);
  const [questionError, setQuestionError] = useState(null);
  const { updateUser } = useAuth();

  // Undo/Redo logic (same as before)
  const pushToUndoStack = (newNodes, newEdges) => {
    const last = undoStack.current[undoStack.current.length - 1];
    if (
      last &&
      JSON.stringify(last.nodes) === JSON.stringify(newNodes) &&
      JSON.stringify(last.edges) === JSON.stringify(newEdges)
    ) {
      return;
    }
    undoStack.current.push({ nodes: newNodes, edges: newEdges });
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  };

  const updateNodes = (updater) => {
    setNodes((nds) => {
      const updated = typeof updater === "function" ? updater(nds) : updater;
      pushToUndoStack(updated, edges);
      return updated;
    });
  };

  const updateEdges = (updater) => {
    setEdges((eds) => {
      const updated = typeof updater === "function" ? updater(eds) : updater;
      pushToUndoStack(nodes, updated);
      return updated;
    });
  };

  const undo = () => {
    if (undoStack.current.length === 0) return;
    const current = { nodes, edges };
    const previous = undoStack.current.pop();
    if (previous) {
      const isEmpty = previous.nodes.length === 0 && previous.edges.length === 0;
      if (isEmpty) {
        undoStack.current = [{ nodes: [], edges: [] }];
        redoStack.current = [];
      } else {
        redoStack.current.push(current);
      }
      setNodes(previous.nodes);
      setEdges(previous.edges);
    }
  };

  const redo = () => {
    if (redoStack.current.length === 0) return;
    const current = { nodes, edges };
    const next = redoStack.current.pop();
    if (next) {
      undoStack.current.push(current);
      setNodes(next.nodes);
      setEdges(next.edges);
    }
  };

  useImperativeHandle(ref, () => ({
    exportNetwork: () => buildNetworkJSON(nodes, edges),
    undo,
    redo,
  }));

  useEffect(() => {
    pushToUndoStack(initialNodes, initialEdges);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      const { id, data } = e.detail;
      setNodes((nds) => nds.map((n) => (n.id === id ? { ...n, data } : n)));
    };
    window.addEventListener("edubot:updateNodeData", handler);
    return () => window.removeEventListener("edubot:updateNodeData", handler);
  }, [setNodes]);

 const handleInit = (instance) => {
  setRfInstance(instance);
  instance.setViewport({ x: 0, y: 0, zoom: 0.8 });  // Apply initial viewport properly
};


  const handleOnConnectDrag = useCallback(
    (params) => {
      const edgeParams = {
        ...params,
        style: { stroke: "#ff0000", strokeWidth: 3 },
        type: "smoothstep",
      };
      updateEdges((eds) => addEdge(edgeParams, eds));
    },
    [updateEdges]
  );

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const bounds = reactFlowWrapper.current.getBoundingClientRect();
      const data = event.dataTransfer.getData("application/reactflow");
      if (!data) return;
      const parsed = JSON.parse(data);
      if (!rfInstance) return;

      const position = rfInstance.project({
        x: event.clientX - bounds.left,
        y: event.clientY - bounds.top,
      });

      const id = `${parsed.type}-${uuidv4().slice(0, 6)}`;
const baseNode = {
  id,
  type: "deviceNode",
  position,
  data: {
    label: `${parsed.label}-${id.slice(-4)}`,
    deviceType: parsed.type,
    interfaces:
      parsed.type === "pc"
        ? [{ name: "eth0", ip: "", subnetMask: "255.255.255.0", gateway: "" }]
        : parsed.type === "router"
        ? [
            { name: "interfaceA", ip: "", subnetMask: "255.255.255.0" },
            { name: "interfaceB", ip: "", subnetMask: "255.255.255.0" }
          ]
        : [],
    ports: parsed.type === "switch" ? 8 : parsed.type === "router" ? 4 : undefined,
  },
};


      updateNodes((nds) => nds.concat(baseNode));
    },
    [rfInstance, updateNodes]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  const handleNodeClick = (evt, node) => {
    evt.preventDefault();
    evt.stopPropagation();
    if (selectedTool !== "wire" && onNodeClick) onNodeClick(node);
  };

  const handleNodeDoubleClick = useCallback(
    (evt, node) => {
      evt.preventDefault();
      evt.stopPropagation();
      if (node.type === "deviceNode") {
        if (node.data.deviceType === "pc") {
          setConfigNode(node);
          setConfigDialogOpen(true);
        } else if (node.data.deviceType === "router") {
          setRouterConfigNode(node);
          setRouterDialogOpen(true);
        }
      }
    },
    []
  );

  // Save PC config data (ip, subnet, gateway) inside interfaces[0]
  const handleSaveConfig = (newData) => {
    setNodes((nds) =>
      nds.map((n) =>
        n.id === configNode.id
          ? {
              ...n,
              data: {
                ...n.data,
                interfaces: [
                  {
                    ...n.data.interfaces[0],
                    ip: newData.ip,
                    subnetMask: newData.subnetMask,
                    gateway: newData.gateway,
                  },
                ],
              },
            }
          : n
      )
    );
    setConfigDialogOpen(false);
    setConfigNode(null);
  };

  const handleCancelConfig = () => {
    setConfigDialogOpen(false);
    setConfigNode(null);
  };

  // Save Router config data (interfaceA and interfaceB) inside interfaces[0]
const handleSaveRouterConfig = (newData) => {
  setNodes((nds) =>
    nds.map((n) =>
      n.id === routerConfigNode.id
        ? {
            ...n,
            data: {
              ...n.data,
              interfaces: [
                { ...n.data.interfaces[0], ip: newData.interfaceA, subnetMask: "255.255.255.0" },
                { ...n.data.interfaces[1], ip: newData.interfaceB, subnetMask: "255.255.255.0" }
              ],
            },
          }
        : n
    )
  );
  setRouterDialogOpen(false);
  setRouterConfigNode(null);
};


  const handleCancelRouterConfig = () => {
    setRouterDialogOpen(false);
    setRouterConfigNode(null);
  };

  // --- Submit network for evaluation ---
  const handleSubmitNetwork = () => {
    const networkJSON = buildNetworkJSON(nodes, edges);
    setEvalLoading(true);
    setEvalError(null);
    setEvalResult(null);

    fetch("http://localhost:5001/evaluate-network", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({config: networkJSON, question: questionText}),
    })
.then((res) => {
  if (!res.ok) {
    return res.text().then(text => {
      throw new Error(`Server error: ${res.status} ${res.statusText} - ${text}`);
    });
  }
  return res.json();
})

      .then(async (data) => {
        setEvalLoading(false);
        setEvalResult(data);
        // Derive a 0-5 performance score from Gemini evaluation string
        try {
          let score = 0;
          const text = (data?.evaluation || '').toString();
          const m = text.match(/(\b[0-5])\s*\/\s*5|score\s*[:\-]?\s*(\d+)/i);
          if (m) {
            const val = Number(m[1] || m[2]);
            if (!Number.isNaN(val)) score = Math.max(0, Math.min(5, Math.round(val)));
          }
          const submitRes = await practicalAPI.submit({
            subject: 'computerNetworks',
            task: questionText || 'Networking Practical',
            performanceScore: score,
            meta: { rawEvaluation: text }
          });
          const updatedUser = {
            ...(JSON.parse(sessionStorage.getItem('user')) || {}),
            progress: submitRes.data.data.progress,
            moduleProgress: submitRes.data.data.moduleProgress,
            streak: submitRes.data.data.streak,
            lastSolvedDate: submitRes.data.data.lastSolvedDate
          };
          sessionStorage.setItem('user', JSON.stringify(updatedUser));
          updateUser(updatedUser);
        } catch (e) {
          console.error('Practical submit failed:', e);
        }
      })
      .catch((err) => {
        setEvalLoading(false);
        setEvalError(err.message || "Unknown error");
      });
  };

  // --- Fetch generated question on mount ---


  const fetchQuestion = () => {
    setQuestionLoading(true);
    setQuestionError(null);

    fetch("http://localhost:5001/generate-network-question")
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to fetch question: ${res.statusText}`);
        return res.json();
      })
      .then((data) => {
        if (data.status === "success" && data.question) {
          setQuestionText(data.question);
          setQuestionModalOpen(true);
        } else {
          throw new Error("Invalid question response");
        }
        setQuestionLoading(false);
      })
      .catch((err) => {
        setQuestionLoading(false);
        setQuestionError(err.message || "Unknown error");
      });
  };

  return (
    <>
      <div
        className="canvas"
        ref={reactFlowWrapper}
        style={{ flex: 1, position: "relative", background: "#0b1220" }}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onInit={handleInit}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onNodeClick={handleNodeClick}
          onNodeDoubleClick={handleNodeDoubleClick}
          onConnect={handleOnConnectDrag}
          nodeTypes={nodeTypes}
          fitView
          // defaultViewport={{ x: 0, y: 0, zoom: 0.8 }} // 👈 Zoomed out to 80%

        >
          <Controls />
          <Background color="#1a1a1a" gap={16} />
        </ReactFlow>

        {/* Submit Button - fixed bottom right corner */}
        <div
          style={{
            position: "absolute",
            bottom: 20,
            right: 20,
            zIndex: 10,
          }}
        >
          <button
            onClick={handleSubmitNetwork}
            disabled={evalLoading}
            style={{
              padding: "10px 20px",
              fontSize: 16,
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: evalLoading ? "not-allowed" : "pointer",
            }}
          >
            {evalLoading ? "Evaluating..." : "Submit Network"}
          </button>
        </div>

        {/* View Question Button - top right corner */}
        <div
          style={{
            position: "absolute",
            top: 20,
            right: 20,
            zIndex: 20,
          }}
        >
          <button
            onClick={() => setQuestionModalOpen(true)}
            disabled={questionLoading}
            style={{
              padding: "8px 16px",
              fontSize: 14,
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: questionLoading ? "not-allowed" : "pointer",
            }}
            title="View Question"
          >
            {questionLoading ? "Loading..." : "View Question"}
          </button>
        </div>

{evalResult && evalResult.evaluation && (
  <div
    style={{
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
      width: "80vw",
      maxWidth: 600,
      maxHeight: "70vh",
      overflowY: "auto",
      backgroundColor: "rgba(0, 0, 0, 0.85)",
      color: "white",
      padding: 20,
      borderRadius: 8,
      zIndex: 50,
      boxShadow: "0 0 20px rgba(39, 199, 231, 0.7)",
    }}
  >
    <h3>Evaluation Result</h3>
    <ReactMarkdown
      style={{ fontSize: 14, lineHeight: 1.3 }}
    >
      {evalResult.evaluation}
    </ReactMarkdown>
    <button
      onClick={() => setEvalResult(null)}
      style={{
        marginTop: 10,
        padding: "6px 12px",
        fontSize: 14,
        backgroundColor: "#dc3545",
        border: "none",
        borderRadius: 4,
        color: "white",
        cursor: "pointer",
      }}
    >
      Close
    </button>
  </div>
)}


{/* Introduction Modal */}
{introModalOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}
  >
    <div
      style={{
        backgroundColor: "#222",
        color: "white",
        padding: 30,
        borderRadius: 10,
        width: "80vw",
        maxWidth: 600,
        maxHeight: "70vh",
        overflowY: "auto",
        boxShadow: "0 0 20px rgba(41, 140, 216, 0.7)",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <h2
        style={{
          fontWeight: "bold",
          color: "#00ffff",
          marginTop: 0,
          marginBottom: 24,
          textAlign: "center",
        }}
      >
        Welcome to the Networking Playground
      </h2>

      <div
        style={{
          fontSize: 16,
          lineHeight: 1.5,
          whiteSpace: "pre-wrap",
          userSelect: "text",
          flex: 1,
        }}
      >
        {/* Instructions with bold neon-blue headings */}
        <span
          style={{
            fontWeight: "bold",
            color: "#00ffff",
            display: "block",
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          1. Select Network Components:
        </span>
        On the left sidebar, you’ll find various network devices such as PCs, routers, and switches. Click on any device type to select it.

        <br />
        <br />

        <span
          style={{
            fontWeight: "bold",
            color: "#00ffff",
            display: "block",
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          2. Add Devices to the Canvas:
        </span>
        Drag your chosen device from the sidebar and drop it onto the main canvas area. Repeat to add as many devices as needed.

        <br />
        <br />

        <span
          style={{
            fontWeight: "bold",
            color: "#00ffff",
            display: "block",
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          3. Connect Devices:
        </span>
        To create connections between devices, click and drag from one device’s port (small connection point) to another device’s port. These connections represent network cables.

        <br />
        <br />

        <span
          style={{
            fontWeight: "bold",
            color: "#00ffff",
            display: "block",
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          4. Configure Devices:
        </span>
        Click on any device node to open its configuration dialog. Here you can assign IP addresses, subnet masks, and set up interfaces or gateways as needed. Proper configuration is essential for the network to work correctly.

        <br />
        <br />

        <span
          style={{
            fontWeight: "bold",
            color: "#00ffff",
            display: "block",
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          5. Arrange Your Network:
        </span>
        Move devices around on the canvas to organize your network visually. Try to keep connections clear and easy to follow.

        <br />
        <br />

        <span
          style={{
            fontWeight: "bold",
            color: "#00ffff",
            display: "block",
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          6. Submit Your Network:
        </span>
        Once your network is complete and configured, click the Submit Network button (bottom right) to send your design for evaluation.

        <br />
        <br />

        <span
          style={{
            fontWeight: "bold",
            color: "#00ffff",
            display: "block",
            marginTop: 10,
            marginBottom: 6,
          }}
        >
          7. Review Feedback:
        </span>
        After submission, you will receive detailed feedback on your network design, including correctness and suggestions for improvement.

        <br />
        <br />

        Click the button below to generate a new question and start!
      </div>

      {/* Generate Question Button - centered at bottom */}
      <button
        onClick={() => {
          setIntroModalOpen(false);
          fetchQuestion();      // Fetch question when user clicks generate
          setQuestionModalOpen(true); // Show question modal after intro
        }}
        style={{
          marginTop: 30,
          alignSelf: "center",
          padding: "10px 30px",
          fontSize: 16,
          backgroundColor: "#2b96baff",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        Generate Question
      </button>
    </div>
  </div>
)}




        {/* Error display */}
        {evalError && (
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 20,
              width: 320,
              backgroundColor: "#dc3545",
              color: "white",
              padding: 15,
              borderRadius: 8,
              zIndex: 10,
              boxShadow: "0 0 10px rgba(0,0,0,0.7)",
            }}
          >
            <strong>Error:</strong> {evalError}
            <button
              onClick={() => setEvalError(null)}
              style={{
                marginTop: 10,
                padding: "6px 12px",
                fontSize: 14,
                backgroundColor: "#6c757d",
                border: "none",
                borderRadius: 4,
                color: "white",
                cursor: "pointer",
              }}
            >
              Close
            </button>
          </div>
        )}
      </div>

{/* Question Modal */}
{questionModalOpen && (
  <div
    style={{
      position: "fixed",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      backgroundColor: "rgba(0,0,0,0.7)",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      zIndex: 50,
    }}
    onClick={() => setQuestionModalOpen(false)} // clicking outside closes modal
  >
    <div
      style={{
        backgroundColor: "#222",
        color: "white",
        padding: 30,
        borderRadius: 10,
        width: "80vw",
        maxWidth: 600,
        maxHeight: "70vh",
        overflowY: "auto",
        boxShadow: "0 0 20px rgba(39, 199, 231, 0.7)",
        position: "relative",
      }}
      onClick={(e) => e.stopPropagation()} // prevent modal close on clicking inside
    >
      <h2 style={{ marginTop: 0, marginBottom: 15 }}>Generated Networking Question</h2>
      {questionLoading && <p>Loading question...</p>}
      {questionError && (
        <p style={{ color: "red" }}>
          Error loading question: {questionError}
        </p>
      )}
      {!questionLoading && !questionError && (
        <pre
          style={{
            whiteSpace: "pre-wrap",
            wordBreak: "break-word",
            fontSize: 16,
            lineHeight: 1.4,
          }}
        >
          {questionText.replace(/\*\*/g, "")}
        </pre>
      )}

      <button
        onClick={() => setQuestionModalOpen(false)}
        style={{
          marginTop: 20,
          padding: "10px 20px",
          fontSize: 16,
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: 6,
          cursor: "pointer",
        }}
      >
        OK
      </button>
    </div>
  </div>
)}



      {/* PC Config Dialog */}
      <PCConfigDialog
        open={configDialogOpen}
        initialData={configNode?.data?.interfaces?.[0]}
        onSave={handleSaveConfig}
        onClose={handleCancelConfig}
      />

      {/* Router Config Dialog */}
      <RouterConfigDialog
        open={routerDialogOpen}
        initialData={routerConfigNode?.data?.interfaces?.[0]}
        onSave={handleSaveRouterConfig}
        onClose={handleCancelRouterConfig}
      />
    </>
  );
});

export default CanvasFlow;

// Export function to build JSON from nodes and edges
export function buildNetworkJSON(nodes, edges) {
  return {
    nodes: nodes.map((node) => ({
      id: node.id,
      label: node.data.label,
      deviceType: node.data.deviceType,
      position: node.position,
      interfaces: node.data.interfaces || [],
      ports: node.data.ports || null,
    })),
    edges: edges.map((edge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      sourceHandle: edge.sourceHandle,
      targetHandle: edge.targetHandle,
      type: edge.type,
      style: edge.style,
    })),
  };
}
