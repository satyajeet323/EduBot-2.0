import React, { forwardRef, useCallback, useImperativeHandle, useRef, useState, useEffect } from "react";
import ReactFlow, { Background, Controls, useNodesState, useEdgesState, addEdge } from "react-flow-renderer";
import DeviceNode from "./DeviceNode";
import { v4 as uuidv4 } from "uuid";
import PCConfigDialog from "./PCConfigDialog";
import RouterConfigDialog from "./RouterConfigDialog";
import ReactMarkdown from "react-markdown";
import { practicalAPI } from "../../services/api";
import { useAuth } from "../../hooks/useAuth";
import { Send, Eye, X, AlertCircle, CheckCircle, Loader, BookOpen, Zap } from "lucide-react";

const nodeTypes = { deviceNode: DeviceNode };
const getIsDark = () => document.documentElement.classList.contains("dark");

function ThemedModal(props) {
  var open = props.open;
  var onClose = props.onClose;
  var title = props.title;
  var Icon = props.icon;
  var accentHex = props.accentHex;
  var children = props.children;
  var dark = props.dark;
  var maxW = props.maxW || 580;

  if (!open) return null;

  var acc = accentHex || "#06b6d4";
  var bg  = dark ? "#111827" : "#ffffff";
  var bdr = dark ? acc + "44" : acc + "55";
  var txt = dark ? "#f1f5f9" : "#0f172a";
  var sub = dark ? "#64748b" : "#94a3b8";

  return React.createElement("div",
    {
      style: { position:"fixed", inset:0, background:"rgba(0,0,0,0.7)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:50, backdropFilter:"blur(6px)" },
      onClick: onClose
    },
    React.createElement("div",
      {
        style: { background:bg, border:"1px solid "+bdr, borderRadius:14, width:"min("+maxW+"px,92vw)", maxHeight:"80vh", overflowY:"auto", padding:"24px 28px", boxShadow:"0 24px 48px rgba(0,0,0,0.5)", display:"flex", flexDirection:"column", gap:16 },
        onClick: function(e) { e.stopPropagation(); }
      },
      React.createElement("div",
        { style: { display:"flex", alignItems:"center", justifyContent:"space-between" } },
        React.createElement("div",
          { style: { display:"flex", alignItems:"center", gap:10 } },
          Icon && React.createElement("div",
            { style: { width:32, height:32, borderRadius:8, background:acc+"18", border:"1px solid "+acc+"35", display:"flex", alignItems:"center", justifyContent:"center" } },
            React.createElement(Icon, { size:16, color:acc })
          ),
          React.createElement("div", { style: { color:txt, fontWeight:700, fontSize:15 } }, title)
        ),
        React.createElement("button",
          {
            onClick: onClose,
            style: { background:"transparent", border:"none", cursor:"pointer", color:sub, padding:4, borderRadius:6, display:"flex" }
          },
          React.createElement(X, { size:16 })
        )
      ),
      React.createElement("div", { style: { height:1, background:bdr } }),
      children({ txt:txt, sub:sub, bdr:bdr, acc:acc })
    )
  );
}

var CanvasFlow = forwardRef(function(props, ref) {
  var onNodeClick = props.onNodeClick;

  var nodesState = useNodesState([]);
  var nodes = nodesState[0];
  var setNodes = nodesState[1];
  var onNodesChange = nodesState[2];

  var edgesState = useEdgesState([]);
  var edges = edgesState[0];
  var setEdges = edgesState[1];
  var onEdgesChange = edgesState[2];

  var reactFlowWrapper = useRef(null);
  var rfInstanceState = useState(null);
  var rfInstance = rfInstanceState[0];
  var setRfInstance = rfInstanceState[1];

  var undoStack = useRef([]);
  var redoStack = useRef([]);

  var configState = useState(false);
  var configDialogOpen = configState[0];
  var setConfigDialogOpen = configState[1];

  var configNodeState = useState(null);
  var configNode = configNodeState[0];
  var setConfigNode = configNodeState[1];

  var routerState = useState(false);
  var routerDialogOpen = routerState[0];
  var setRouterDialogOpen = routerState[1];

  var routerNodeState = useState(null);
  var routerConfigNode = routerNodeState[0];
  var setRouterConfigNode = routerNodeState[1];

  var evalResultState = useState(null);
  var evalResult = evalResultState[0];
  var setEvalResult = evalResultState[1];

  var evalLoadingState = useState(false);
  var evalLoading = evalLoadingState[0];
  var setEvalLoading = evalLoadingState[1];

  var evalErrorState = useState(null);
  var evalError = evalErrorState[0];
  var setEvalError = evalErrorState[1];

  var introState = useState(true);
  var introOpen = introState[0];
  var setIntroOpen = introState[1];

  var qOpenState = useState(false);
  var questionOpen = qOpenState[0];
  var setQuestionOpen = qOpenState[1];

  var qTextState = useState("");
  var questionText = qTextState[0];
  var setQuestionText = qTextState[1];

  var qLoadState = useState(false);
  var questionLoading = qLoadState[0];
  var setQuestionLoading = qLoadState[1];

  var qErrState = useState(null);
  var questionError = qErrState[0];
  var setQuestionError = qErrState[1];

  var darkState = useState(getIsDark);
  var dark = darkState[0];
  var setDark = darkState[1];

  var authCtx = useAuth();
  var updateUser = authCtx.updateUser;

  useEffect(function() {
    var obs = new MutationObserver(function() { setDark(getIsDark()); });
    obs.observe(document.documentElement, { attributes:true, attributeFilter:["class"] });
    return function() { obs.disconnect(); };
  }, []);

  function pushUndo(nds, eds) {
    var last = undoStack.current[undoStack.current.length - 1];
    if (last && JSON.stringify(last.nodes) === JSON.stringify(nds) && JSON.stringify(last.edges) === JSON.stringify(eds)) return;
    undoStack.current.push({ nodes:nds, edges:eds });
    if (undoStack.current.length > 50) undoStack.current.shift();
    redoStack.current = [];
  }

  function updateNodes(fn) {
    setNodes(function(nds) {
      var u = typeof fn === "function" ? fn(nds) : fn;
      pushUndo(u, edges);
      return u;
    });
  }

  function updateEdges(fn) {
    setEdges(function(eds) {
      var u = typeof fn === "function" ? fn(eds) : fn;
      pushUndo(nodes, u);
      return u;
    });
  }

  function undo() {
    if (!undoStack.current.length) return;
    var prev = undoStack.current.pop();
    redoStack.current.push({ nodes:nodes, edges:edges });
    setNodes(prev.nodes);
    setEdges(prev.edges);
  }

  function redo() {
    if (!redoStack.current.length) return;
    var next = redoStack.current.pop();
    undoStack.current.push({ nodes:nodes, edges:edges });
    setNodes(next.nodes);
    setEdges(next.edges);
  }

  useImperativeHandle(ref, function() {
    return { exportNetwork: function() { return buildNetworkJSON(nodes, edges); }, undo:undo, redo:redo };
  });

  useEffect(function() { pushUndo([], []); }, []);

  useEffect(function() {
    function h(e) {
      var id = e.detail.id;
      var data = e.detail.data;
      setNodes(function(nds) { return nds.map(function(n) { return n.id === id ? Object.assign({}, n, { data:data }) : n; }); });
    }
    window.addEventListener("edubot:updateNodeData", h);
    return function() { window.removeEventListener("edubot:updateNodeData", h); };
  }, [setNodes]);

  function handleInit(inst) {
    setRfInstance(inst);
    inst.setViewport({ x:0, y:0, zoom:0.8 });
  }

  var onConnect = useCallback(function(params) {
    updateEdges(function(eds) {
      return addEdge(Object.assign({}, params, { style:{ stroke:"#06b6d4", strokeWidth:2 }, type:"smoothstep", animated:true }), eds);
    });
  }, [updateEdges]);

  var onDrop = useCallback(function(e) {
    e.preventDefault();
    var bounds = reactFlowWrapper.current.getBoundingClientRect();
    var raw = e.dataTransfer.getData("application/reactflow");
    if (!raw || !rfInstance) return;
    var parsed = JSON.parse(raw);
    var position = rfInstance.project({ x: e.clientX - bounds.left, y: e.clientY - bounds.top });
    var id = parsed.type + "-" + uuidv4().slice(0, 6);
    var ifaces = parsed.type === "pc"
      ? [{ name:"eth0", ip:"", subnetMask:"255.255.255.0", gateway:"" }]
      : parsed.type === "router"
      ? [{ name:"ifA", ip:"", subnetMask:"255.255.255.0" }, { name:"ifB", ip:"", subnetMask:"255.255.255.0" }]
      : [];
    updateNodes(function(nds) {
      return nds.concat([{
        id:id, type:"deviceNode", position:position,
        data:{ label:parsed.label+"-"+id.slice(-4), deviceType:parsed.type, interfaces:ifaces, ports: parsed.type==="switch"?8:parsed.type==="router"?4:undefined }
      }]);
    });
  }, [rfInstance, updateNodes]);

  var onDragOver = useCallback(function(e) { e.preventDefault(); e.dataTransfer.dropEffect = "move"; }, []);

  var handleNodeDoubleClick = useCallback(function(e, node) {
    e.preventDefault(); e.stopPropagation();
    if (node.data.deviceType === "pc") { setConfigNode(node); setConfigDialogOpen(true); }
    else if (node.data.deviceType === "router") { setRouterConfigNode(node); setRouterDialogOpen(true); }
  }, []);

  function handleSaveConfig(d) {
    setNodes(function(nds) {
      return nds.map(function(n) {
        if (n.id !== configNode.id) return n;
        var iface = Object.assign({}, n.data.interfaces[0], { ip:d.ip, subnetMask:d.subnetMask, gateway:d.gateway });
        return Object.assign({}, n, { data: Object.assign({}, n.data, { interfaces:[iface] }) });
      });
    });
    setConfigDialogOpen(false); setConfigNode(null);
  }

  function handleSaveRouterConfig(d) {
    setNodes(function(nds) {
      return nds.map(function(n) {
        if (n.id !== routerConfigNode.id) return n;
        var ifA = Object.assign({}, n.data.interfaces[0], { ip:d.interfaceA, subnetMask:"255.255.255.0" });
        var ifB = Object.assign({}, n.data.interfaces[1], { ip:d.interfaceB, subnetMask:"255.255.255.0" });
        return Object.assign({}, n, { data: Object.assign({}, n.data, { interfaces:[ifA, ifB] }) });
      });
    });
    setRouterDialogOpen(false); setRouterConfigNode(null);
  }

  function fetchQuestion() {
    setQuestionLoading(true); setQuestionError(null);
    fetch("/api/network/generate-question")
      .then(function(r) { if (!r.ok) throw new Error(r.statusText); return r.json(); })
      .then(function(d) {
        if (d.status === "success" && d.question) { setQuestionText(d.question); setQuestionOpen(true); }
        else throw new Error("Invalid response");
        setQuestionLoading(false);
      })
      .catch(function(e) { setQuestionLoading(false); setQuestionError(e.message); });
  }

  function handleSubmit() {
    setEvalLoading(true); setEvalError(null); setEvalResult(null);
    fetch("/api/network/evaluate", {
      method:"POST",
      headers:{ "Content-Type":"application/json" },
      body: JSON.stringify({ config: buildNetworkJSON(nodes, edges), question: questionText })
    })
      .then(function(r) { if (!r.ok) throw new Error(r.status + " " + r.statusText); return r.json(); })
      .then(function(d) {
        setEvalLoading(false); setEvalResult(d);
        var text = (d && d.evaluation ? d.evaluation : "").toString();
        var m = text.match(/(\b[0-5])\s*\/\s*5|score\s*[:\-]?\s*(\d+)/i);
        var score = m ? Math.max(0, Math.min(5, Math.round(Number(m[1] || m[2])))) : 0;
        practicalAPI.submit({ subject:"computerNetworks", task: questionText || "Networking Practical", performanceScore:score, meta:{ rawEvaluation:text } })
          .then(function(res) {
            var stored = sessionStorage.getItem("user");
            var prev = stored ? JSON.parse(stored) : {};
            var updated = Object.assign({}, prev, { progress:res.data.data.progress, moduleProgress:res.data.data.moduleProgress, streak:res.data.data.streak });
            sessionStorage.setItem("user", JSON.stringify(updated));
            updateUser(updated);
          })
          .catch(function(err) { console.error("Practical submit failed:", err); });
      })
      .catch(function(e) { setEvalLoading(false); setEvalError(e.message); });
  }

  var canvasBg = dark ? "#060d1a" : "#f0f9ff";
  var txtSub   = dark ? "#94a3b8" : "#64748b";
  var ghostBdr = dark ? "rgba(148,163,184,0.15)" : "#e2e8f0";

  var submitStyle = { display:"flex", alignItems:"center", gap:6, padding:"9px 18px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#06b6d4,#3b82f6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 14px rgba(6,182,212,0.4)", fontFamily:"'Inter','Segoe UI',sans-serif", transition:"opacity 0.2s" };
  var ghostStyle = { display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:8, border:"1px solid "+ghostBdr, background:"transparent", color:txtSub, fontSize:12, fontWeight:600, cursor:"pointer", transition:"all 0.2s", fontFamily:"'Inter','Segoe UI',sans-serif" };

  return (
    <>
      <div ref={reactFlowWrapper} style={{ flex:1, position:"relative", background:canvasBg }}>
        <ReactFlow
          nodes={nodes} edges={edges}
          onNodesChange={onNodesChange} onEdgesChange={onEdgesChange}
          onInit={handleInit} onDrop={onDrop} onDragOver={onDragOver}
          onNodeClick={function(e, n) { e.preventDefault(); e.stopPropagation(); if (onNodeClick) onNodeClick(n); }}
          onNodeDoubleClick={handleNodeDoubleClick}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
        >
          <Controls style={{ background: dark ? "#111827" : "#fff", border:"1px solid "+(dark ? "rgba(6,182,212,0.15)" : "#e2e8f0"), borderRadius:8 }} />
          <Background color={dark ? "#1e293b" : "#bae6fd"} gap={20} size={1} />
        </ReactFlow>

        <div style={{ position:"absolute", top:16, right:16, zIndex:20 }}>
          <button onClick={function() { setQuestionOpen(true); }} disabled={questionLoading} style={ghostStyle}
            onMouseEnter={function(e) { e.currentTarget.style.borderColor="#22d3ee"; e.currentTarget.style.color="#22d3ee"; }}
            onMouseLeave={function(e) { e.currentTarget.style.borderColor=ghostBdr; e.currentTarget.style.color=txtSub; }}>
            <Eye size={13} />
            {questionLoading ? "Loading..." : "View Question"}
          </button>
        </div>

        <div style={{ position:"absolute", bottom:20, right:20, zIndex:10 }}>
          <button onClick={handleSubmit} disabled={evalLoading} style={Object.assign({}, submitStyle, { opacity: evalLoading ? 0.7 : 1 })}
            onMouseEnter={function(e) { if (!evalLoading) e.currentTarget.style.opacity="0.85"; }}
            onMouseLeave={function(e) { e.currentTarget.style.opacity = evalLoading ? "0.7" : "1"; }}>
            {evalLoading
              ? <><Loader size={14} style={{ animation:"spin 1s linear infinite" }} /> Evaluating...</>
              : <><Send size={14} /> Submit Network</>}
          </button>
        </div>

        {evalError && (
          <div style={{ position:"absolute", top:60, right:16, zIndex:30, background: dark ? "#1e1b1b" : "#fff", border:"1px solid #f87171", borderRadius:10, padding:"12px 16px", maxWidth:320, boxShadow:"0 4px 20px rgba(248,113,113,0.2)", display:"flex", gap:10, alignItems:"flex-start" }}>
            <AlertCircle size={16} color="#f87171" style={{ flexShrink:0, marginTop:1 }} />
            <div>
              <div style={{ color:"#f87171", fontWeight:700, fontSize:13, marginBottom:4 }}>Evaluation Error</div>
              <div style={{ color: dark ? "#94a3b8" : "#64748b", fontSize:12 }}>{evalError}</div>
            </div>
            <button onClick={function() { setEvalError(null); }} style={{ background:"transparent", border:"none", cursor:"pointer", color:"#94a3b8", marginLeft:"auto", padding:2 }}>
              <X size={14} />
            </button>
          </div>
        )}
      </div>

      <ThemedModal open={introOpen} onClose={function() { setIntroOpen(false); }} title="Networking Playground" icon={Zap} accentHex="#06b6d4" dark={dark} maxW={600}>
        {function(p) {
          return (
            <>
              <div style={{ color:p.sub, fontSize:13, lineHeight:1.7 }}>
                {[
                  ["Select Devices",  "Choose PCs, Switches, or Routers from the left sidebar."],
                  ["Add to Canvas",   "Drag any device onto the canvas to place it."],
                  ["Connect Devices", "Drag from a node handle to another to create a cable."],
                  ["Configure",       "Double-click any device to set IP, subnet mask, and gateway."],
                  ["Submit",          "Click Submit Network (bottom-right) to get AI evaluation."],
                ].map(function(item, i) {
                  return (
                    <div key={i} style={{ display:"flex", gap:12, marginBottom:12 }}>
                      <div style={{ width:22, height:22, borderRadius:6, background:"rgba(6,182,212,0.12)", border:"1px solid rgba(6,182,212,0.25)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:800, color:"#22d3ee", fontFamily:"monospace" }}>
                        {i + 1}
                      </div>
                      <div><span style={{ color:p.txt, fontWeight:600 }}>{item[0]}: </span>{item[1]}</div>
                    </div>
                  );
                })}
              </div>
              <button
                onClick={function() { setIntroOpen(false); fetchQuestion(); }}
                style={{ alignSelf:"center", padding:"10px 32px", borderRadius:8, border:"none", background:"linear-gradient(135deg,#06b6d4,#3b82f6)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 16px rgba(6,182,212,0.35)", marginTop:4 }}
                onMouseEnter={function(e) { e.currentTarget.style.opacity="0.85"; }}
                onMouseLeave={function(e) { e.currentTarget.style.opacity="1"; }}>
                Generate Question &amp; Start
              </button>
            </>
          );
        }}
      </ThemedModal>

      <ThemedModal open={questionOpen} onClose={function() { setQuestionOpen(false); }} title="Network Question" icon={BookOpen} accentHex="#06b6d4" dark={dark}>
        {function(p) {
          return (
            <>
              {questionLoading && <div style={{ color:p.sub, fontSize:13 }}>Loading question...</div>}
              {questionError   && <div style={{ color:"#f87171", fontSize:13 }}>Error: {questionError}</div>}
              {!questionLoading && !questionError && (
                <div style={{ color: dark ? "#cbd5e1" : "#334155", fontSize:14, lineHeight:1.8, whiteSpace:"pre-wrap" }}>
                  {questionText.replace(/\*\*/g, "")}
                </div>
              )}
              <button onClick={function() { setQuestionOpen(false); }}
                style={{ alignSelf:"flex-end", padding:"8px 22px", borderRadius:7, border:"none", background:"linear-gradient(135deg,#06b6d4,#3b82f6)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                OK
              </button>
            </>
          );
        }}
      </ThemedModal>

      <ThemedModal open={!!(evalResult && evalResult.evaluation)} onClose={function() { setEvalResult(null); }} title="Evaluation Result" icon={CheckCircle} accentHex="#10b981" dark={dark} maxW={640}>
        {function(p) {
          return (
            <>
              <div style={{ color: dark ? "#cbd5e1" : "#334155", fontSize:13, lineHeight:1.8 }}>
                <ReactMarkdown>{evalResult ? evalResult.evaluation : ""}</ReactMarkdown>
              </div>
              <button onClick={function() { setEvalResult(null); }}
                style={{ alignSelf:"flex-end", padding:"8px 22px", borderRadius:7, border:"none", background:"linear-gradient(135deg,#10b981,#059669)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                Close
              </button>
            </>
          );
        }}
      </ThemedModal>

      <PCConfigDialog
        open={configDialogOpen}
        initialData={configNode && configNode.data && configNode.data.interfaces ? configNode.data.interfaces[0] : null}
        onSave={handleSaveConfig}
        onClose={function() { setConfigDialogOpen(false); setConfigNode(null); }}
      />
      <RouterConfigDialog
        open={routerDialogOpen}
        initialData={routerConfigNode && routerConfigNode.data && routerConfigNode.data.interfaces ? routerConfigNode.data.interfaces[0] : null}
        onSave={handleSaveRouterConfig}
        onClose={function() { setRouterDialogOpen(false); setRouterConfigNode(null); }}
      />

      <style>{"@keyframes spin { to { transform: rotate(360deg); } }"}</style>
    </>
  );
});

export default CanvasFlow;

export function buildNetworkJSON(nodes, edges) {
  return {
    nodes: nodes.map(function(n) {
      return { id:n.id, label:n.data.label, deviceType:n.data.deviceType, position:n.position, interfaces:n.data.interfaces||[], ports:n.data.ports||null };
    }),
    edges: edges.map(function(e) {
      return { id:e.id, source:e.source, target:e.target, sourceHandle:e.sourceHandle, targetHandle:e.targetHandle, type:e.type, style:e.style };
    }),
  };
}
