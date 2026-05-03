import type { Metadata } from "next";
import { redirect } from "next/navigation";

import { getCurrentUser } from "@/app/lib/api";

import LoginForm from "./LoginForm";

export const metadata: Metadata = {
  title: "Sign in",
  robots: { index: false, follow: false, nocache: true },
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const { next: rawNext } = await searchParams;
  const next = typeof rawNext === "string" && rawNext.startsWith("/") ? rawNext : "/dashboard";
  const user = await getCurrentUser();
  if (user) redirect(next);
  return <LoginForm next={next} />;
}
