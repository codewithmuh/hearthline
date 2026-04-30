"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type Item = { description: string; quantity: string; unit_price: string };

function fmtMoney(n: number): string {
  if (Number.isNaN(n)) return "—";
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

const STATUSES = ["draft", "sent", "viewed", "accepted", "declined"];

export default function NewQuoteForm({ leads }: { leads: Array<{ id: number; label: string }> }) {
  const router = useRouter();
  const [leadId, setLeadId] = useState<string>(leads[0]?.id?.toString() ?? "");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState("Prices indicative pending in-person measurement. Includes labour and materials.");
  const [items, setItems] = useState<Item[]>([
    { description: "", quantity: "1", unit_price: "0" },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const totals = useMemo(() => {
    const subtotal = items.reduce(
      (s, it) => s + parseFloat(it.quantity || "0") * parseFloat(it.unit_price || "0"),
      0,
    );
    const tax = subtotal * 0.08;
    return { subtotal, tax, total: subtotal + tax };
  }, [items]);

  function updateItem(idx: number, key: keyof Item, value: string) {
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
      if (!leadId) throw new Error("Pick a lead before saving.");
      if (items.length === 0) throw new Error("Add at least one line item.");
      const payload = {
        lead: parseInt(leadId, 10),
        status,
        notes,
        drafted_by_ai: false,
        line_items: items.map((it) => ({
          description: it.description.slice(0, 255),
          quantity: parseFloat(it.quantity || "0"),
          unit_price: parseFloat(it.unit_price || "0"),
        })),
      };
      const res = await fetch(`${API_URL}/quotes/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }
      const created = await res.json();
      router.push(`/dashboard/quotes/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>New quote</h1>
          <p>
            <Link href="/dashboard/quotes" style={{ color: "var(--muted)" }}>← All quotes</Link>
            {" · Draft a new estimate"}
          </p>
        </div>
        <div className="app-pagebar-actions">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-inline">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Link href="/dashboard/quotes" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Creating…" : "Create quote"}
          </button>
        </div>
      </div>

      <div className="app-content">
        {error && <div className="banner-error">{error}</div>}

        <article className="quote-doc">
          <header className="quote-doc-head">
            <div>
              <div className="quote-doc-brand">New estimate</div>
              <div className="quote-doc-tag">Draft</div>
            </div>
            <div className="quote-doc-meta">
              <div>
                <span>For lead</span>
                <select
                  value={leadId}
                  onChange={(e) => setLeadId(e.target.value)}
                  className="quote-input quote-lead-select"
                >
                  {leads.length === 0 && <option value="">(no leads)</option>}
                  {leads.map((l) => (
                    <option key={l.id} value={l.id}>{l.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </header>

          <table className="quote-doc-table">
            <thead>
              <tr>
                <th>Description</th>
                <th className="num">Qty</th>
                <th className="num">Unit price</th>
                <th className="num">Total</th>
                <th />
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
                      placeholder="e.g. Standard PVC window 1.2m × 1.4m"
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
                  <td>
                    <button type="button" className="quote-row-remove" onClick={() => removeItem(i)} aria-label="Remove line">×</button>
                  </td>
                </tr>
              ))}
              <tr>
                <td colSpan={5}>
                  <button type="button" className="quote-add-row" onClick={addItem}>+ Add line item</button>
                </td>
              </tr>
              <tr>
                <td colSpan={3} className="num quote-totals-label">Subtotal</td>
                <td className="num">{fmtMoney(totals.subtotal)}</td>
                <td />
              </tr>
              <tr>
                <td colSpan={3} className="num quote-totals-label">Tax (8%)</td>
                <td className="num">{fmtMoney(totals.tax)}</td>
                <td />
              </tr>
              <tr className="quote-grand-total">
                <td colSpan={3} className="num">Total</td>
                <td className="num">{fmtMoney(totals.total)}</td>
                <td />
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
        </article>
      </div>
    </>
  );
}
