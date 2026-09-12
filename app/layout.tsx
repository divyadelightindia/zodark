import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Zodark — Autonomous Agent Orb Interface",
  description:
    "Zodark — An animated autonomous-agent orb + reasoning-graph AI interface.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
