"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      router.push("/dashboard");
    }
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", zIndex: 1 }}>
      <div className="glass-card animate-slide-up" style={{ width: "100%", maxWidth: 440, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: "2.5rem" }}>🎓</span>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: 12 }}>Welcome back</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: "0.92rem" }}>Sign in to AI Change Impact Analyzer</p>
        </div>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Email</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Password</label>
            <input type="password" className="input-field" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? <span className="spinner" /> : "Sign In"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 24, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Don&apos;t have an account? <Link href="/signup" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>Sign up</Link>
        </p>
      </div>
    </div>
  );
}
