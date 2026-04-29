import { fmtMoney, type Lead } from "./lib";

export function LeadActionPill({ lead }: { lead: Lead }) {
  if (lead.status === "won") {
    return (
      <span className="action-pill won">
        <span className="action-dot" style={{ background: "#16a34a" }} /> Deal Won {fmtMoney(lead.estimated_value)}
      </span>
    );
  }
  if (lead.status === "quoted") {
    return (
      <span className="action-pill quote">
        <span className="action-dot" style={{ background: "#7c3aed" }} /> Quote Sent
      </span>
    );
  }
  if (lead.status === "booked") {
    return (
      <span className="action-pill booked">
        <span className="action-dot" style={{ background: "#2563eb" }} /> Booked
      </span>
    );
  }
  return (
    <span className="action-pill status">
      <span className="action-dot" style={{ background: "#6b7280" }} /> {lead.status}
    </span>
  );
}
