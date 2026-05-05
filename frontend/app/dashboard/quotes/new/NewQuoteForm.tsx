"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import { fmtMoney as fmtMoneyShared, type Business, type Lead } from "../../lib";

type Item = { description: string; quantity: string; unit_price: string };

function fmtDate(iso: string): string {
  return new Date(iso).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });
}

function addDays(iso: string, days: number): string {
  const d = new Date(iso);
  d.setDate(d.getDate() + days);
  return d.toISOString();
}

const STATUSES = ["draft", "sent", "viewed", "accepted", "declined"];
const TAX_RATE = 0.08;

export default function NewQuoteForm({
  leads, business,
}: {
  leads: Lead[];
  business: Business | null;
}) {
  const router = useRouter();
  const currency = business?.currency ?? "USD";
  const fmtMoney = (n: number) => fmtMoneyShared(Number.isNaN(n) ? 0 : n, currency);
  const [leadId, setLeadId] = useState<string>(leads[0]?.id?.toString() ?? "");
  const [status, setStatus] = useState("draft");
  const [notes, setNotes] = useState(
    "Prices indicative pending in-person measurement. Includes labour and materials.",
  );
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
    const tax = subtotal * TAX_RATE;
    return { subtotal, tax, total: subtotal + tax };
  }, [items]);

  const selectedLead = leads.find((l) => String(l.id) === leadId) ?? null;
  const customer = selectedLead?.customer;

  const issueDate = new Date().toISOString();
  const dueDate = addDays(issueDate, 14);

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
      const filled = items.filter((it) => it.description.trim());
      if (filled.length === 0) throw new Error("At least one line item needs a description.");
      const payload = {
        lead: parseInt(leadId, 10),
        status,
        notes,
        drafted_by_ai: false,
        line_items: filled.map((it) => ({
          description: it.description.slice(0, 255),
          quantity: parseFloat(it.quantity || "0"),
          unit_price: parseFloat(it.unit_price || "0"),
        })),
      };
      const res = await fetch(`/api/proxy/quotes/`, {
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

  const businessName = business?.name ?? "Hearthline";
  const businessPhone = business?.phone_number ?? "";
  const businessEmail = business?.channels?.find((c) => c.kind === "email")?.address ?? "";

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>New estimate</h1>
          <p>
            <Link href="/dashboard/quotes" style={{ color: "var(--muted)" }}>← All quotes</Link>
            {" · Draft a new estimate from scratch."}
          </p>
        </div>
        <div className="app-pagebar-actions">
          <select value={status} onChange={(e) => setStatus(e.target.value)} className="select-inline">
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <Link href="/dashboard/quotes" className="btn btn-ghost">Cancel</Link>
          <button type="button" className="btn btn-primary" onClick={save} disabled={saving}>
            {saving ? "Creating…" : "Create estimate"}
          </button>
        </div>
      </div>

      <div className="app-content">
        {error && <div className="banner-error">{error}</div>}
        {leads.length === 0 && (
          <div className="banner-error" style={{ background: "#fffbeb", borderColor: "#fde68a", color: "#b45309" }}>
            No leads available. Create a lead first so the estimate has a recipient.
          </div>
        )}

        <article className="invoice">
          <header className="invoice-head">
            <div className="invoice-brand">
              <span className="invoice-logo" aria-hidden>
                <FlameLogo />
              </span>
              <div>
                <div className="invoice-brand-name">{businessName}</div>
                <div className="invoice-brand-tag">Powered by Hearthline · 24/7 AI front desk</div>
              </div>
            </div>
            <div className="invoice-stamp">
              <div className="invoice-stamp-label">Estimate</div>
              <div className="invoice-stamp-ref">— · pending</div>
              <span className={`pill pill-${status}`} style={{ marginTop: 8 }}>{status}</span>
            </div>
          </header>

          <section className="invoice-meta">
            <div className="invoice-meta-block">
              <div className="invoice-meta-label">From</div>
              <div className="invoice-meta-name">{businessName}</div>
              {businessPhone && <div className="invoice-meta-line">{businessPhone}</div>}
              {businessEmail && <div className="invoice-meta-line">{businessEmail}</div>}
              <div className="invoice-meta-line">{business?.timezone ?? "America/Los_Angeles"}</div>
            </div>

            <div className="invoice-meta-block">
              <div className="invoice-meta-label">Bill to</div>
              <select
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
                className="text-input"
                style={{ marginBottom: 8 }}
                disabled={leads.length === 0}
              >
                {leads.length === 0 && <option value="">No leads available</option>}
                {leads.map((l) => (
                  <option key={l.id} value={l.id}>
                    #{l.id} · {l.customer?.name || "Unknown"}
                  </option>
                ))}
              </select>
              {customer ? (
                <>
                  <div className="invoice-meta-name">{customer.name || "—"}</div>
                  {customer.phone && <div className="invoice-meta-line">{customer.phone}</div>}
                  {customer.email && <div className="invoice-meta-line">{customer.email}</div>}
                  {customer.address && <div className="invoice-meta-line">{customer.address}</div>}
                </>
              ) : (
                <div className="invoice-meta-line" style={{ color: "var(--muted)" }}>(no customer info)</div>
              )}
            </div>

            <div className="invoice-meta-block">
              <div className="invoice-meta-label">Details</div>
              <dl className="invoice-meta-dl">
                <dt>Issued</dt><dd>{fmtDate(issueDate)}</dd>
                <dt>Valid until</dt><dd>{fmtDate(dueDate)}</dd>
                <dt>Project</dt><dd>{leadId ? `Lead #${leadId}` : "—"}</dd>
              </dl>
            </div>
          </section>

          <section className="invoice-items">
            <table className="invoice-table">
              <thead>
                <tr>
                  <th style={{ width: "55%" }}>Description</th>
                  <th className="num">Qty</th>
                  <th className="num">Unit price</th>
                  <th className="num">Amount</th>
                  <th style={{ width: 32 }} />
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
                    <td className="num invoice-line-total">
                      {fmtMoney(parseFloat(it.quantity || "0") * parseFloat(it.unit_price || "0"))}
                    </td>
                    <td>
                      <button type="button" className="quote-row-remove" onClick={() => removeItem(i)} aria-label="Remove line">×</button>
                    </td>
                  </tr>
                ))}
                <tr>
                  <td colSpan={5} style={{ padding: "10px 0 0" }}>
                    <button type="button" className="quote-add-row" onClick={addItem}>+ Add line item</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </section>

          <section className="invoice-foot">
            <div className="invoice-notes-col">
              <div className="invoice-meta-label">Notes</div>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="quote-input quote-input-area invoice-notes-input"
                rows={4}
                placeholder="Terms, validity, what's included…"
              />
              <div className="invoice-terms">
                <strong>Terms.</strong> This estimate is valid for 14 days from the issue date.
                Final pricing may vary after on-site inspection. Subject to materials availability.
              </div>
            </div>

            <div className="invoice-totals">
              <div className="invoice-totals-row">
                <span>Subtotal</span>
                <span>{fmtMoney(totals.subtotal)}</span>
              </div>
              <div className="invoice-totals-row">
                <span>Tax (8%)</span>
                <span>{fmtMoney(totals.tax)}</span>
              </div>
              <div className="invoice-totals-row invoice-totals-grand">
                <span>Total due</span>
                <span>{fmtMoney(totals.total)}</span>
              </div>
              <div className="invoice-totals-currency">{currency} · 14-day validity</div>
            </div>
          </section>

          <footer className="invoice-footer">
            <div>
              <strong>{businessName}</strong>
              {businessPhone ? ` · ${businessPhone}` : ""}
              {" · Estimate "}{customer?.name ? `for ${customer.name}` : "(pending)"}
            </div>
            <div className="invoice-footer-mark">
              <span className="invoice-footer-flame"><FlameLogo small /></span>
              Generated by Hearthline · {fmtDate(issueDate)}
            </div>
          </footer>
        </article>
      </div>
    </>
  );
}

function FlameLogo({ small = false }: { small?: boolean }) {
  const size = small ? 14 : 22;
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
    </svg>
  );
}
