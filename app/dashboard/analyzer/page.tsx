"use client";
import { useState, useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getSupabaseBrowserClient } from "@/lib/supabase";

type HistoryItem = { 
  id: string; 
  date: string; 
  description: string; 
  riskScore: number; 
  analysis: string; 
};

export default function AnalyzerPage() {
  const [description, setDescription] = useState("");
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [activeAnalysis, setActiveAnalysis] = useState<HistoryItem | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const supabase = getSupabaseBrowserClient();
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) setUserId(data.user.id);
    });
  }, [supabase]);

  useEffect(() => {
    if (userId) {
      const saved = localStorage.getItem(`analyzerHistory_${userId}`);
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          setHistory(parsed);
          if (parsed.length > 0) {
            setActiveAnalysis(parsed[0]);
            setDescription(parsed[0].description);
          }
        } catch (e) {}
      }
    }
  }, [userId]);

  useEffect(() => {
    if (userId && history.length) {
      localStorage.setItem(`analyzerHistory_${userId}`, JSON.stringify(history));
    }
  }, [history, userId]);

  async function handleAnalyze() {
    if (!description.trim()) return;
    setLoading(true);
    
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ description, context }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      const newItem: HistoryItem = {
        id: Date.now().toString(),
        date: new Date().toLocaleDateString() + " " + new Date().toLocaleTimeString(),
        description: description,
        riskScore: data.riskScore || 0,
        analysis: data.analysis
      };

      setHistory((prev) => [newItem, ...prev]);
      setActiveAnalysis(newItem);
    } catch (err: any) {
      alert("Error: " + (err.message || "Failed to analyze"));
    }
    setLoading(false);
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      setContext((prev) => prev ? `${prev}\n\n--- File: ${file.name} ---\n${content}` : `--- File: ${file.name} ---\n${content}`);
    };
    reader.readAsText(file);
  }

  const getRiskColor = (score: number) => {
    if (score > 70) return "#ef4444"; // red-500
    if (score > 40) return "#f59e0b"; // amber-500
    return "#10b981"; // emerald-500
  };

  const chartData = history.slice().reverse().map((item, index) => ({
    name: `Run ${index + 1}`,
    score: item.riskScore,
    fullItem: item,
  }));

  const handleChartClick = (state: any) => {
    if (state && state.activePayload && state.activePayload.length > 0) {
      const clickedItem = state.activePayload[0].payload.fullItem;
      setActiveAnalysis(clickedItem);
      setDescription(clickedItem.description);
    }
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const item = payload[0].payload.fullItem;
      return (
        <div style={{ background: "rgba(10,15,30,0.95)", border: "1px solid rgba(255,255,255,0.15)", padding: "16px", borderRadius: "12px", boxShadow: "0 10px 25px rgba(0,0,0,0.5)" }}>
          <p style={{ margin: 0, fontWeight: 700, color: "#cbd5e1" }}>{label}</p>
          <div style={{ display: "flex", gap: "8px", alignItems: "center", margin: "8px 0" }}>
            <span style={{ height: "12px", width: "12px", borderRadius: "50%", background: getRiskColor(item.riskScore) }} />
            <span style={{ fontSize: "1.1rem", fontWeight: "bold", color: "#fff" }}>Risk Score: {item.riskScore}</span>
          </div>
          <p style={{ margin: 0, fontSize: "0.85rem", color: "var(--text-secondary)", maxWidth: "250px", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", display: "-webkit-box", overflow: "hidden" }}>
            {item.description}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 32 }}>
      <div>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>🔍 <span className="gradient-text">Change Impact Analyzer</span></h1>
        <p style={{ color: "var(--text-secondary)" }}>Describe a code change to get intelligent predictions on what parts of the codebase will be impacted and risk scores.</p>
      </div>

      {history.length > 0 && (
        <div className="animate-slide-up" style={{ padding: 24, background: "rgba(20,20,40,0.4)", border: "1px solid var(--border-color)", borderRadius: 20 }}>
          <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: 20 }}>Historical Risk Trends</h3>
          <div style={{ width: "100%", height: 300 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 20, right: 20, left: -20, bottom: 5 }} onClick={handleChartClick} style={{ cursor: "pointer" }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={{ stroke: "rgba(255,255,255,0.1)" }} />
                <YAxis stroke="var(--text-muted)" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(255,255,255,0.05)' }} />
                <Bar dataKey="score" radius={[6, 6, 0, 0]} maxBarSize={60}>
                  {chartData.map((entry, index) => {
                    const isActive = activeAnalysis?.id === entry.fullItem.id;
                    return (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={getRiskColor(entry.score)} 
                        fillOpacity={isActive ? 1 : 0.6}
                        stroke={isActive ? "rgba(255,255,255,0.8)" : "none"}
                        strokeWidth={isActive ? 2 : 0}
                      />
                    );
                  })}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
          <p style={{ fontSize: "0.85rem", color: "var(--text-muted)", marginTop: 16, textAlign: "center", display: "flex", alignItems: "center", justifyContent: "center", gap: 12 }}>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#10b981" }} /> Low Risk (0-40)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#f59e0b" }} /> Medium Risk (41-70)</span>
            <span style={{ display: "flex", alignItems: "center", gap: 6 }}><span style={{ width: 10, height: 10, borderRadius: "50%", background: "#ef4444" }} /> High Risk (71-100)</span>
          </p>
        </div>
      )}

      <div style={{ display: "flex", flexDirection: "column", gap: 16, background: "var(--glass-bg)", padding: 28, borderRadius: 20, border: "1px solid var(--border-color)", boxShadow: "0 8px 30px rgba(0,0,0,0.1)" }}>
        <div>
          <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)", marginBottom: 8, display: "block" }}>What change are you making? *</label>
          <textarea className="textarea-field" placeholder="e.g. Refactor the user authentication module..." value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 8 }}>
            <label style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Project Context / Code Snippets</label>
            <button 
              onClick={() => fileInputRef.current?.click()}
              style={{ background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.4)", padding: "6px 12px", borderRadius: 8, color: "var(--accent-primary)", fontSize: "0.85rem", cursor: "pointer", transition: "0.2s" }}
              className="hover:bg-purple-900/30"
            >
              📄 Upload File Context
            </button>
            <input type="file" ref={fileInputRef} hidden onChange={handleFileUpload} accept=".js,.ts,.jsx,.tsx,.json,.md,.html,.css,.py,.java,.cpp,.c" />
          </div>
          <textarea className="textarea-field" placeholder="Paste relevant code, JSON, or project info here... Or upload a file above." value={context} onChange={e => setContext(e.target.value)} style={{ minHeight: 140 }} />
        </div>
        <button className="btn-primary" onClick={handleAnalyze} disabled={loading || !description.trim()} style={{ alignSelf: "flex-end", padding: "12px 24px" }}>
          {loading ? <><span className="spinner" /> Analyzing Impact...</> : "🔍 Run Analysis"}
        </button>
      </div>

      {activeAnalysis && (
        <div className="animate-slide-up" style={{ marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: "1.4rem", fontWeight: 700 }}>Impact Analysis Report</h2>
            <div style={{ display: "flex", alignItems: "center", gap: 12, background: `${getRiskColor(activeAnalysis.riskScore)}15`, padding: "8px 20px", borderRadius: 30, border: `1px solid ${getRiskColor(activeAnalysis.riskScore)}` }}>
              <span style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>Assessed Risk Level:</span>
              <span style={{ fontWeight: 800, fontSize: "1.2rem", color: getRiskColor(activeAnalysis.riskScore) }}>{activeAnalysis.riskScore}/100</span>
            </div>
          </div>
          
          <div className="result-box markdown-container" style={{ padding: "32px", background: "rgba(15,15,25,0.6)", borderRadius: 20 }}>
            <ReactMarkdown components={{
              h1: ({node, ...props}) => <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginTop: "1.2em", marginBottom: "0.6em", borderBottom: "1px solid var(--border-color)", paddingBottom: "0.3em" }} {...props} />,
              h2: ({node, ...props}) => <h2 style={{ fontSize: "1.3rem", fontWeight: 700, marginTop: "1.2em", marginBottom: "0.6em", color: "var(--text-primary)" }} {...props} />,
              h3: ({node, ...props}) => <h3 style={{ fontSize: "1.1rem", fontWeight: 700, marginTop: "1em", marginBottom: "0.5em", color: "var(--text-primary)" }} {...props} />,
              p: ({node, ...props}) => <p style={{ marginBottom: "1.2em", lineHeight: 1.7, color: "var(--text-secondary)" }} {...props} />,
              ul: ({node, ...props}) => <ul style={{ marginLeft: "1.5em", marginBottom: "1.2em", listStyleType: "disc", color: "var(--text-secondary)" }} {...props} />,
              ol: ({node, ...props}) => <ol style={{ marginLeft: "1.5em", marginBottom: "1.2em", listStyleType: "decimal", color: "var(--text-secondary)" }} {...props} />,
              li: ({node, ...props}) => <li style={{ marginBottom: "0.4em" }} {...props} />,
              strong: ({node, ...props}) => <strong style={{ fontWeight: 700, color: "var(--text-primary)" }} {...props} />,
              code: ({node, inline, ...props}: any) => inline 
                ? <code style={{ background: "rgba(0,0,0,0.4)", padding: "2px 6px", borderRadius: 6, fontFamily: "monospace", fontSize: "0.85em", color: "#a78bfa" }} {...props} />
                : <pre style={{ background: "rgba(0,0,0,0.5)", padding: "20px", borderRadius: 12, overflowX: "auto", margin: "1.2em 0", border: "1px solid var(--border-color)" }}><code style={{ fontFamily: "monospace", fontSize: "0.85em", color: "#cbd5e1" }} {...props} /></pre>
            }}>
              {activeAnalysis.analysis}
            </ReactMarkdown>
          </div>
        </div>
      )}
    </div>
  );
}
