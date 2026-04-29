import type { Metadata } from "next";
import Sidebar from "./Sidebar";

export const metadata: Metadata = {
  title: "Hearthline · Dashboard",
};

const API_URL =
  process.env.INTERNAL_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:8000/api";

async function fetchCount(path: string): Promise<number> {
  try {
    const res = await fetch(`${API_URL}${path}`, { cache: "no-store" });
    if (!res.ok) return 0;
    const data = await res.json();
    return data?.count ?? 0;
  } catch {
    return 0;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [leads, calls, quotes, businesses] = await Promise.all([
    fetchCount("/leads/"),
    fetchCount("/calls/"),
    fetchCount("/quotes/"),
    fetchCount("/businesses/"),
  ]);
  return (
    <div className="app-shell">
      <Sidebar counts={{ leads, calls, quotes, businesses }} />
      <div className="app-main">{children}</div>
    </div>
  );
}
