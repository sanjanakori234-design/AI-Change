import Link from "next/link";

export default function Home() {
  return (
    <div style={{ position: "relative", zIndex: 1 }}>
      {/* Navbar */}
      <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "20px 40px", maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <span style={{ fontSize: "1.8rem" }}>⚙️</span>
          <span style={{ fontSize: "1.3rem", fontWeight: 700 }} className="gradient-text">AI Change Impact Analyzer</span>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          <Link href="/login" className="btn-secondary" style={{ padding: "10px 24px" }}>Log In</Link>
          <Link href="/signup" className="btn-primary" style={{ padding: "10px 24px" }}>Get Started</Link>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ textAlign: "center", padding: "120px 20px 60px", maxWidth: 900, margin: "0 auto" }}>
        <div className="animate-slide-up">
          <span style={{ display: "inline-block", padding: "6px 16px", background: "rgba(124,58,237,0.15)", border: "1px solid rgba(124,58,237,0.3)", borderRadius: 20, fontSize: "0.85rem", color: "#a78bfa", marginBottom: 24 }}>
            🔥 Master Your Software Systems with AI
          </span>
          <h1 style={{ fontSize: "3.5rem", fontWeight: 800, lineHeight: 1.15, marginBottom: 20 }}>
            Predict <span className="gradient-text">Impact</span> Before You <br /> Break Production
          </h1>
          <p style={{ fontSize: "1.15rem", color: "var(--text-secondary)", maxWidth: 700, margin: "0 auto 36px", lineHeight: 1.7 }}>
            Describe a code change and get AI predictions on what parts of your codebase will be affected. Small changes often break unexpected parts of the system—we help you see that impact early.
          </p>
          <div style={{ display: "flex", gap: 16, justifyContent: "center" }}>
            <Link href="/signup" className="btn-primary" style={{ padding: "14px 36px", fontSize: "1.05rem" }}>Start Analyzing →</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ position: "absolute", bottom: 0, width: "100%", textAlign: "center", padding: "30px 20px", color: "var(--text-muted)", fontSize: "0.85rem" }}>
        © 2026 AI Change Impact Analyzer. Built with Next.js, Supabase & Hugging Face.
      </footer>
    </div>
  );
}
