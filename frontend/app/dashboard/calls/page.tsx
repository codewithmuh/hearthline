import Link from "next/link";

import { fetchJson, fmtAge, type Call, type Page } from "../lib";

export default async function CallsPage({ searchParams }: { searchParams: Promise<{ provider?: string; q?: string }> }) {
  const params = await searchParams;
  const data = await fetchJson<Page<Call>>("/calls/");
  let calls = data?.results ?? [];

  if (params.provider) {
    calls = calls.filter((c) => c.provider === params.provider);
  }
  if (params.q) {
    const q = params.q.toLowerCase();
    calls = calls.filter(
      (c) =>
        (c.from_number ?? "").toLowerCase().includes(q) ||
        (c.transcript ?? "").toLowerCase().includes(q) ||
        (c.summary ?? "").toLowerCase().includes(q),
    );
  }

  const totalDuration = calls.reduce((s, c) => s + (c.duration_seconds ?? 0), 0);
  const completed = calls.filter((c) => c.status === "completed").length;

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Calls</h1>
          <p>Every voice + SMS interaction logged from Vapi and Twilio.</p>
        </div>
        <div className="app-pagebar-actions">
          <a href="http://localhost:8000/admin/calls/call/" target="_blank" rel="noreferrer" className="btn btn-ghost">Open in admin ↗</a>
          <a href="http://localhost:8000/api/calls/" target="_blank" rel="noreferrer" className="btn btn-primary">View raw API</a>
        </div>
      </div>

      <div className="app-content">
        <div className="detail-grid">
          <div className="detail-card">
            <div className="detail-card-label">Total Calls</div>
            <div className="detail-card-value">{calls.length}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Completed</div>
            <div className="detail-card-value">{completed}</div>
          </div>
          <div className="detail-card">
            <div className="detail-card-label">Total Duration</div>
            <div className="detail-card-value">{Math.round(totalDuration / 60)}m</div>
          </div>
        </div>

        <form className="app-toolbar" method="get">
          <input
            type="search"
            name="q"
            defaultValue={params.q ?? ""}
            placeholder="Search transcripts, numbers, summaries…"
            className="search-input"
          />
          <div className="tag-row" style={{ marginBottom: 0 }}>
            {["all", "vapi", "twilio"].map((p) => {
              const active = (params.provider ?? "all") === p;
              const href = p === "all" ? "/dashboard/calls" : `/dashboard/calls?provider=${p}`;
              return (
                <Link key={p} href={href} className={`tag-chip ${active ? "active" : ""}`} style={{ textDecoration: "none" }}>
                  {p}
                </Link>
              );
            })}
          </div>
          <button type="submit" className="btn btn-ghost" style={{ marginLeft: "auto" }}>Apply</button>
        </form>

        <section className="dash-card" style={{ padding: 0 }}>
          <div className="mock-thead" style={{ borderRadius: 0, borderTop: "none" }}>
            <span>Caller</span>
            <span>Provider</span>
            <span>Summary</span>
            <span style={{ textAlign: "right" }}>Status</span>
          </div>
          {calls.length === 0 ? (
            <div className="empty-card" style={{ borderRadius: 0, border: "none" }}>
              <h3>No calls match these filters</h3>
              <p>Wire a Vapi or Twilio webhook to <code>/api/calls/webhooks/vapi/</code>.</p>
            </div>
          ) : (
            calls.map((c) => (
              <div key={c.id} className="mock-row" style={{ borderRadius: 0 }}>
                <div className="mock-contact">
                  <span className="mock-msg-icon" aria-hidden>📞</span>
                  <div>
                    <div className="mock-contact-name">{c.from_number || "unknown"}</div>
                    <div className="mock-contact-sub">→ {c.to_number || "—"}</div>
                  </div>
                </div>
                <div className="mock-assist"><span className="tag">{c.provider}</span></div>
                <div>
                  <div className="mock-activity-text">{c.summary || (c.transcript ? c.transcript.slice(0, 160) + "…" : "(no transcript)")}</div>
                  <div className="mock-activity-age">{fmtAge(c.started_at)} · {c.duration_seconds ? `${c.duration_seconds}s` : "—"}</div>
                </div>
                <div className="mock-action">
                  <span className={`action-pill ${c.status === "completed" ? "won" : "status"}`}>
                    <span className="action-dot" style={{ background: c.status === "completed" ? "#16a34a" : "#6b7280" }} />
                    {c.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </section>
      </div>
    </>
  );
}
