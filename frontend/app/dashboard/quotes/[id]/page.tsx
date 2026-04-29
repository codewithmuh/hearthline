import Link from "next/link";
import { notFound } from "next/navigation";

import { fetchJson, fmtAge, fmtMoney, type Quote } from "../../lib";

export default async function QuoteDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const q = await fetchJson<Quote>(`/quotes/${id}/`);
  if (!q) notFound();

  const assessment = q.photo_assessment as Record<string, unknown>;

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>{q.reference}</h1>
          <p>
            <Link href="/dashboard/quotes" style={{ color: "var(--muted)" }}>← All quotes</Link>
            {" · "}For <Link href={`/dashboard/leads/${q.lead}`}>Lead #{q.lead}</Link>
            {" · "}{fmtAge(q.created_at)}
          </p>
        </div>
        <div className="app-pagebar-actions">
          <span className="tag">{q.status}</span>
          {q.drafted_by_ai && <span className="tag brand">AI-drafted</span>}
          <a href={`http://localhost:8000/admin/quotes/quote/${q.id}/change/`} target="_blank" rel="noreferrer" className="btn btn-ghost">Edit ↗</a>
          <button type="button" className="btn btn-primary" disabled title="Wire up Stripe checkout">Send + collect deposit</button>
        </div>
      </div>

      <div className="app-content">
        <article className="dash-card" style={{ padding: 0 }}>
          <table className="lineitems">
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Qty</th>
                <th className="num">Unit Price</th>
                <th className="num">Total</th>
              </tr>
            </thead>
            <tbody>
              {q.line_items.map((li) => (
                <tr key={li.id}>
                  <td>{li.description}</td>
                  <td className="num">{li.quantity}</td>
                  <td className="num">{fmtMoney(li.unit_price)}</td>
                  <td className="num">{fmtMoney(li.total)}</td>
                </tr>
              ))}
              <tr>
                <td colSpan={3} className="num" style={{ color: "var(--muted)" }}>Subtotal</td>
                <td className="num">{fmtMoney(q.subtotal)}</td>
              </tr>
              <tr>
                <td colSpan={3} className="num" style={{ color: "var(--muted)" }}>Tax (8%)</td>
                <td className="num">{fmtMoney(q.tax)}</td>
              </tr>
              <tr className="total-row">
                <td colSpan={3} className="num">Total</td>
                <td className="num">{fmtMoney(q.total)}</td>
              </tr>
            </tbody>
          </table>
        </article>

        {q.notes && (
          <article className="dash-card">
            <div className="dash-card-head"><h2>Customer-facing notes</h2></div>
            <p style={{ margin: 0, fontSize: 14.5, lineHeight: 1.6 }}>{q.notes}</p>
          </article>
        )}

        {assessment && Object.keys(assessment).length > 0 && (
          <article className="dash-card">
            <div className="dash-card-head"><h2>Photo assessment (vision pipeline)</h2></div>
            <pre style={{ margin: 0, background: "var(--surface-2)", padding: 14, borderRadius: 10, fontSize: 12, overflow: "auto" }}>
              {JSON.stringify(assessment, null, 2)}
            </pre>
          </article>
        )}
      </div>
    </>
  );
}
