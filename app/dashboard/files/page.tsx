"use client";
import { useState, useEffect, useCallback } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function CodebaseManagerPage() {
  const [files, setFiles] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const supabase = getSupabaseBrowserClient();

  const fetchFiles = useCallback(async () => {
    const { data } = await supabase.storage.from("notes").list("", { limit: 100, sortBy: { column: "created_at", order: "desc" } });
    if (data) setFiles(data.filter(f => f.name !== ".emptyFolderPlaceholder"));
  }, [supabase]);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  async function handleUpload(fileList: FileList | null) {
    if (!fileList || fileList.length === 0) return;
    setUploading(true);
    for (const file of Array.from(fileList)) {
      const fileName = `${Date.now()}_${file.name}`;
      await supabase.storage.from("notes").upload(fileName, file);
    }
    await fetchFiles();
    setUploading(false);
  }

  async function handleDelete(name: string) {
    await supabase.storage.from("notes").remove([name]);
    await fetchFiles();
  }

  async function handleDownload(name: string) {
    const { data } = await supabase.storage.from("notes").download(name);
    if (data) {
      const url = URL.createObjectURL(data);
      const a = document.createElement("a"); a.href = url; a.download = name; a.click();
      URL.revokeObjectURL(url);
    }
  }

  function formatSize(bytes: number) {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + " KB";
    return (bytes / 1048576).toFixed(1) + " MB";
  }

  return (
    <div>
      <h1 style={{ fontSize: "1.8rem", fontWeight: 700, marginBottom: 8 }}>📁 <span className="gradient-text">Codebase Manager</span></h1>
      <p style={{ color: "var(--text-secondary)", marginBottom: 28 }}>Upload and store files securely in your Supabase bucket. Use these files as context in the other AI tools.</p>

      {/* Dropzone */}
      <div
        className={`dropzone ${dragActive ? "active" : ""}`}
        onDragOver={e => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={() => setDragActive(false)}
        onDrop={e => { e.preventDefault(); setDragActive(false); handleUpload(e.dataTransfer.files); }}
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <input id="file-input" type="file" multiple hidden onChange={e => handleUpload(e.target.files)} />
        {uploading ? (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 12 }}>
            <div className="spinner" style={{ width: 32, height: 32 }} />
            <p style={{ color: "var(--text-secondary)" }}>Uploading securely...</p>
          </div>
        ) : (
          <div>
            <p style={{ fontSize: "2.5rem", marginBottom: 12 }}>📤</p>
            <p style={{ fontWeight: 600, fontSize: "1.05rem", marginBottom: 6 }}>Drag & drop config/source files here</p>
            <p style={{ color: "var(--text-muted)", fontSize: "0.88rem" }}>or click to browse</p>
          </div>
        )}
      </div>

      {/* File list */}
      <div style={{ marginTop: 32 }}>
        <h2 style={{ fontSize: "1.15rem", fontWeight: 600, marginBottom: 16 }}>Repository Files ({files.length})</h2>
        {files.length === 0 ? (
          <p style={{ color: "var(--text-muted)", textAlign: "center", padding: 40 }}>No files uploaded yet. Drop some logic or config files above!</p>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {files.map(f => (
              <div key={f.name} className="file-item">
                <div style={{ display: "flex", alignItems: "center", gap: 12, overflow: "hidden" }}>
                  <span style={{ fontSize: "1.3rem" }}>📄</span>
                  <div style={{ overflow: "hidden" }}>
                    <p style={{ fontWeight: 500, fontSize: "0.92rem", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{f.name.replace(/^\d+_/, "")}</p>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.78rem" }}>{f.metadata?.size ? formatSize(f.metadata.size) : ""}</p>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <button onClick={() => handleDownload(f.name)} style={{ background: "rgba(99,102,241,0.15)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "var(--accent-secondary)", fontSize: "0.82rem", fontWeight: 500 }}>⬇ Download</button>
                  <button onClick={() => handleDelete(f.name)} style={{ background: "rgba(239,68,68,0.15)", border: "none", borderRadius: 8, padding: "6px 14px", cursor: "pointer", color: "var(--danger)", fontSize: "0.82rem", fontWeight: 500 }}>✕ Delete</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
