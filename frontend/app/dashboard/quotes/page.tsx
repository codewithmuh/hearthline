import Link from "next/link";

import { fetchJson, fmtAge, fmtMoney, type Page, type Quote } from "../lib";
import { getActiveCurrency } from "../../lib/currency";
import { StatusPill } from "../parts";

export default async function QuotesPage({ searchParams }: { searchParams: Promise<{ status?: string; q?: string }> }) {
  const params = await searchParams;
  const [data, currency] = await Promise.all([
    fetchJson<Page<Quote>>("/quotes/"),
    getActiveCurrency(),
  ]);
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
          <Link href="/dashboard/quotes/new" className="btn btn-primary">+ New quote</Link>
        </div>
      </div>

      <div className="app-content">
        <div className="detail-grid">
          <div className="detail-card">
            <div className="detail-card-label">Total quoted</div>
            <div className="detail-card-value">{fmtMoney(total, currency)}</div>
            <div className="muted" style={{ fontSize: 12, color: "var(--muted)" }}>{quotes.length} quote{quotes.length === 1 ? "" : "s"}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Accepted</div>
            <div className="detail-card-value">{fmtMoney(acceptedTotal, currency)}</div>
            <div className="muted" style={{ fontSize: 12, color: "var(--muted)" }}>{accepted.length} closed deal{accepted.length === 1 ? "" : "s"}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Acceptance rate</div>
            <div className="detail-card-value">
              {quotes.length === 0 ? "—" : Math.round((accepted.length / quotes.length) * 100) + "%"}
            </div>
            <div className="muted" style={{ fontSize: 12, color: "var(--muted)" }}>across all drafts</div>
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
          <div className="tag-row" style={{ display: "flex" }}>
            {["all", "draft", "sent", "viewed", "accepted", "declined"].map((s) => {
              const active = (params.status ?? "all") === s;
              const href = s === "all" ? "/dashboard/quotes" : `/dashboard/quotes?status=${s}`;
              return (
                <Link key={s} href={href} className={`tag-chip ${active ? "active" : ""}`}>
                  {s}
                </Link>
              );
            })}
          </div>
        </form>

        <section className="app-table">
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
                    <td><Link href={`/dashboard/quotes/${q.id}`} style={{ fontWeight: 600, color: "var(--ink)" }}>{q.reference}</Link></td>
                    <td><Link href={`/dashboard/leads/${q.lead}`} style={{ color: "var(--brand)" }}>Lead #{q.lead}</Link></td>
                    <td>
                      <StatusPill status={q.status} />
                      {q.drafted_by_ai && <span className="tag brand" style={{ marginLeft: 6 }}>AI</span>}
                    </td>
                    <td style={{ color: "var(--muted)", fontSize: 12.5 }}>{fmtAge(q.created_at)}</td>
                    <td className="num"><strong>{fmtMoney(q.total, currency)}</strong></td>
                    <td><Link href={`/dashboard/quotes/${q.id}`} style={{ color: "var(--brand)" }}>View →</Link></td>
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
