import Link from "next/link";

import { fetchJson, fmtAge, fmtMoney, type Page, type Quote } from "../lib";

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const data = await fetchJson<Page<Quote>>("/quotes/");
  let quotes = data?.results ?? [];

  if (params.status) quotes = quotes.filter((q) => q.status === params.status);
  if (params.q) {
    const q = params.q.toLowerCase();
    quotes = quotes.filter(
      (item) =>
        item.reference.toLowerCase().includes(q) ||
        (item.notes ?? "").toLowerCase().includes(q),
    );
  }

  const total = quotes.reduce((s, q) => s + parseFloat(q.total || "0"), 0);
  const accepted = quotes.filter((q) => q.status === "accepted");
  const acceptedTotal = accepted.reduce((s, q) => s + parseFloat(q.total || "0"), 0);

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Quotes</h1>
          <p>AI-drafted estimates ready to send to customers.</p>
        </div>
        <div className="app-pagebar-actions">
          <a href="http://localhost:8000/admin/quotes/quote/" target="_blank" rel="noreferrer" className="btn btn-ghost">Open in admin ↗</a>
          <button type="button" className="btn btn-primary" disabled title="Wire to /api/quotes/from-photo/">
            + Draft from photo
          </button>
        </div>
      </div>

      <div className="app-content">
        <div className="detail-grid">
          <div className="detail-card">
            <div className="detail-card-label">Total quoted</div>
            <div className="detail-card-value">{fmtMoney(total)}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{quotes.length} quote{quotes.length === 1 ? "" : "s"}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Accepted</div>
            <div className="detail-card-value">{fmtMoney(acceptedTotal)}</div>
            <div className="muted" style={{ fontSize: 12.5 }}>{accepted.length} closed deal{accepted.length === 1 ? "" : "s"}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Acceptance rate</div>
            <div className="detail-card-value">
              {quotes.length === 0 ? "—" : Math.round((accepted.length / quotes.length) * 100) + "%"}
            </div>
            <div className="muted" style={{ fontSize: 12.5 }}>across all drafts</div>
          </div>
        </div>

        <form className="app-toolbar" method="get">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search reference or notes…"
            className="search-input"
          />
          <div className="tag-row" style={{ marginBottom: 0 }}>
            {["all", "draft", "sent", "viewed", "accepted", "declined"].map((s) => {
              const active = (params.status ?? "all") === s;
              const href = s === "all" ? "/dashboard/quotes" : `/dashboard/quotes?status=${s}`;
              return (
                <Link key={s} href={href} className={`tag-chip ${active ? "active" : ""}`} style={{ textDecoration: "none" }}>
                  {s}
                </Link>
              );
            })}
          </div>
          <button type="submit" className="btn btn-ghost" style={{ marginLeft: "auto" }}>Apply</button>
        </form>

        <section className="dash-card" style={{ padding: 0 }}>
          <table className="lineitems">
            <thead>
              <tr>
                <th>Reference</th>
                <th>Lead</th>
                <th>Status</th>
                <th>Drafted</th>
                <th className="num">Total</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {quotes.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                    No quotes match these filters.
                  </td>
                </tr>
              ) : (
                quotes.map((q) => (
                  <tr key={q.id}>
                    <td><Link href={`/dashboard/quotes/${q.id}`} style={{ fontWeight: 600 }}>{q.reference}</Link></td>
                    <td><Link href={`/dashboard/leads/${q.lead}`}>Lead #{q.lead}</Link></td>
                    <td><span className="tag">{q.status}</span> {q.drafted_by_ai && <span className="tag brand">AI</span>}</td>
                    <td style={{ color: "var(--muted)" }}>{fmtAge(q.created_at)}</td>
                    <td className="num"><strong>{fmtMoney(q.total)}</strong></td>
                    <td><Link href={`/dashboard/quotes/${q.id}`}>View →</Link></td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </section>
      </div>
    </>
  );
}
