"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { fmtAge, type TicketDetail } from "../../format";

const STATUSES: { key: TicketDetail["status"]; label: string }[] = [
  { key: "open", label: "Open" },
  { key: "waiting", label: "Waiting" },
  { key: "escalated", label: "Escalated" },
  { key: "resolved", label: "Resolved" },
];

const AUTHOR_LABEL: Record<string, string> = {
  customer: "Customer",
  ai: "Anna (AI)",
  agent: "You",
  system: "System",
};

export default function TicketThread({ ticket }: { ticket: TicketDetail }) {
  const router = useRouter();
  const [reply, setReply] = useState("");
  const [busy, setBusy] = useState<"reply" | "status" | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function sendReply() {
    if (!reply.trim() || busy) return;
    setBusy("reply");
    setError(null);
    const res = await fetch(`/api/proxy/support/tickets/${ticket.id}/reply/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ body: reply.trim() }),
    });
    setBusy(null);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      setError(text || `HTTP ${res.status}`);
      return;
    }
    const data = await res.json();
    if (!data.ok) {
      setError(`Sent failed: ${data.error || "unknown error"}`);
    }
    setReply("");
    router.refresh();
  }

  async function patchStatus(patch: { status?: TicketDetail["status"]; human_only?: boolean }) {
    setBusy("status");
    setError(null);
    const res = await fetch(`/api/proxy/support/tickets/${ticket.id}/status/`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    setBusy(null);
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      setError(text || `HTTP ${res.status}`);
      return;
    }
    router.refresh();
  }

  return (
    <div className="ticket-grid">
      <article className="dash-card ticket-thread">
        <div className="dash-card-head">
          <h2>Conversation</h2>
          <span className="dash-card-meta">{ticket.messages.length} messages</span>
        </div>

        <div className="ticket-messages">
          {ticket.messages.map((m) => (
            <div key={m.id} className={`ticket-msg ticket-msg-${m.direction}`}>
              <div className="ticket-msg-meta">
                <strong>{AUTHOR_LABEL[m.author] ?? m.author}</strong>
                <span className="dim"> · {fmtAge(m.created_at)}</span>
              </div>
              <div className="ticket-msg-body">{m.body}</div>
            </div>
          ))}
          {ticket.messages.length === 0 && (
            <div className="dim" style={{ padding: 16 }}>No messages yet.</div>
          )}
        </div>

        {ticket.status !== "resolved" && (
          <div className="ticket-reply">
            <textarea
              className="text-input text-input-area"
              value={reply}
              onChange={(e) => { setReply(e.target.value); setError(null); }}
              placeholder={
                ticket.human_only
                  ? "Human-only mode — Anna won't reply automatically. Type your message…"
                  : "Reply as a human agent (sends on the original channel)…"
              }
              rows={3}
            />
            {error && <div className="auth-error" style={{ marginTop: 6 }}>{error}</div>}
            <div className="settings-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={sendReply}
                disabled={!reply.trim() || busy === "reply"}
              >
                {busy === "reply" ? "Sending…" : "Send reply"}
              </button>
            </div>
          </div>
        )}
      </article>

      <aside className="dash-card ticket-side">
        <div className="dash-card-head">
          <h2>Ticket</h2>
        </div>
        <dl className="kv">
          <dt>Channel</dt><dd>{ticket.channel}</dd>
          <dt>Sender</dt><dd>{ticket.sender_id}</dd>
          {ticket.subject && (<><dt>Subject</dt><dd>{ticket.subject}</dd></>)}
          <dt>Opened</dt><dd>{fmtAge(ticket.created_at)}</dd>
          <dt>Last activity</dt><dd>{fmtAge(ticket.last_message_at ?? ticket.created_at)}</dd>
        </dl>

        <div className="ticket-status-controls">
          <p className="kv-value-muted" style={{ fontSize: 12, margin: "12px 0 6px" }}>
            Status
          </p>
          <div className="tag-row" style={{ display: "flex", flexWrap: "wrap" }}>
            {STATUSES.map((s) => (
              <button
                key={s.key}
                type="button"
                className={`tag-chip ${ticket.status === s.key ? "active" : ""}`}
                onClick={() => patchStatus({ status: s.key })}
                disabled={busy === "status" || ticket.status === s.key}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>

        <div className="ticket-toggle">
          <label>
            <input
              type="checkbox"
              checked={ticket.human_only}
              disabled={busy === "status"}
              onChange={(e) => patchStatus({ human_only: e.target.checked })}
            />
            <span>Human-only (mute Anna)</span>
          </label>
          <p className="kv-value-muted" style={{ fontSize: 12 }}>
            When on, new inbound messages are stored but Anna won&apos;t reply automatically.
          </p>
        </div>
      </aside>
    </div>
  );
}
