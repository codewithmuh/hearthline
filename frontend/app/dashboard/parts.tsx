import { fmtMoney, type Lead } from "./format";

export function LeadActionPill({ lead }: { lead: Lead }) {
  const status = lead.status;
  const label =
    status === "won" ? `Deal Won · ${fmtMoney(lead.estimated_value)}`
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
