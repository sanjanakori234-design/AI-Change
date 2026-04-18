"use client";
import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getSupabaseBrowserClient } from "@/lib/supabase";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard Home", icon: "🏠" },
  { href: "/dashboard/analyzer", label: "Impact Analyzer", icon: "🕸️" },
  { href: "/dashboard/understanding", label: "Smart Code Explainer", icon: "🤖" },
  { href: "/dashboard/bugs", label: "Bug Detector", icon: "🐛" },
  { href: "/dashboard/chat", label: "Repo AI Chat", icon: "💬" },
];

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [userEmail, setUserEmail] = useState("");
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) router.push("/login");
      else setUserEmail(data.user.email || "");
    });
  }, [router, supabase]);

  async function handleLogout() {
    await supabase.auth.signOut();
    router.push("/login");
  }

  return (
    <div style={{ display: "flex", minHeight: "100vh", position: "relative", zIndex: 1 }}>
      {/* Sidebar */}
      <aside style={{
        width: sidebarOpen ? 280 : 0,
        overflow: "hidden",
        background: "rgba(10,10,30,0.85)",
        backdropFilter: "blur(20px)",
        borderRight: "1px solid var(--glass-border)",
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
        flexShrink: 0,
      }}>
        <div style={{ padding: "24px 20px", borderBottom: "1px solid var(--glass-border)" }}>
          <Link href="/dashboard" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: "1.5rem" }}>⚙️</span>
            <span style={{ fontWeight: 700, fontSize: "1.05rem" }} className="gradient-text">Impact Analyzer</span>
          </Link>
        </div>
        <nav style={{ flex: 1, padding: "16px 12px", display: "flex", flexDirection: "column", gap: 4 }}>
          {NAV_ITEMS.map(item => (
            <Link key={item.href} href={item.href} className={`sidebar-link ${pathname === item.href ? "active" : ""}`}>
              <span style={{ fontSize: "1.15rem" }}>{item.icon}</span>
              {item.label}
            </Link>
          ))}
        </nav>
        <div style={{ padding: "16px 12px", borderTop: "1px solid var(--glass-border)" }}>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", padding: "0 16px", marginBottom: 8, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{userEmail}</p>
          <button onClick={handleLogout} className="sidebar-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", color: "var(--danger)", fontFamily: "inherit" }}>
            <span>🚪</span> Sign Out
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main style={{ flex: 1, overflow: "auto" }}>
        <div style={{ padding: "24px 16px 8px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <button onClick={() => setSidebarOpen(!sidebarOpen)} style={{ background: "none", border: "1px solid var(--glass-border)", borderRadius: 8, padding: "8px 12px", cursor: "pointer", color: "var(--text-primary)", fontSize: "1.1rem" }}>☰</button>
        </div>
        <div style={{ padding: "8px 32px 40px", maxWidth: 1000 }}>
          {children}
        </div>
      </main>
    </div>
  );
}
