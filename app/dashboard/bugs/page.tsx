"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

export default function BugsPage() {
  const [code, setCode] = useState("");
  const [result, setResult] = useState("");
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleAnalyze() {
    if (!code.trim()) return;
    setLoading(true);
    setResult("");
    try {
      const res = await fetch("/api/bugs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setResult(data.result);
    } catch (err: any) {
      setResult("Error: " + (err.message || "Failed to process code"));
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
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>🐛 <span className="gradient-text">Bug Detector</span></h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>Paste a snippet that isn't working. AI will highlight errors (syntax, logic, edge cases) and suggest fixes.</p>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 6 }}>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>Problematic Code</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "rgba(124,58,237,0.1)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 6, color: "var(--text-secondary)", fontSize: "0.8rem", cursor: "pointer" }}
            >
              📄 Upload File
            </button>
            <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".js,.ts,.jsx,.tsx,.json,.py,.java,.cpp,.c" />
          </div>
          <textarea className="textarea-field" placeholder="Paste the code throwing errors here..." value={code} onChange={e => setCode(e.target.value)} style={{ minHeight: 200, fontFamily: "monospace" }} />
        </div>
        <button className="btn-primary" onClick={handleAnalyze} disabled={loading || !code.trim()} style={{ alignSelf: "flex-end" }}>
          {loading ? <><span className="spinner" /> Squashing Bugs...</> : "🐛 Find Bugs & Fix"}
        </button>
      </div>

      {result && (
        <div className="animate-slide-up" style={{ marginTop: 28 }}>
          <h2 style={{ fontSize: "1.1rem", fontWeight: 600, marginBottom: 16 }}>Diagnostic Report</h2>
          <div className="result-box markdown-container" style={{ padding: "28px", borderLeft: "4px solid var(--danger)" }}>
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
