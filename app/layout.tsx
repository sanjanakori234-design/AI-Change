import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "AI Change Impact Analyzer — AI-Powered Study Platform",
  description:
    "Supercharge your studies with AI-powered summarization, flashcard generation, code impact analysis, and career insights. Built for students, powered by free AI models.",
  keywords: [
    "AI",
    "student",
    "study tools",
    "summarizer",
    "flashcards",
    "career insights",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <body style={{ fontFamily: "var(--font-inter), system-ui, sans-serif" }}>
        {/* Background orbs */}
        <div className="bg-orb bg-orb-1" />
        <div className="bg-orb bg-orb-2" />
        <div className="bg-orb bg-orb-3" />
        {children}
      </body>
    </html>
  );
}
