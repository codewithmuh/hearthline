import Link from "next/link";

import { fetchJson, fmtAge, fmtMoney, type Lead, type Page } from "../lib";

type CustomerRow = {
  id: number;
  name: string;
  phone: string;
  email: string;
  address?: string;
  leadCount: number;
  totalValue: number;
  lastSeen: string;
};

export default async function CustomersPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const params = await searchParams;
  const data = await fetchJson<Page<Lead>>("/leads/");
  const leads = data?.results ?? [];

  const map = new Map<number, CustomerRow>();
  for (const l of leads) {
    if (!l.customer) continue;
    const existing = map.get(l.customer.id);
    const value = l.estimated_value ? Number(l.estimated_value) : 0;
    if (existing) {
      existing.leadCount += 1;
      existing.totalValue += value;
      if (l.created_at > existing.lastSeen) existing.lastSeen = l.created_at;
    } else {
      map.set(l.customer.id, {
        id: l.customer.id,
        name: l.customer.name,
        phone: l.customer.phone,
        email: l.customer.email,
        address: l.customer.address,
        leadCount: 1,
        totalValue: value,
        lastSeen: l.created_at,
      });
    }
  }
  let customers = [...map.values()].sort((a, b) => b.totalValue - a.totalValue);

  if (params.q) {
    const q = params.q.toLowerCase();
    customers = customers.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.phone.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q),
    );
  }

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Customers</h1>
          <p>Everyone who has ever touched a Hearthline channel.</p>
        </div>
        <div className="app-pagebar-actions">
          <a href="http://localhost:8000/admin/leads/customer/" target="_blank" rel="noreferrer" className="btn btn-ghost">Open in admin ↗</a>
          <a href="http://localhost:8000/admin/leads/customer/add/" target="_blank" rel="noreferrer" className="btn btn-primary">+ New customer</a>
        </div>
      </div>

      <div className="app-content">
        <form className="app-toolbar" method="get">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search by name, phone, email…"
            className="search-input"
          />
          <button type="submit" className="btn btn-ghost">Search</button>
        </form>

        <section className="dash-card" style={{ padding: 0 }}>
          <table className="lineitems">
            <thead>
              <tr>
                <th>Name</th>
                <th>Contact</th>
                <th>Address</th>
                <th className="num">Leads</th>
                <th className="num">Lifetime</th>
                <th>Last seen</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: 32, textAlign: "center", color: "var(--muted)" }}>
                    No customers match.
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td><strong>{c.name || "Unknown"}</strong></td>
                    <td>{c.phone}<br /><span style={{ color: "var(--muted)", fontSize: 12 }}>{c.email}</span></td>
                    <td style={{ color: "var(--muted)", fontSize: 13 }}>{c.address || "—"}</td>
                    <td className="num">{c.leadCount}</td>
                    <td className="num"><strong>{fmtMoney(c.totalValue)}</strong></td>
                    <td style={{ color: "var(--muted)" }}>{fmtAge(c.lastSeen)}</td>
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
