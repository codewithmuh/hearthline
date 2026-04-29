import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchJson, fmtAge, fmtMoney, type Lead, type Page, type Quote, type Call } from "../../lib";
import { LeadActionPill } from "../../parts";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await fetchJson<Lead>(`/leads/${id}/`);
  if (!lead) notFound();

  const [quotesRes, callsRes] = await Promise.all([
    fetchJson<Page<Quote>>("/quotes/"),
    fetchJson<Page<Call>>("/calls/"),
  ]);
  const quotes = (quotesRes?.results ?? []).filter((q) => q.lead === lead.id);
  const calls = (callsRes?.results ?? []).filter((c) => c.lead === lead.id);

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>{lead.customer?.name || "Unknown contact"}</h1>
          <p>
            <Link href="/dashboard/leads" style={{ color: "var(--muted)" }}>← All leads</Link>
            {" · "}Lead #{lead.id}{" · "}
            {lead.customer?.phone || lead.customer?.email}
          </p>
        </div>
        <div className="app-pagebar-actions">
          <LeadActionPill lead={lead} />
          <a href={`http://localhost:8000/admin/leads/lead/${lead.id}/change/`} target="_blank" rel="noreferrer" className="btn btn-ghost">Edit ↗</a>
          <button type="button" className="btn btn-primary" disabled title="Wire up to /api/quotes/from-photo/">
            Generate quote from photo
          </button>
        </div>
      </div>

      <div className="app-content">
        <div className="detail-grid">
          <div className="detail-card">
            <div className="detail-card-label">Status</div>
            <div className="detail-card-value">{lead.status}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>Temperature: {lead.temperature}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Estimated value</div>
            <div className="detail-card-value">{fmtMoney(lead.estimated_value)}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{quotes.length} quote{quotes.length === 1 ? "" : "s"} drafted</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">First contact</div>
            <div className="detail-card-value" style={{ fontSize: 18 }}>{fmtAge(lead.created_at)}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>Last activity {fmtAge(lead.updated_at)}</div>
          </div>
        </div>

        <article className="dash-card">
          <div className="dash-card-head"><h2>Project summary</h2></div>
          <p style={{ margin: 0, fontSize: 15, lineHeight: 1.6 }}>{lead.project_summary || "(no summary yet)"}</p>
          {Object.keys(lead.extracted_fields ?? {}).length > 0 && (
            <pre style={{ marginTop: 16, background: "var(--surface-2)", padding: 14, borderRadius: 10, fontSize: 12, overflow: "auto" }}>
              {JSON.stringify(lead.extracted_fields, null, 2)}
            </pre>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-card-head"><h2>Conversation timeline</h2></div>
          {(lead.conversations?.[0]?.messages ?? []).length === 0 ? (
            <p className="dash-empty">No messages logged yet.</p>
          ) : (
            <ul className="dash-list">
              {lead.conversations.flatMap((c) => c.messages).map((m) => (
                <li key={m.id}>
                  <span className="dash-list-id">{m.role}</span>
                  <div className="dash-list-body">
                    <div className="dash-list-title">{fmtAge(m.created_at)}</div>
                    <div className="dash-list-meta" style={{ color: "var(--ink-2)" }}>{m.body}</div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <div className="dash-split">
          <article className="dash-card">
            <div className="dash-card-head"><h2>Calls on this lead</h2></div>
            {calls.length === 0 ? (
              <p className="dash-empty">No calls linked yet.</p>
            ) : (
              <ul className="dash-list">
                {calls.map((c) => (
                  <li key={c.id}>
                    <span className="dash-list-id">#{c.id}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title">{c.from_number} <span className="tag">{c.provider}</span><span className="tag">{c.status}</span></div>
                      <div className="dash-list-meta">{c.summary || (c.transcript ? c.transcript.slice(0, 140) + "…" : "—")}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="dash-card">
            <div className="dash-card-head"><h2>Quotes</h2></div>
            {quotes.length === 0 ? (
              <p className="dash-empty">No quotes drafted yet.</p>
            ) : (
              <ul className="dash-list">
                {quotes.map((q) => (
                  <li key={q.id}>
                    <span className="dash-list-id">{q.reference}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title">{fmtMoney(q.total)} <span className="tag">{q.status}</span>{q.drafted_by_ai && <span className="tag brand">AI</span>}</div>
                      <div className="dash-list-meta"><Link href={`/dashboard/quotes/${q.id}`}>View quote →</Link></div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>
        </div>
      </div>
    </>
  );
}
