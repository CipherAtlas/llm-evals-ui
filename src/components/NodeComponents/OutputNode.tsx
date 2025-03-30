// src/components/NodeComponents/OutputNode.tsx
import React, { useState } from "react";
import ReactMarkdown from "react-markdown";
import { Handle, Position } from "react-flow-renderer";

interface OutputNodeProps {
  data: {
    response: string;
    onToggleDraggable: (draggable: boolean) => void;
  };
}

export default function OutputNode({ data }: OutputNodeProps) {
  const [expanded, setExpanded] = useState(false);

  // Preview style: one line with ellipsis.
  const previewStyle: React.CSSProperties = {
    overflow: "hidden",
    whiteSpace: "nowrap",
    textOverflow: "ellipsis",
    userSelect: "text",
    cursor: "text",
  };

  // Overlay style: full markdown rendered without fixed height limit.
  const overlayStyle: React.CSSProperties = {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    backgroundColor: "#222",
    border: "2px solid #8e44ad",
    borderRadius: "10px",
    padding: "20px",
    zIndex: 1000,
    width: "400px",
    maxHeight: "90vh",
    overflowY: "auto",
    userSelect: "text",
    cursor: "text",
  };

  const handleOverlayClose = () => {
    setExpanded(false);
    data.onToggleDraggable(true); // Re-enable dragging when overlay closes.
  };

  const openOverlay = () => {
    setExpanded(true);
    data.onToggleDraggable(false); // Disable dragging while overlay is open.
  };

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        border: "2px solid #8e44ad",
        borderRadius: "10px",
        padding: "15px",
        width: "350px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
        position: "relative",
      }}
    >
      {/* Target Handle at Top Center */}
      <Handle
        type="target"
        position={Position.Top}
        id="output-target"
        style={{
          background: "white",
          width: 10,
          height: 10,
          borderRadius: "50%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      <div style={{ marginBottom: "5px", fontWeight: "bold", color: "#8e44ad" }}>
        Output:
      </div>
      {/* Preview area shows only first line */}
      <div
        style={previewStyle}
        onDoubleClick={openOverlay}
        onMouseDown={(e) => e.stopPropagation()}
      >
        <ReactMarkdown>{data.response || "No response yet."}</ReactMarkdown>
      </div>
      {expanded && (
        <div style={overlayStyle} onClick={(e) => e.stopPropagation()}>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleOverlayClose();
            }}
            style={{
              position: "absolute",
              top: "10px",
              right: "10px",
              backgroundColor: "transparent",
              border: "none",
              color: "white",
              fontSize: "1.2rem",
              cursor: "pointer",
            }}
          >
            &times;
          </button>
          <ReactMarkdown>{data.response || "No response yet."}</ReactMarkdown>
        </div>
      )}
    </div>
  );
}
