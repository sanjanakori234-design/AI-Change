"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function TestsPage() {
  const [code, setCode] = useState("");
  const [framework, setFramework] = useState("jest");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleGenerate() {
    if (!code.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/tests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, framework }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err: any) {
      setResult("Error: " + (err.message || "Failed to generate tests"));
    }
    setLoading(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => { setCode((event.target?.result as string) || ""); };
    reader.readAsText(file);
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>🧪 <span className="gradient-text">Auto Unit Tests</span></h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>Upload a class or function. AI will automatically generate extensive unit tests for regressions.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Target Code</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 6, color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer" }}
            >
              📄 Upload File
            </button>
            <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".js,.ts,.py,.java,.cpp,.c,.go,.cs" />
          </div>
          <textarea className="textarea-field" placeholder="Paste the code you want to test..." value={code} onChange={e => setCode(e.target.value)} style={{ minHeight: 150, fontFamily: "monospace" }} />
        </div>
        <div style={{ display: "flex", gap: 12, justifyContent: "space-between", alignItems: "center" }}>
          <select value={framework} onChange={e => setFramework(e.target.value)} className="input-field" style={{ width: 200, padding: "10px" }}>
            <option value="jest">Jest / JS / TS</option>
            <option value="pytest">PyTest / Python</option>
            <option value="junit">JUnit / Java</option>
            <option value="gtest">Google Test / C++</option>
            <option value="gonative">Native / Go</option>
          </select>
          <button className="btn-primary" onClick={handleGenerate} disabled={loading || !code.trim()}>
            {loading ? <><span className="spinner" /> Generating...</> : "🧪 Generate Unit Tests"}
          </button>
        </div>
      </div>

      {result && (
        <div className="animate-slide-up" style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16 }}>Generated Test Suite</h2>
          <div className="result-box markdown-container" style={{ padding: "28px" }}>
            <ReactMarkdown components={{
              code: ({node, inline, ...props}: any) => inline 
                ? <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 6px", borderRadius: 4, fontFamily: "monospace", fontSize: "0.85em", color: "#a78bfa" }} {...props} />
                : <pre style={{ background: "rgba(0,0,0,0.5)", padding: "16px", borderRadius: 8, overflowX: "auto", margin: "1em 0", border: "1px solid var(--border-color)" }}><code style={{ fontFamily: "monospace", fontSize: "0.85em" }} {...props} /></pre>
            }}>
              {result}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
