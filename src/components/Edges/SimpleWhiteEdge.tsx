// src/components/Edges/SimpleWhiteEdge.tsx
import React from "react";
import { EdgeProps } from "react-flow-renderer";

export default function SimpleWhiteEdge({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  style = {},
  markerEnd,
}: EdgeProps) {
  return (
    <g className="react-flow__edge">
      <line
        id={id}
        x1={sourceX}
        y1={sourceY}
        x2={targetX}
        y2={targetY}
        style={{
          ...style,
          stroke: "white",
          strokeWidth: 2,
          fill: "none",
        }}
        markerEnd={markerEnd}
      />
    </g>
  );
}
