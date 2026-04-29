import Link from "next/link";

import { fetchJson, fmtAge, fmtMoney, type Call, type Lead, type Page, type Quote } from "./lib";
import { LeadActionPill } from "./parts";

export default async function OverviewPage() {
  const [leadsRes, callsRes, quotesRes] = await Promise.all([
    fetchJson<Page<Lead>>("/leads/"),
    fetchJson<Page<Call>>("/calls/"),
    fetchJson<Page<Quote>>("/quotes/"),
  ]);
  const leads = leadsRes?.results ?? [];
  const calls = callsRes?.results ?? [];
  const quotes = quotesRes?.results ?? [];

  const totalQuoteValue = quotes.reduce((s, q) => s + parseFloat(q.total || "0"), 0);
  const bookedCount = leads.filter((l) => l.status === "booked" || l.status === "won").length;
  const wonCount = leads.filter((l) => l.status === "won").length;

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Overview</h1>
          <p>Live operations across phone, SMS, and chat for Rolling Shutters Inc.</p>
        </div>
        <div className="app-pagebar-actions">
          <Link href="/dashboard/leads" className="btn btn-ghost">View leads →</Link>
          <a href="http://localhost:8000/admin/" target="_blank" rel="noreferrer" className="btn btn-primary">+ New entry</a>
        </div>
      </div>

      <div className="app-content">
        {/* KPI strip */}
        <div className="mock-kpis" style={{ padding: 0 }}>
          <Kpi label="Total Leads" value={leads.length} delta={leads.length > 0 ? `${leads.length} captured` : "Waiting on first inbound"} />
          <Kpi label="Quotes Generated" value={fmtMoney(totalQuoteValue)} delta={`${quotes.length} drafted by AI`} />
          <Kpi label="Installations Booked" value={bookedCount} delta={wonCount > 0 ? `${wonCount} won` : "—"} />
        </div>

        {/* Recent Interactions */}
        <section className="dash-card" style={{ padding: 0 }}>
          <div className="dash-card-head" style={{ padding: "16px 20px", borderBottom: "1px solid var(--border)", marginBottom: 0 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 12 }}>
              Recent Interactions
              <span className="mock-livefeed">
                <span className="mock-pulse" /> Live
              </span>
            </h2>
            <Link href="/dashboard/leads" className="dash-card-meta" style={{ textDecoration: "underline" }}>
              View all {leads.length} →
            </Link>
          </div>

          <div className="mock-thead" style={{ borderRadius: 0, borderTop: "none" }}>
            <span>Contact</span>
            <span>AI Assistant</span>
            <span>Activity</span>
            <span style={{ textAlign: "right" }}>Automated Actions</span>
          </div>

          {leads.length === 0 ? (
            <div className="empty-card" style={{ margin: 16, border: "1px dashed var(--border-strong)" }}>
              <h3>No leads yet</h3>
              <p>As soon as Hearthline takes a call, leads will land here in real time.</p>
            </div>
          ) : (
            <div>
              {leads.slice(0, 8).map((lead) => (
                <Link href={`/dashboard/leads/${lead.id}`} key={lead.id} className="mock-row" style={{ borderRadius: 0, textDecoration: "none", color: "inherit" }}>
                  <div className="mock-contact">
                    <span className="mock-msg-icon" aria-hidden>💬</span>
                    <div>
                      <div className="mock-contact-name">{lead.customer?.name || "Unknown"}</div>
                      <div className="mock-contact-sub">{lead.customer?.phone || lead.customer?.email || "—"}</div>
                    </div>
                  </div>
                  <div className="mock-assist">
                    <span className="mock-assist-avatar">A</span>
                    <span>Anna</span>
                  </div>
                  <div>
                    <div className="mock-activity-text">{lead.project_summary || "(no summary)"}</div>
                    <div className="mock-activity-age">{fmtAge(lead.created_at)}</div>
                  </div>
                  <div className="mock-action">
                    <LeadActionPill lead={lead} />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {/* Calls + Quotes side-by-side */}
        <div className="dash-split">
          <article className="dash-card">
            <div className="dash-card-head">
              <h2>Recent calls</h2>
              <Link href="/dashboard/calls" className="dash-card-meta" style={{ textDecoration: "underline" }}>View all →</Link>
            </div>
            {calls.length === 0 ? (
              <p className="dash-empty">Point a Vapi or Twilio webhook at <code>/api/calls/webhooks/vapi/</code>.</p>
            ) : (
              <ul className="dash-list">
                {calls.slice(0, 5).map((c) => (
                  <li key={c.id}>
                    <span className="dash-list-id">#{c.id}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title">
                        {c.from_number || "unknown"} → {c.to_number || "—"}
                        <span className="tag">{c.provider}</span>
                        <span className="tag">{c.status}</span>
                      </div>
                      <div className="dash-list-meta">
                        {c.summary || (c.transcript ? c.transcript.slice(0, 140) + "…" : "(no transcript)")}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </article>

          <article className="dash-card">
            <div className="dash-card-head">
              <h2>AI-drafted quotes</h2>
              <Link href="/dashboard/quotes" className="dash-card-meta" style={{ textDecoration: "underline" }}>View all →</Link>
            </div>
            {quotes.length === 0 ? (
              <p className="dash-empty">POST a photo to <code>/api/quotes/from-photo/</code>.</p>
            ) : (
              <ul className="dash-list">
                {quotes.slice(0, 5).map((q) => (
                  <li key={q.id}>
                    <span className="dash-list-id">{q.reference}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title">
                        {fmtMoney(q.total)}
                        <span className="tag">{q.status}</span>
                        {q.drafted_by_ai && <span className="tag brand">AI-drafted</span>}
                      </div>
                      <div className="dash-list-meta">{q.notes}</div>
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

function Kpi({ label, value, delta }: { label: string; value: string | number; delta: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{typeof value === "number" ? value.toLocaleString() : value}</div>
      <div className="kpi-card-delta up"><span aria-hidden>↑</span> {delta}</div>
    </div>
  );
}
