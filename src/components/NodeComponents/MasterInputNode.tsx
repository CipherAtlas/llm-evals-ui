// src/components/NodeComponents/MasterInputNode.tsx
import React, { useState } from "react";
import { Handle, Position } from "react-flow-renderer";
import { supabase } from "../../../lib/supabaseClient";

interface MasterInputNodeProps {
  data: {
    masterPrompt: string;
    imageData?: string;
    onChangeMasterPrompt: (text: string) => void;
    onChangeImage: (img: string) => void;
    onMasterSend: () => void;
    onDelete: () => void;
  };
}

export default function MasterInputNode({ data }: MasterInputNodeProps) {
  const [previewUrl, setPreviewUrl] = useState(data.imageData || "");

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const fileName = `${Date.now()}-${file.name}`;
    const { data: uploadData, error } = await supabase.storage.from("images").upload(fileName, file);
    if (error) {
      console.error("Error uploading image:", error.message);
      return;
    }
    const { data: publicData } = supabase.storage.from("images").getPublicUrl(uploadData.path);
    const publicURL = publicData.publicUrl;
    console.log("Image uploaded successfully. Public URL:", publicURL);
    setPreviewUrl(publicURL);
    data.onChangeImage(publicURL);
  };

  return (
    <div
      style={{
        backgroundColor: "#1a1a1a",
        border: "2px solid #e67e22",
        borderRadius: "10px",
        padding: "15px",
        width: "350px",
        color: "white",
        fontFamily: "Arial, sans-serif",
        boxShadow: "0px 4px 8px rgba(0,0,0,0.5)",
        position: "relative",
      }}
    >
      <textarea
        placeholder="Enter master prompt..."
        value={data.masterPrompt}
        onChange={(e) => data.onChangeMasterPrompt(e.target.value)}
        style={{
          width: "100%",
          height: "80px",
          padding: "10px",
          borderRadius: "5px",
          backgroundColor: "#333",
          border: "1px solid #e67e22",
          color: "white",
          resize: "none",
        }}
      />
      {/* Image Input */}
      <div style={{ marginTop: "10px" }}>
        <label style={{ fontSize: "0.9rem", display: "block", marginBottom: "5px" }}>
          Upload Image:
        </label>
        <input type="file" accept="image/*" onChange={handleImageChange} />
        {previewUrl && (
          <img
            src={previewUrl}
            alt="Master Preview"
            style={{ width: "100%", borderRadius: "5px", marginTop: "5px" }}
          />
        )}
      </div>
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={data.onMasterSend}
          style={{
            padding: "8px 12px",
            backgroundColor: "#e67e22",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
          }}
        >
          Send to Model Nodes
        </button>
        <button
          onClick={data.onDelete}
          style={{
            padding: "8px 12px",
            backgroundColor: "red",
            color: "white",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            marginLeft: "10px",
          }}
        >
          Delete
        </button>
      </div>
      {/* Source Handle at Bottom Center for Master → Model connections */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="master-source"
        style={{
          background: "white",
          width: 10,
          height: 10,
          borderRadius: "50%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
    </div>
  );
}
