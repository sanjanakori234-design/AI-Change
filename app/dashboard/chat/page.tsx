"use client";
import { useState, useRef } from "react";
import ReactMarkdown from "react-markdown";

type Message = { role: "user" | "ai"; content: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [contextFiles, setContextFiles] = useState<{name: string, content: string}[]>([]);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  async function handleSend() {
    if (!input.trim()) return;
    const userMsg = input;
    setInput("");
    setMessages(prev => [...prev, { role: "user", content: userMsg }]);
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          query: userMsg, 
          history: messages,
          context: contextFiles.map(f => `--- ${f.name} ---\n${f.content}`).join("\n\n") 
        }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);
      setMessages(prev => [...prev, { role: "ai", content: data.reply }]);
    } catch (err: any) {
      setMessages(prev => [...prev, { role: "ai", content: "Error: " + (err.message || "Failed to respond") }]);
    }
    setLoading(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files) return;
    
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onload = (event) => {
        setContextFiles(prev => [...prev, { name: file.name, content: (event.target?.result as string) }]);
      };
      reader.readAsText(file);
    });
  }

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 120px)" }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>💬 <span className="gradient-text">Repo AI Chat</span></h1>
        <p style={{ color: "var(--text-secondary)", marginBottom: 16 }}>Upload files from your repository and chat directly with them. Ask questions like "Where is this variable used?"</p>
      </div>

      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <button 
          onClick={() => fileInputRef.current?.click()}
          style={{ background: "rgba(16,185,129,0.15)", border: "1px solid rgba(16,185,129,0.3)", padding: "6px 12px", borderRadius: 8, color: "var(--success)", fontSize: "0.85rem", cursor: "pointer", display: "flex", alignItems: "center", gap: 6 }}
        >
          ➕ Add Context Files
        </button>
        <input type="file" multiple ref={fileInputRef} hidden onChange={handleFileUpload} accept=".js,.ts,.tsx,.json,.py,.java,.md" />
        
        {contextFiles.map((f, i) => (
          <div key={i} style={{ background: "var(--glass-bg)", border: "1px solid var(--border-color)", padding: "4px 10px", borderRadius: 20, fontSize: "0.8rem", display: "flex", alignItems: "center", gap: 6 }}>
            📄 {f.name}
            <span style={{ cursor: "pointer", color: "var(--danger)" }} onClick={() => setContextFiles(prev => prev.filter((_, idx) => idx !== i))}>✕</span>
          </div>
        ))}
      </div>

      <div style={{ flex: 1, background: "rgba(10,10,30,0.5)", border: "1px solid var(--glass-border)", borderRadius: 16, padding: 20, overflowY: "auto", display: "flex", flexDirection: "column", gap: 16 }}>
        {messages.length === 0 && (
          <div style={{ margin: "auto", textAlign: "center", color: "var(--text-muted)", maxWidth: 400 }}>
            <span style={{ fontSize: "3rem", display: "block", marginBottom: 16 }}>🤖</span>
            Add some context files above and ask me anything about your logic!
          </div>
        )}
        {messages.map((m, i) => (
          <div key={i} style={{ alignSelf: m.role === "user" ? "flex-end" : "flex-start", maxWidth: "85%" }}>
            <div style={{ background: m.role === "user" ? "var(--accent-secondary)" : "rgba(124,58,237,0.15)", border: m.role === "user" ? "none" : "1px solid var(--border-color)", padding: "12px 18px", borderRadius: 16, borderBottomRightRadius: m.role === "user" ? 4 : 16, borderBottomLeftRadius: m.role === "ai" ? 4 : 16 }}>
              {m.role === "user" ? m.content : (
                <div className="markdown-container">
                  <ReactMarkdown components={{
                    pre: ({node, ...props}: any) => <pre style={{ background: "rgba(0,0,0,0.5)", padding: 12, borderRadius: 8, overflowX: "auto", margin: "12px 0" }} {...props} />,
                    code: ({node, className, ...props}: any) => {
                      const isBlock = /language-(\w+)/.exec(className || '') || String(props.children).includes('\n');
                      return isBlock ? <code className={className} {...props} /> : <code style={{ background: "rgba(0,0,0,0.3)", padding: "2px 4px", borderRadius: 4 }} className={className} {...props} />;
                    }
                  }}>{m.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div style={{ alignSelf: "flex-start", display: "flex", alignItems: "center", gap: 8, color: "var(--text-muted)", padding: 12 }}>
            <span className="spinner" style={{ width: 16, height: 16 }} /> Thinking...
          </div>
        )}
      </div>

      <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
        <input 
          className="input-field" 
          placeholder="Ask a question about your code..." 
          value={input} 
          onChange={e => setInput(e.target.value)} 
          onKeyDown={e => e.key === "Enter" && handleSend()}
        />
        <button className="btn-primary" onClick={handleSend} disabled={loading || !input.trim()}>Send 🚀</button>
      </div>
    </div>
  );
}
