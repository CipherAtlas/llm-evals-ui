// app/page.tsx
"use client";

import FlowCanvas from "../components/FlowCanvas";

export default function Home() {
  return (
    <div style={{ width: "100%", height: "100vh" }}>
      <FlowCanvas />
    </div>
  );
}
