import Link from "next/link";

import { getPersonaName } from "@/app/lib/persona";

import { fetchJson, fmtAge, fmtMoney, type Business, type Call, type Lead, type Page, type Quote } from "./lib";
import { LeadActionPill, StatusPill } from "./parts";

export default async function OverviewPage() {
  const [leadsRes, callsRes, quotesRes, persona, businessesRes] = await Promise.all([
    fetchJson<Page<Lead>>("/leads/"),
    fetchJson<Page<Call>>("/calls/"),
    fetchJson<Page<Quote>>("/quotes/"),
    getPersonaName(),
    fetchJson<Page<Business>>("/businesses/"),
  ]);
  const leads = leadsRes?.results ?? [];
  const calls = callsRes?.results ?? [];
  const quotes = quotesRes?.results ?? [];
  const currency = businessesRes?.results?.[0]?.currency ?? "USD";

  const totalQuoteValue = quotes.reduce((s, q) => s + parseFloat(q.total || "0"), 0);
  const bookedCount = leads.filter((l) => l.status === "booked" || l.status === "won").length;
  const wonCount = leads.filter((l) => l.status === "won").length;

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Overview</h1>
          <p>Live operations across phone, SMS, and chat.</p>
        </div>
        <div className="app-pagebar-actions">
          <Link href="/dashboard/leads" className="btn btn-ghost">View leads →</Link>
          <Link href="/dashboard/test-call" className="btn btn-primary">▶ Test {persona}</Link>
        </div>
      </div>

      <div className="app-content">
        <div className="mock-kpis" style={{ padding: 0 }}>
          <Kpi label="Total Leads" value={leads.length} delta={leads.length > 0 ? `${leads.length} captured` : "Awaiting first inbound"} />
          <Kpi label="Quoted value" value={fmtMoney(totalQuoteValue, currency)} delta={`${quotes.length} drafted by AI`} />
          <Kpi label="Bookings" value={bookedCount} delta={wonCount > 0 ? `${wonCount} won` : "—"} />
        </div>

        <section className="app-table">
          <div className="dash-card-head" style={{ padding: "16px 20px", borderBottom: "1px solid rgba(232,232,227,0.7)", marginBottom: 0 }}>
            <h2 style={{ display: "flex", alignItems: "center", gap: 12, margin: 0, fontSize: 15, fontWeight: 700 }}>
              Recent Interactions
              <span className="mock-livefeed">
                <span className="mock-pulse" /> Live
              </span>
            </h2>
            <Link href="/dashboard/leads" className="dash-card-meta">View all {leads.length} →</Link>
          </div>

          <div className="app-table-head">
            <span>Customer</span>
            <span>Project</span>
            <span>Value</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>

          {leads.length === 0 ? (
            <div className="empty-card" style={{ borderRadius: 0, border: "none", background: "white", margin: 0 }}>
              <h3>No leads yet</h3>
              <p>As soon as Hearthline takes a call, leads land here in real time.</p>
            </div>
          ) : (
            leads.slice(0, 6).map((lead) => (
              <Link href={`/dashboard/leads/${lead.id}`} key={lead.id} className="app-table-row">
                <div className="app-row-customer">
                  <span className="app-row-avatar">{(lead.customer?.name || "?").slice(0, 1).toUpperCase()}</span>
                  <div>
                    <div className="app-row-title">{lead.customer?.name || "Unknown"}</div>
                    <div className="app-row-sub">{lead.customer?.phone || lead.customer?.email || "—"}</div>
                  </div>
                </div>
                <div>
                  <div className="app-row-title app-row-title-soft">{lead.project_summary || "(no summary)"}</div>
                  <div className="app-row-sub">{fmtAge(lead.created_at)} · {lead.temperature}</div>
                </div>
                <div className="app-row-value">{fmtMoney(lead.estimated_value, currency)}</div>
                <div className="app-row-action">
                  <LeadActionPill lead={lead} currency={currency} />
                </div>
              </Link>
            ))
          )}
        </section>

        <div className="dash-split">
          <article className="dash-card">
            <div className="dash-card-head">
              <h2>Recent calls</h2>
              <Link href="/dashboard/calls" className="dash-card-meta">View all →</Link>
            </div>
            {calls.length === 0 ? (
              <p className="kv-value-muted" style={{ fontSize: 13.5, margin: 0 }}>No calls yet — wire up Vapi or run the test-call flow.</p>
            ) : (
              <ul className="dash-list">
                {calls.slice(0, 4).map((c) => (
                  <li key={c.id}>
                    <span className="dash-list-id">#{c.id}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {c.from_number || "unknown"}
                        <StatusPill status={c.status} />
                      </div>
                      <div className="dash-list-meta">
                        {c.summary || (c.transcript ? c.transcript.slice(0, 110) + "…" : "(no transcript)")}
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
              <Link href="/dashboard/quotes" className="dash-card-meta">View all →</Link>
            </div>
            {quotes.length === 0 ? (
              <p className="kv-value-muted" style={{ fontSize: 13.5, margin: 0 }}>No quotes yet — draft one or POST a photo.</p>
            ) : (
              <ul className="dash-list">
                {quotes.slice(0, 4).map((q) => (
                  <li key={q.id}>
                    <span className="dash-list-id">{q.reference}</span>
                    <div className="dash-list-body">
                      <div className="dash-list-title" style={{ display: "flex", alignItems: "center", gap: 6, flexWrap: "wrap" }}>
                        {fmtMoney(q.total, currency)}
                        <StatusPill status={q.status} />
                        {q.drafted_by_ai && <span className="tag brand">AI</span>}
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
