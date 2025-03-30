// src/components/NodeComponents/TextNode.tsx
import React from "react";

interface TextNodeProps {
  data: {
    label: string;
    onChangeLabel: (text: string) => void;
    onDelete: () => void;
  };
}

export default function TextNode({ data }: TextNodeProps) {
  return (
    <div
      style={{
        backgroundColor: "#fff",  // white background
        border: "1px solid #ccc",
        padding: "10px",
        borderRadius: "5px",
        fontFamily: "Arial, sans-serif",
        color: "white",           // white text (you might add a text shadow for contrast)
      }}
    >
      <textarea
        value={data.label}
        onChange={(e) => data.onChangeLabel(e.target.value)}
        placeholder="Enter tree label..."
        style={{
          width: "100%",
          border: "none",
          resize: "none",
          fontSize: "1rem",
          fontFamily: "Arial, sans-serif",
          color: "black",         // white text
          backgroundColor: "#fff",// white background
        }}
      />
      <button
        onClick={data.onDelete}
        style={{
          color: "red",
          border: "none",
          background: "transparent",
          marginTop: "5px",
        }}
      >
        Delete
      </button>
    </div>
  );
}
