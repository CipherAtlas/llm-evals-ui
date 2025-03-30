// src/components/FlowCanvas.tsx
"use client";

import React, { useEffect, useRef, useCallback, useState } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Edge,
} from "react-flow-renderer";
import ModelNode from "./NodeComponents/ModelNode";
import OutputNode from "./NodeComponents/OutputNode";
import MasterInputNode from "./NodeComponents/MasterInputNode";
import TextNode from "./NodeComponents/TextNode";
import SimpleWhiteEdge from "./Edges/SimpleWhiteEdge";

const nodeTypes = {
  modelNode: ModelNode,
  outputNode: OutputNode,
  masterInputNode: MasterInputNode,
  textNode: TextNode,
};

const edgeTypes = {
  simpleWhiteEdge: SimpleWhiteEdge,
};

let id = 0;
const getId = () => `node_${id++}`;
let edgeId = 0;
const getEdgeId = () => `edge_${edgeId++}`;

export default function FlowCanvas() {
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [showLoadMenu, setShowLoadMenu] = useState(false);
  const [savedStates, setSavedStates] = useState<any[]>([]);
  const [saveName, setSaveName] = useState("");
  const nodesRef = useRef(nodes);
  useEffect(() => {
    nodesRef.current = nodes;
  }, [nodes]);

  const updateNodeData = (nodeId: string, newData: any) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...newData } } : node
      )
    );
  };

  const deleteNode = (nodeId: string) => {
    setNodes((nds) => nds.filter((node) => node.id !== nodeId));
    setEdges((eds) =>
      eds.filter((edge) => edge.source !== nodeId && edge.target !== nodeId)
    );
  };

  // --- Persistence Functions ---
  const saveCanvasState = useCallback(async () => {
    const state = { nodes, edges };
    try {
      const res = await fetch("/api/canvas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ state }),
      });
      const text = await res.text();
      if (!text) {
        console.warn("Empty response received.");
        return;
      }
      const data = JSON.parse(text);
      console.log("Saved canvas state:", data);
      fetchSavedStates(); // refresh list
    } catch (error) {
      console.error("Error saving canvas state:", error);
    }
  }, [nodes, edges]);

  const fetchSavedStates = useCallback(async () => {
    try {
      const res = await fetch("/api/canvas");
      const data = await res.json();
      setSavedStates(data);
    } catch (error) {
      console.error("Error fetching saved states:", error);
    }
  }, []);

  const loadCanvasState = async (loadedState: any) => {
    if (loadedState && loadedState.nodes && loadedState.edges) {
      setNodes(loadedState.nodes);
      setEdges(loadedState.edges);
      console.log("Loaded canvas state");
      setShowLoadMenu(false);
    }
  };

  useEffect(() => {
    fetchSavedStates();
  }, [fetchSavedStates]);
  // --- End Persistence Functions ---

  // Create a new pair: Model Node and Output Node.
  const addModelAndOutputNodes = () => {
    const modelCount = nodesRef.current.filter((n) => n.type === "modelNode").length;
    const baseX = 100;
    const baseY = 100 + modelCount * 350;
    const modelNodeId = getId();
    const outputNodeId = getId();

    const modelNode = {
      id: modelNodeId,
      type: "modelNode",
      position: { x: baseX, y: baseY },
      data: {
        promptText: "",
        modelType: "gpt-4o-mini", // default per dropdown options
        temperature: 1.0,
        systemPrompt: "You are a helpful assistant.",
        loading: false,
        showProperties: true,
        imageUrl: "", // Added imageUrl property
        onToggleProperties: () => {
          const current = nodesRef.current.find((n) => n.id === modelNodeId);
          updateNodeData(modelNodeId, { showProperties: !current?.data.showProperties });
        },
        onChangePrompt: (text: string) => updateNodeData(modelNodeId, { promptText: text }),
        onChangeModel: (value: string) => updateNodeData(modelNodeId, { modelType: value }),
        onChangeTemperature: (value: number) => updateNodeData(modelNodeId, { temperature: value }),
        onChangeSystemPrompt: (value: string) => updateNodeData(modelNodeId, { systemPrompt: value }),
        onChangeImage: (url: string) => updateNodeData(modelNodeId, { imageUrl: url }), // Callback for image changes
        onStart: () => startModel(modelNodeId, outputNodeId),
        onDelete: () => {
          deleteNode(modelNodeId);
          deleteNode(outputNodeId);
        },
      },
    };

    const outputNode = {
      id: outputNodeId,
      type: "outputNode",
      position: { x: baseX, y: baseY + 350 },
      draggable: true,
      data: {
        response: "",
        onDelete: () => deleteNode(outputNodeId),
        onToggleDraggable: (draggable: boolean) => {
          updateNodeData(outputNodeId, { draggable });
        },
      },
    };

    setNodes((nds) => nds.concat([modelNode, outputNode]));

    const newEdge: Edge = {
      id: getEdgeId(),
      source: modelNodeId,
      target: outputNodeId,
      type: "simpleWhiteEdge",
    };
    setEdges((eds) => eds.concat(newEdge));

    console.log("Added model-output pair:", modelNode, outputNode);
  };

  // Create a new Master Input Node.
  const addMasterInputNode = () => {
    const newNode = {
      id: getId(),
      type: "masterInputNode",
      position: { x: 600, y: 100 },
      data: {
        masterPrompt: "",
        masterImageUrl: "", // Added masterImageUrl property
        onChangeMasterPrompt: (text: string) => updateNodeData(newNode.id, { masterPrompt: text }),
        onChangeMasterImage: (url: string) => updateNodeData(newNode.id, { masterImageUrl: url }), // Callback for master image
        onMasterSend: () => broadcastMasterPrompt(newNode.id),
        onDelete: () => deleteNode(newNode.id),
      },
    };
    setNodes((nds) => nds.concat(newNode));
    console.log("Added Master Input Node:", newNode);
  };

  // Create a new Text Node.
  const addTextNode = () => {
    const textCount = nodesRef.current.filter((n) => n.type === "textNode").length;
    const baseX = 100;
    const baseY = 100 + textCount * 150;
    const textNodeId = getId();

    const textNode = {
      id: textNodeId,
      type: "textNode",
      position: { x: baseX, y: baseY },
      data: {
        label: "New Label",
        onChangeLabel: (text: string) => updateNodeData(textNodeId, { label: text }),
        onDelete: () => deleteNode(textNodeId),
      },
    };

    setNodes((nds) => nds.concat(textNode));
    console.log("Added text node:", textNode);
  };

  // Start model execution for a given model node.
  const startModel = async (modelNodeId: string, outputNodeId: string) => {
    const modelNode = nodesRef.current.find((n) => n.id === modelNodeId);
    if (!modelNode) return;
    const { promptText, modelType, temperature, systemPrompt, imageData } = modelNode.data;
    console.log("Starting model:", modelNodeId, { promptText, modelType, temperature, systemPrompt, imageData });
    updateNodeData(modelNodeId, { loading: true });
    const startTime = performance.now();
  
    try {
      const isGemini = modelType.toLowerCase().includes("gemini");
      const endpoint = isGemini ? "/api/gemini" : "/api/chat";
  
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: promptText,
          model: modelType,
          temperature,
          system: systemPrompt,
          imageData, // include if provided
        }),
      });
      const data = await res.json();
      const executionTime = performance.now() - startTime;
      if (data.error) {
        updateNodeData(outputNodeId, { response: `Error: ${data.error}` });
      } else {
        updateNodeData(outputNodeId, { response: data.response });
      }
      await fetch("/api/logs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          node_id: modelNodeId,
          prompt: promptText,
          response: data.response,
          execution_time: executionTime,
        }),
      });
    } catch (error) {
      console.error("Error calling API:", error);
      updateNodeData(outputNodeId, { response: "Error calling API." });
    }
    updateNodeData(modelNodeId, { loading: false });
  };
  
  // Broadcast the master prompt and image to all model nodes.
  const broadcastMasterPrompt = (masterNodeId: string) => {
    const masterNode = nodesRef.current.find((n) => n.id === masterNodeId);
    if (!masterNode) return;
    const masterPrompt = masterNode.data.masterPrompt;
    const masterImage = masterNode.data.masterImageUrl;
    console.log("Broadcasting master prompt:", masterPrompt, masterImage);
    nodesRef.current.forEach((node) => {
      if (node.type === "modelNode") {
        updateNodeData(node.id, { promptText: masterPrompt });
        if (masterImage) {
          updateNodeData(node.id, { imageUrl: masterImage });
        }
        // Find associated output node via simpleWhiteEdge.
        const edge = edges.find((e) => e.source === node.id && e.type === "simpleWhiteEdge");
        if (edge) {
          startModel(node.id, edge.target);
        }
      }
    });
  };

  return (
    <ReactFlowProvider>
      <div style={{ width: "100%", height: "100vh", position: "relative", backgroundColor: "#111" }}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
        >
          <Background color="#444" gap={16} />
          <Controls />
          <MiniMap />
        </ReactFlow>
        {/* Global Add Buttons */}
        <div style={{ position: "absolute", bottom: 20, left: 20, zIndex: 1000 }}>
          <button
            onClick={addModelAndOutputNodes}
            style={{
              padding: "10px 15px",
              backgroundColor: "#8e44ad",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Add Model Node
          </button>
          <button
            onClick={addMasterInputNode}
            style={{
              padding: "10px 15px",
              backgroundColor: "#e67e22",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Add Master Input Node
          </button>
          <button
            onClick={addTextNode}
            style={{
              padding: "10px 15px",
              backgroundColor: "#f1c40f",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Add Text Node
          </button>
          <button
            onClick={saveCanvasState}
            style={{
              padding: "10px 15px",
              backgroundColor: "#3498db",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              marginRight: "10px",
            }}
          >
            Save Canvas
          </button>
          <button
            onClick={() => setShowLoadMenu((prev) => !prev)}
            style={{
              padding: "10px 15px",
              backgroundColor: "#2ecc71",
              color: "white",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
            }}
          >
            Load Canvas
          </button>
          {showLoadMenu && (
            <div
              style={{
                marginTop: "10px",
                backgroundColor: "#222",
                padding: "5px",
                borderRadius: "5px",
                maxHeight: "200px",
                overflowY: "auto",
                color: "white",
              }}
            >
              <h4 style={{ margin: "5px 0" }}>Saved States</h4>
              {savedStates.length > 0 ? (
                savedStates.map((state: any) => (
                  <button
                    key={state.id}
                    onClick={() => loadCanvasState(state.state)}
                    style={{
                      display: "block",
                      width: "100%",
                      textAlign: "left",
                      padding: "5px",
                      backgroundColor: "#2ecc71",
                      color: "white",
                      border: "none",
                      borderRadius: "5px",
                      cursor: "pointer",
                      marginBottom: "5px",
                    }}
                  >
                    {new Date(state.created_at).toLocaleString()}
                  </button>
                ))
              ) : (
                <div>No saved states</div>
              )}
            </div>
          )}
        </div>
      </div>
    </ReactFlowProvider>
  );
}
