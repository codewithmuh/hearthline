import Link from "next/link";

import { fetchJson, fmtAge, fmtMoney, type Lead, type Page } from "../lib";
import { LeadActionPill } from "../parts";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const params = await searchParams;
  const data = await fetchJson<Page<Lead>>("/leads/");
  let leads = data?.results ?? [];

  if (params.status) {
    leads = leads.filter((l) => l.status === params.status);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    leads = leads.filter(
      (l) =>
        (l.customer?.name ?? "").toLowerCase().includes(q) ||
        (l.customer?.phone ?? "").toLowerCase().includes(q) ||
        (l.customer?.email ?? "").toLowerCase().includes(q) ||
        l.project_summary.toLowerCase().includes(q),
    );
  }

  const statuses = ["all", "new", "qualifying", "quoted", "booked", "won", "lost"];

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Leads</h1>
          <p>Every inbound captured and qualified by Hearthline.</p>
        </div>
        <div className="app-pagebar-actions">
          <a href="http://localhost:8000/admin/leads/lead/" target="_blank" rel="noreferrer" className="btn btn-ghost">Open in admin ↗</a>
          <a href="http://localhost:8000/admin/leads/lead/add/" target="_blank" rel="noreferrer" className="btn btn-primary">+ New lead</a>
        </div>
      </div>

      <div className="app-content">
        <form className="app-toolbar" method="get">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by name, phone, email, summary…"
            className="search-input"
          />
          <div className="tag-row" style={{ marginBottom: 0 }}>
            {statuses.map((s) => {
              const active = (params.status ?? "all") === s;
              const href = s === "all" ? "/dashboard/leads" : `/dashboard/leads?status=${s}`;
              return (
                <Link key={s} href={href} className={`tag-chip ${active ? "active" : ""}`} style={{ textDecoration: "none" }}>
                  {s}
                </Link>
              );
            })}
          </div>
          <button type="submit" className="btn btn-ghost" style={{ marginLeft: "auto" }}>Apply</button>
        </form>

        <section className="app-table">
          <div className="mock-thead">
            <span>Contact</span>
            <span>AI Assistant</span>
            <span>Activity</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          {leads.length === 0 ? (
            <div className="empty-card" style={{ borderRadius: 0, border: "none" }}>
              <h3>No leads match these filters</h3>
              <p>Try clearing the filters or seed demo data with <code>docker compose exec backend python manage.py seed_demo</code>.</p>
            </div>
          ) : (
            leads.map((lead) => (
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
                  <div className="mock-activity-age">{fmtAge(lead.created_at)} · {lead.temperature} · est {fmtMoney(lead.estimated_value)}</div>
                </div>
                <div className="mock-action">
                  <LeadActionPill lead={lead} />
                </div>
              </Link>
            ))
          )}
        </section>
      </div>
    </>
  );
}
