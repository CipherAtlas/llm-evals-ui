// Inside your ModelNode.tsx component
import React, { useState, useEffect } from "react";
import { Handle, Position } from "react-flow-renderer";
import { supabase } from "../../../lib/supabaseClient"; // adjust the path as needed

interface ModelNodeProps {
  data: {
    promptText: string;
    modelType: string;
    temperature: number;
    systemPrompt: string;
    loading: boolean;
    showProperties: boolean;
    imageData?: string; // stores the public URL
    onToggleProperties: () => void;
    onChangePrompt: (text: string) => void;
    onChangeModel: (value: string) => void;
    onChangeTemperature: (value: number) => void;
    onChangeSystemPrompt: (value: string) => void;
    onChangeImage: (imageUrl: string) => void;
    onStart: () => void;
    onDelete: () => void;
  };
}

export default function ModelNode({ data }: ModelNodeProps) {
  const [localSystemPrompt, setLocalSystemPrompt] = useState(data.systemPrompt);
  const [localTemperature, setLocalTemperature] = useState(data.temperature);

  useEffect(() => {
    setLocalSystemPrompt(data.systemPrompt);
  }, [data.systemPrompt]);

  useEffect(() => {
    setLocalTemperature(data.temperature);
  }, [data.temperature]);

  // Upload image to Supabase Storage and update the node with the public URL.
  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    console.log("Selected file:", file);
    if (!file) return;
  
    const fileName = `${Date.now()}-${file.name}`;
    
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from("images")
      .upload(fileName, file);
    
    if (uploadError) {
      console.error("Error uploading image:", uploadError.message);
      return;
    }
    
    const { data: publicData } = supabase.storage
      .from("images")
      .getPublicUrl(uploadData.path);
    
    const publicURL = publicData.publicUrl;
    console.log("Obtained public URL:", publicURL);
    
    data.onChangeImage(publicURL);
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
      {/* Toggle Properties Checkbox */}
      <div style={{ marginBottom: "10px" }}>
        <label style={{ fontSize: "0.9rem", cursor: "pointer" }}>
          <input
            type="checkbox"
            checked={data.showProperties}
            onChange={data.onToggleProperties}
            style={{ marginRight: "5px" }}
          />
          Show Properties
        </label>
      </div>

      {data.showProperties ? (
        <>
          {/* Prompt Input */}
          <textarea
            placeholder="Type your prompt..."
            value={data.promptText}
            onChange={(e) => data.onChangePrompt(e.target.value)}
            style={{
              width: "100%",
              height: "80px",
              padding: "10px",
              borderRadius: "5px",
              backgroundColor: "#333",
              border: "1px solid #8e44ad",
              color: "white",
              resize: "none",
            }}
          />

          {/* Model Selection */}
          <div style={{ marginTop: "10px", marginBottom: "10px" }}>
            <label style={{ fontSize: "0.9rem", marginRight: "5px" }}>
              Model:
              <select
                value={data.modelType}
                onChange={(e) => data.onChangeModel(e.target.value)}
                style={{
                  marginLeft: "5px",
                  padding: "5px",
                  backgroundColor: "#333",
                  color: "white",
                  border: "1px solid #8e44ad",
                  borderRadius: "5px",
                }}
              >
                <optgroup label="ChatGPT">
                  <option value="gpt-4o-mini">GPT-4o-mini (default)</option>
                  <option value="gpt-4o">GPT-4o</option>
                  <option value="gpt-4o-mini-search-preview">GPT-4o-mini-search-preview</option>
                  <option value="gpt-3.5-turbo">GPT-3.5-turbo</option>
                </optgroup>
                <optgroup label="Claude">
                  <option value="claude-3-haiku-20240307">Claude 3 Haiku</option>
                  <option value="claude-3-opus-20240229">Claude 3 Opus</option>
                  <option value="claude-3-5-haiku-20241022">Claude 3.5 Haiku</option>
                  <option value="claude-3-5-sonnet-20241022">Claude 3.5 Sonnet</option>
                  <option value="claude-3-7-sonnet-20250219">Claude 3.7 Sonnet</option>
                </optgroup>
                <optgroup label="Gemini">
                  <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
                  <option value="gemini-2.0-flash-lite">Gemini 2.0 Flash-Lite</option>
                  <option value="gemini-2.0-pro-exp-02-05">Gemini 2.0 Pro Exp 02-05</option>
                  <option value="gemini-2.0-flash-thinking-exp-01-21">Gemini 2.0 Flash Thinking Exp 01-21</option>
                  <option value="gemini-1.5-pro">Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
                </optgroup>
              </select>
            </label>
          </div>

          {/* Temperature Input with "Set" Button */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "0.9rem" }}>
              Temperature:
              <div style={{ display: "flex", marginTop: "5px" }}>
                <input
                  type="number"
                  value={data.temperature}
                  step="0.1"
                  onChange={(e) =>
                    data.onChangeTemperature(parseFloat(e.target.value))
                  }
                  style={{
                    flex: 1,
                    padding: "5px",
                    backgroundColor: "#333",
                    color: "white",
                    border: "1px solid #8e44ad",
                    borderRadius: "5px",
                  }}
                />
                <button
                  onClick={() => data.onChangeTemperature(data.temperature)}
                  style={{
                    marginLeft: "5px",
                    padding: "5px 10px",
                    backgroundColor: "#8e44ad",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Set
                </button>
              </div>
            </label>
          </div>

          {/* System Prompt Input with "Set" Button */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "0.9rem" }}>
              System Prompt:
              <div style={{ display: "flex", marginTop: "5px" }}>
                <input
                  type="text"
                  value={localSystemPrompt}
                  onChange={(e) => setLocalSystemPrompt(e.target.value)}
                  placeholder="Enter system prompt..."
                  style={{
                    flex: 1,
                    padding: "5px",
                    backgroundColor: "#333",
                    color: "white",
                    border: "1px solid #8e44ad",
                    borderRadius: "5px",
                  }}
                />
                <button
                  onClick={() => data.onChangeSystemPrompt(localSystemPrompt)}
                  style={{
                    marginLeft: "5px",
                    padding: "5px 10px",
                    backgroundColor: "#8e44ad",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Set
                </button>
              </div>
            </label>
          </div>

          {/* Image Input */}
          <div style={{ marginBottom: "10px" }}>
            <label style={{ fontSize: "0.9rem", display: "block", marginBottom: "5px" }}>
              Upload Image:
            </label>
            <input type="file" accept="image/*" onChange={handleImageChange} />
          </div>

          {/* Action Buttons */}
          <div style={{ marginBottom: "10px" }}>
            <button
              onClick={data.onStart}
              style={{
                padding: "8px 12px",
                marginRight: "10px",
                backgroundColor: "#8e44ad",
                color: "white",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
              disabled={data.loading}
            >
              {data.loading ? "Loading..." : "Start"}
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
              }}
            >
              Delete
            </button>
          </div>
        </>
      ) : (
        <div style={{ textAlign: "center", color: "#8e44ad", fontWeight: "bold" }}>
          Model Node
        </div>
      )}

      {/* Source Handle at Bottom Center for Model → Output connection */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="model-source"
        style={{
          background: "white",
          width: 10,
          height: 10,
          borderRadius: "50%",
          left: "50%",
          transform: "translateX(-50%)",
        }}
      />
      {/* Target Handle at Top Center for Master → Model connection */}
      <Handle
        type="target"
        position={Position.Top}
        id="model-target"
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
