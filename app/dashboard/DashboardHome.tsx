"use client";
import Link from "next/link";

const FEATURES = [
  { href: "/dashboard/files", icon: "📁", title: "Codebase Manager", desc: "Upload logic files with tags and version tracking.", color: "rgba(245,158,11,0.2)" },
  { href: "/dashboard/analyzer", icon: "🕸️", title: "Visual Impact Analyzer", desc: "Heatmaps and dependency graphs for safer code changes.", color: "rgba(124,58,237,0.2)" },
  { href: "/dashboard/understanding", icon: "🤖", title: "Code Understanding", desc: "Line-by-line explanation, bug detection, and refactoring.", color: "rgba(99,102,241,0.2)" },
  { href: "/dashboard/tests", icon: "🧪", title: "Unit Test Generator", desc: "Instantly build regression safety nets for your functions.", color: "rgba(168,85,247,0.2)" },
  { href: "/dashboard/chat", icon: "💬", title: "Repository AI Chat", desc: "Interact directly with your uploaded context via embeddings.", color: "rgba(16,185,129,0.2)" },
];

export default function DashboardHomeComponent() {
  return (
    <div>
      <div style={{ marginBottom: 36 }}>
        <h1 style={{ fontSize: "1.8rem", fontWeight: 700 }}>AI Software Engineering <span className="gradient-text">Hub</span></h1>
        <p style={{ color: "var(--text-secondary)", marginTop: 8 }}>Choose a tool below to optimize, fix, or analyze your codebase securely.</p>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {FEATURES.map((f, i) => (
          <Link key={i} href={f.href} className="feature-card animate-slide-up" style={{ animationDelay: `${i * 0.08}s`, animationFillMode: "both" }}>
            <div style={{ background: f.color, width: 48, height: 48, borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", marginBottom: 14 }}>{f.icon}</div>
            <h3 style={{ fontSize: "1.08rem", fontWeight: 600, marginBottom: 6 }}>{f.title}</h3>
            <p style={{ color: "var(--text-secondary)", fontSize: "0.88rem", lineHeight: 1.5 }}>{f.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
