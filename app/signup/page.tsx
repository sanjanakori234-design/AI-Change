"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      setSuccess(true);
      setLoading(false);
    }
  }

  if (success) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", zIndex: 1 }}>
        <div className="glass-card animate-slide-up" style={{ width: "100%", maxWidth: 440, padding: 40, textAlign: "center" }}>
          <span style={{ fontSize: "3rem" }}>✅</span>
          <h2 style={{ marginTop: 16, fontSize: "1.4rem", fontWeight: 700 }}>Check your email</h2>
          <p style={{ color: "var(--text-secondary)", marginTop: 10 }}>We sent a confirmation link to <strong>{email}</strong></p>
          <Link href="/login" className="btn-primary" style={{ marginTop: 24, display: "inline-flex" }}>Go to Login</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 20, position: "relative", zIndex: 1 }}>
      <div className="glass-card animate-slide-up" style={{ width: "100%", maxWidth: 440, padding: 40 }}>
        <div style={{ textAlign: "center", marginBottom: 32 }}>
          <span style={{ fontSize: "2.5rem" }}>🎓</span>
          <h1 style={{ fontSize: "1.6rem", fontWeight: 700, marginTop: 12 }}>Create your account</h1>
          <p style={{ color: "var(--text-secondary)", marginTop: 6, fontSize: "0.92rem" }}>Sign up to AI change impact analyzer</p>
        </div>
        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Email</label>
            <input type="email" className="input-field" placeholder="your@email.com" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div>
            <label style={{ fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: 6, display: "block" }}>Password</label>
            <input type="password" className="input-field" placeholder="At least 6 characters" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
          </div>
          {error && <p style={{ color: "var(--danger)", fontSize: "0.85rem" }}>{error}</p>}
          <button type="submit" className="btn-primary" disabled={loading} style={{ width: "100%", marginTop: 8 }}>
            {loading ? <span className="spinner" /> : "Create Account"}
          </button>
        </form>
        <p style={{ textAlign: "center", marginTop: 24, color: "var(--text-secondary)", fontSize: "0.9rem" }}>
          Already have an account? <Link href="/login" style={{ color: "var(--accent-primary)", textDecoration: "none", fontWeight: 600 }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
