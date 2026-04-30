"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import type { Quote } from "../../lib";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type LineItemDraft = {
  id?: number;
  description: string;
  quantity: string;
  unit_price: string;
};

const STATUSES = ["draft", "sent", "viewed", "accepted", "declined"];

function fmtMoney(n: number | string): string {
  const num = typeof n === "string" ? parseFloat(n) : n;
  if (Number.isNaN(num)) return "—";
  return num.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
}

export default function QuoteEditor({ quote, businessName }: { quote: Quote; businessName: string }) {
  const router = useRouter();
  const [items, setItems] = useState<LineItemDraft[]>(
    quote.line_items.map((li) => ({
      id: li.id,
      description: li.description,
      quantity: String(li.quantity),
      unit_price: String(li.unit_price),
    })),
  );
  const [status, setStatus] = useState(quote.status);
  const [notes, setNotes] = useState(quote.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<Date | null>(null);

  const totals = useMemo(() => {
    const subtotal = items.reduce((s, it) => s + (parseFloat(it.quantity || "0") * parseFloat(it.unit_price || "0")), 0);
    const tax = subtotal * 0.08;
    return { subtotal, tax, total: subtotal + tax };
  }, [items]);

  function updateItem(idx: number, key: keyof LineItemDraft, value: string) {
    setItems((arr) => arr.map((it, i) => (i === idx ? { ...it, [key]: value } : it)));
  }

  function addItem() {
    setItems((arr) => [...arr, { description: "", quantity: "1", unit_price: "0" }]);
  }

  function removeItem(idx: number) {
    setItems((arr) => arr.filter((_, i) => i !== idx));
  }

  async function save() {
    setSaving(true);
    setError(null);
    try {
      const payload = {
        status,
        notes,
        line_items: items.map((it) => ({
          description: it.description.slice(0, 255),
          quantity: parseFloat(it.quantity || "0"),
          unit_price: parseFloat(it.unit_price || "0"),
        })),
      };
      const res = await fetch(`${API_URL}/quotes/${quote.id}/`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      setSavedAt(new Date());
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  function downloadPdf() {
    window.print();
  }

  async function delQuote() {
    if (!confirm("Delete this quote? This cannot be undone.")) return;
    const res = await fetch(`${API_URL}/quotes/${quote.id}/`, { method: "DELETE" });
    if (res.ok) router.push("/dashboard/quotes");
    else setError("Failed to delete");
  }

  return (
    <>
      <div className="app-pagebar no-print">
        <div>
          <h1>{quote.reference}</h1>
          <p>
            <Link href="/dashboard/quotes" style={{ color: "var(--muted)" }}>← All quotes</Link>
            {" · "}For <Link href={`/dashboard/leads/${quote.lead}`}>Lead #{quote.lead}</Link>
            {" · created "}{fmtDate(quote.created_at)}
          </p>
        </div>
        <div className="app-pagebar-actions">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-inline">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          {quote.drafted_by_ai && <span className="tag brand">AI-drafted</span>}
          <button type="button" className="btn btn-ghost" onClick={delQuote}>Delete</button>
          <button type="button" className="btn btn-ghost" onClick={downloadPdf}>Download PDF</button>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Saving…" : "Save changes"}
          </button>
        </div>
      </div>

      <div className="app-content">
        {error && <div className="banner-error no-print">{error}</div>}
        {savedAt && !error && <div className="banner-ok no-print">Saved at {savedAt.toLocaleTimeString()}</div>}

        {/* Printable area */}
        <article className="quote-doc">
          <header className="quote-doc-head">
            <div>
              <div className="quote-doc-brand">{businessName}</div>
              <div className="quote-doc-tag">Estimate</div>
            </div>
            <div className="quote-doc-meta">
              <div><span>Reference</span><strong>{quote.reference}</strong></div>
              <div><span>Date</span><strong>{fmtDate(quote.created_at)}</strong></div>
              <div><span>Status</span><strong>{status}</strong></div>
            </div>
          </header>

          <table className="quote-doc-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Qty</th>
                <th className="num">Unit price</th>
                <th className="num">Total</th>
                <th className="no-print" />
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>
                    <input
                      type="text"
                      value={it.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                      className="quote-input"
                      placeholder="Line item description"
                    />
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      step="0.01"
                      value={it.quantity}
                      onChange={(e) => updateItem(i, "quantity", e.target.value)}
                      className="quote-input quote-input-num"
                    />
                  </td>
                  <td className="num">
                    <input
                      type="number"
                      step="0.01"
                      value={it.unit_price}
                      onChange={(e) => updateItem(i, "unit_price", e.target.value)}
                      className="quote-input quote-input-num"
                    />
                  </td>
                  <td className="num quote-line-total">
                    {fmtMoney(parseFloat(it.quantity || "0") * parseFloat(it.unit_price || "0"))}
                  </td>
                  <td className="no-print">
                    <button type="button" className="quote-row-remove" onClick={() => removeItem(i)} aria-label="Remove line">×</button>
                  </td>
                </tr>
              ))}
              <tr className="no-print">
                <td colSpan={5}>
                  <button type="button" className="quote-add-row" onClick={addItem}>+ Add line item</button>
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="num quote-totals-label">Subtotal</td>
                <td className="num">{fmtMoney(totals.subtotal)}</td>
                <td className="no-print" />
              </tr>
              <tr>
                <td colSpan={3} className="num quote-totals-label">Tax (8%)</td>
                <td className="num">{fmtMoney(totals.tax)}</td>
                <td className="no-print" />
              </tr>
              <tr className="quote-grand-total">
                <td colSpan={3} className="num">Total</td>
                <td className="num">{fmtMoney(totals.total)}</td>
                <td className="no-print" />
              </tr>
            </tbody>
          </table>

          <section className="quote-doc-notes">
            <label className="quote-doc-notes-label">Customer-facing notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="quote-input quote-input-area"
              rows={4}
              placeholder="Terms, validity, what's included…"
            />
          </section>

          <footer className="quote-doc-footer print-only">
            <div>{businessName} · estimate {quote.reference}</div>
            <div>Generated {new Date().toLocaleDateString()}</div>
          </footer>
        </article>
      </div>
    </>
  );
}
