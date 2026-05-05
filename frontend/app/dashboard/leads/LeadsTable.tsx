"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { fmtAge, fmtMoney, type Lead } from "../format";
import { LeadActionPill } from "../parts";

export default function LeadsTable({ leads, currency = "USD" }: { leads: Lead[]; currency?: string }) {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());
  const [busy, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const allIds = useMemo(() => leads.map((l) => l.id), [leads]);
  const allSelected = leads.length > 0 && selected.size === leads.length;
  const someSelected = selected.size > 0 && !allSelected;

  function toggleOne(id: number, on: boolean) {
    setSelected((prev) => {
      const next = new Set(prev);
      if (on) next.add(id);
      else next.delete(id);
      return next;
    });
  }

  function toggleAll(on: boolean) {
    setSelected(on ? new Set(allIds) : new Set());
  }

  async function deleteOne(id: number) {
    if (!confirm("Delete this lead? This can't be undone.")) return;
    setError(null);
    const res = await fetch(`/api/proxy/leads/${id}`, { method: "DELETE" });
    if (!res.ok && res.status !== 204) {
      setError("Failed to delete lead");
      return;
    }
    setSelected((prev) => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    startTransition(() => router.refresh());
  }

  async function deleteSelected() {
    if (selected.size === 0) return;
    if (!confirm(`Delete ${selected.size} lead${selected.size === 1 ? "" : "s"}? This can't be undone.`)) return;
    setError(null);
    const res = await fetch("/api/proxy/leads/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ids: Array.from(selected) }),
    });
    if (!res.ok) {
      setError("Failed to delete leads");
      return;
    }
    setSelected(new Set());
    startTransition(() => router.refresh());
  }

  async function deleteAll() {
    if (!confirm("Delete ALL leads? This wipes every lead in the table and can't be undone.")) return;
    setError(null);
    const res = await fetch("/api/proxy/leads/bulk-delete", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ all: true }),
    });
    if (!res.ok) {
      setError("Failed to delete leads");
      return;
    }
    setSelected(new Set());
    startTransition(() => router.refresh());
  }

  return (
    <>
      <div className="leads-bulkbar">
        <div className="leads-bulkbar-left">
          <label className="leads-checkbox">
            <input
              type="checkbox"
              checked={allSelected}
              ref={(el) => {
                if (el) el.indeterminate = someSelected;
              }}
              onChange={(e) => toggleAll(e.target.checked)}
              disabled={leads.length === 0}
            />
            <span>{selected.size > 0 ? `${selected.size} selected` : `Select all (${leads.length})`}</span>
          </label>
        </div>
        <div className="leads-bulkbar-right">
          {selected.size > 0 && (
            <button type="button" className="btn btn-danger" onClick={deleteSelected} disabled={busy}>
              Delete selected
            </button>
          )}
          <button type="button" className="btn btn-ghost btn-danger-ghost" onClick={deleteAll} disabled={busy || leads.length === 0}>
            Delete all
          </button>
        </div>
      </div>

      {error && <div className="leads-error">{error}</div>}

      <section className="app-table">
        <div className="app-table-head cols-leads-select">
          <span />
          <span>Customer</span>
          <span>Project</span>
          <span className="col-right">Value</span>
          <span className="col-right">Status</span>
          <span />
        </div>
        {leads.length === 0 ? (
          <div className="app-table-empty">
            <h3>No leads match these filters</h3>
            <p>Clear filters or seed demo data with <code>seed_demo</code>.</p>
          </div>
        ) : (
          leads.map((lead) => {
            const checked = selected.has(lead.id);
            return (
              <div key={lead.id} className={`app-table-row cols-leads-select ${checked ? "is-selected" : ""}`}>
                <label className="leads-checkbox leads-row-check" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={(e) => toggleOne(lead.id, e.target.checked)}
                  />
                </label>
                <Link href={`/dashboard/leads/${lead.id}`} className="app-row-customer leads-row-link">
                  <span className="app-row-avatar">{(lead.customer?.name || "?").slice(0, 1).toUpperCase()}</span>
                  <div className="app-row-customer-text">
                    <div className="app-row-title">{lead.customer?.name || "Unknown"}</div>
                    <div className="app-row-sub">{lead.customer?.phone || lead.customer?.email || "—"}</div>
                  </div>
                </Link>
                <Link href={`/dashboard/leads/${lead.id}`} className="app-row-project leads-row-link">
                  <div className="app-row-title app-row-title-soft">{lead.project_summary || "(no summary)"}</div>
                  <div className="app-row-sub">{fmtAge(lead.created_at)} · {lead.temperature}</div>
                </Link>
                <Link href={`/dashboard/leads/${lead.id}`} className="app-row-value leads-row-link">{fmtMoney(lead.estimated_value, currency)}</Link>
                <Link href={`/dashboard/leads/${lead.id}`} className="app-row-action leads-row-link">
                  <LeadActionPill lead={lead} currency={currency} />
                </Link>
                <button
                  type="button"
                  className="leads-row-delete"
                  aria-label="Delete lead"
                  title="Delete lead"
                  onClick={() => deleteOne(lead.id)}
                  disabled={busy}
                >
                  ✕
                </button>
              </div>
            );
          })
        )}
      </section>
    </>
  );
}
