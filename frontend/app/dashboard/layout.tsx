import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { apiFetch, getCurrentUser } from "@/app/lib/api";

import Sidebar from "./Sidebar";
import { DashGlobalTopbar } from "./Topbar";

export const metadata: Metadata = {
  title: "Dashboard",
  robots: { index: false, follow: false, nocache: true },
};

async function fetchCount(path: string): Promise<number> {
  try {
    const res = await apiFetch(path);
    if (!res.ok) return 0;
    const data = await res.json();
    return data?.count ?? 0;
  } catch {
    return 0;
  }
}

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard");

  const [leads, calls, quotes, businesses] = await Promise.all([
    fetchCount("/leads/"),
    fetchCount("/calls/"),
    fetchCount("/quotes/"),
    fetchCount("/businesses/"),
  ]);
  return (
    <div className="app-shell">
      <Sidebar counts={{ leads, calls, quotes, businesses }} />
      <div className="app-main">
        <DashGlobalTopbar user={user} />
        {children}
      </div>
    </div>
  );
}
