import { fmtMoney, type Lead } from "./format";

export function LeadActionPill({ lead, currency = "USD" }: { lead: Lead; currency?: string }) {
  const status = lead.status;
  const label =
    status === "won" ? `Deal Won · ${fmtMoney(lead.estimated_value, currency)}`
    : status === "quoted" ? "Quote Sent"
    : status === "booked" ? "Booked"
    : status === "qualifying" ? "Qualifying"
    : status === "lost" ? "Lost"
    : status === "new" ? "New"
    : status;
  return <span className={`pill pill-${status}`}>{label}</span>;
}

export function StatusPill({ status }: { status: string }) {
  return <span className={`pill pill-${status}`}>{status.replace(/_/g, " ")}</span>;
}
