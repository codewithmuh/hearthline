import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchJson, fmtAge, fmtMoney, type Lead, type Page, type Quote, type Call } from "../../lib";
import { getAdminUrl } from "../../../lib/api";
import { getActiveCurrency } from "../../../lib/currency";
import { LeadActionPill, StatusPill } from "../../parts";

export default async function LeadDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lead = await fetchJson<Lead>(`/leads/${id}/`);
  if (!lead) notFound();

  const [quotesRes, callsRes, currency] = await Promise.all([
    fetchJson<Page<Quote>>("/quotes/"),
    fetchJson<Page<Call>>("/calls/"),
    getActiveCurrency(),
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
            {" · Lead #"}{lead.id}
            {lead.customer?.phone ? ` · ${lead.customer.phone}` : ""}
          </p>
        </div>
        <div className="app-pagebar-actions">
          <LeadActionPill lead={lead} currency={currency} />
          <a href={getAdminUrl(`/leads/lead/${lead.id}/change/`)} target="_blank" rel="noreferrer" className="btn btn-ghost">Edit ↗</a>
        </div>
      </div>

      <div className="app-content">
        <div className="detail-grid">
          <div className="detail-card">
            <div className="detail-card-label">Status</div>
            <div className="detail-card-value" style={{ textTransform: "capitalize" }}>{lead.status}</div>
            <div style={{ fontSize: 12, color: "var(--muted)", textTransform: "capitalize" }}>Temperature: {lead.temperature}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Estimated value</div>
            <div className="detail-card-value">{fmtMoney(lead.estimated_value, currency)}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>{quotes.length} quote{quotes.length === 1 ? "" : "s"} drafted</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">First contact</div>
            <div className="detail-card-value" style={{ fontSize: 18 }}>{fmtAge(lead.created_at)}</div>
            <div style={{ fontSize: 12, color: "var(--muted)" }}>Last activity {fmtAge(lead.updated_at)}</div>
          </div>
        </div>

        <article className="dash-card">
          <div className="dash-card-head"><h2>Project summary</h2></div>
          <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6, color: "var(--ink-2)" }}>
            {lead.project_summary || <span className="kv-value-muted">(no summary yet)</span>}
          </p>
          {Object.keys(lead.extracted_fields ?? {}).length > 0 && (
            <dl className="kv-list" style={{ marginTop: 14 }}>
              {Object.entries(lead.extracted_fields ?? {}).map(([k, v]) => (
                <div key={k}>
                  <dt>{k.replace(/_/g, " ")}</dt>
                  <dd>{typeof v === "object" ? JSON.stringify(v) : String(v)}</dd>
                </div>
              ))}
            </dl>
          )}
        </article>

        <article className="dash-card">
          <div className="dash-card-head"><h2>Conversation timeline</h2></div>
          {(lead.conversations?.[0]?.messages ?? []).length === 0 ? (
            <p className="kv-value-muted" style={{ fontSize: 13.5, margin: 0 }}>No messages logged yet.</p>
          ) : (
            <ul className="convo-thread">
              {lead.conversations.flatMap((c) => c.messages).map((m) => (
                <li key={m.id} className={`convo-msg convo-${m.role === "assistant" ? "out" : "in"}`}>
                  <div className="convo-bubble">{m.body}</div>
                  <div className="convo-meta">{m.role} · {fmtAge(m.created_at)}</div>
                </li>
              ))}
            </ul>
          )}
        </article>

        <div className="dash-split">
          <article className="dash-card">
            <div className="dash-card-head">
              <h2>Calls on this lead</h2>
              <span className="dash-card-meta">{calls.length}</span>
            </div>
            {calls.length === 0 ? (
              <p className="kv-value-muted" style={{ fontSize: 13.5, margin: 0 }}>No calls linked yet.</p>
            ) : (
              <ul className="dash-list">
                {calls.map((c) => (
                  <li key={c.id}>
                    <span className="dash-list-id">#{c.id}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {c.from_number}
                        <span className="tag">{c.provider}</span>
                        <StatusPill status={c.status} />
                      </div>
                      <div className="dash-list-meta">{c.summary || (c.transcript ? c.transcript.slice(0, 110) + "…" : "—")}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="dash-card">
            <div className="dash-card-head">
              <h2>Quotes</h2>
              <span className="dash-card-meta">{quotes.length}</span>
            </div>
            {quotes.length === 0 ? (
              <p className="kv-value-muted" style={{ fontSize: 13.5, margin: 0 }}>No quotes drafted yet.</p>
            ) : (
              <ul className="dash-list">
                {quotes.map((q) => (
                  <li key={q.id}>
                    <span className="dash-list-id">{q.reference}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {fmtMoney(q.total, currency)}
                        <StatusPill status={q.status} />
                        {q.drafted_by_ai && <span className="tag brand">AI</span>}
                      </div>
                      <div className="dash-list-meta">
                        <Link href={`/dashboard/quotes/${q.id}`} style={{ color: "var(--brand)" }}>View quote →</Link>
                      </div>
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
