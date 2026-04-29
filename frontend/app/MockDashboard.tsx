"use client";

import { useEffect, useRef, useState } from "react";

type Action =
  | { kind: "deal-won"; amount: number }
  | { kind: "quote-generated"; amount: number }
  | { kind: "appointment-booked" }
  | { kind: "subsidy-checked" }
  | { kind: "qualifying" };

type Row = {
  id: number;
  contact: string;
  contactSub: string;
  assistant: string;
  initial: string;
  message: string;
  action: Action;
  ageSec: number;
};

const ASSISTANTS = ["Anna", "Thomas", "Julie", "Marie", "Leo"];
const NAMES: Array<[string, string]> = [
  ["Mark Johnson", "+1 (555) 777-8888"],
  ["Alice Smith", "alice@example.com"],
  ["David Chen", "+1 (555) 333-9999"],
  ["Sara Patel", "sara.patel@example.com"],
  ["Liam Bauer", "+1 (555) 221-7430"],
  ["Emma Walsh", "emma@walshroofing.io"],
  ["Diego Ruiz", "+1 (555) 991-3340"],
  ["Olivia Park", "olivia@bayhvac.com"],
];
const MESSAGES: Array<{ msg: string; action: Action }> = [
  { msg: "Confirmed — proceed with the HVAC install for Tuesday.", action: { kind: "deal-won", amount: 12300 } },
  { msg: "Need a quote on roof replacement, ~2,000 sq ft.", action: { kind: "quote-generated", amount: 8500 } },
  { msg: "Can someone come this Saturday morning?", action: { kind: "appointment-booked" } },
  { msg: "Do solar panels qualify for the new state rebate?", action: { kind: "subsidy-checked" } },
  { msg: "Looking at the smart-thermostat package — what's included?", action: { kind: "quote-generated", amount: 1200 } },
  { msg: "When will my windows be delivered? Order #5521.", action: { kind: "qualifying" } },
  { msg: "Following up on the quote — happy to move forward.", action: { kind: "deal-won", amount: 9450 } },
  { msg: "Drain still backing up after yesterday's visit.", action: { kind: "appointment-booked" } },
];

function pickRow(id: number): Row {
  const [contact, contactSub] = NAMES[Math.floor(Math.random() * NAMES.length)];
  const assistant = ASSISTANTS[Math.floor(Math.random() * ASSISTANTS.length)];
  const m = MESSAGES[Math.floor(Math.random() * MESSAGES.length)];
  return {
    id,
    contact,
    contactSub,
    assistant,
    initial: assistant[0],
    message: m.msg,
    action: m.action,
    ageSec: 0,
  };
}

const INITIAL_ROWS: Row[] = Array.from({ length: 6 }).map((_, i) => ({
  ...pickRow(i),
  ageSec: i * 60 + 10,
}));

export default function MockDashboard() {
  const [rows, setRows] = useState<Row[]>(INITIAL_ROWS);
  const idRef = useRef<number>(INITIAL_ROWS.length);
  const [leads, setLeads] = useState(0);
  const [quotes, setQuotes] = useState(0);
  const [bookings, setBookings] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const dur = 1400;
    const targets = { leads: 273, quotes: 99.8, bookings: 78 };
    let raf = 0;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / dur);
      const e = 1 - Math.pow(1 - t, 3);
      setLeads(Math.round(targets.leads * e));
      setQuotes(Math.round(targets.quotes * 10 * e) / 10);
      setBookings(Math.round(targets.bookings * e));
      if (t < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setRows((prev) => {
        const aged = prev.map((r) => ({ ...r, ageSec: r.ageSec + 4 }));
        const next = pickRow(idRef.current++);
        return [next, ...aged].slice(0, 6);
      });
    }, 4500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="mock-dashboard">
      <div className="mock-shadow" />
      <div className="mock-frame">
        <aside className="mock-rail">
          <span className="mock-rail-mark">
            <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
            </svg>
          </span>
          <RailIcon active>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="9" /><rect x="14" y="3" width="7" height="5" /><rect x="14" y="12" width="7" height="9" /><rect x="3" y="16" width="7" height="5" /></svg>
          </RailIcon>
          <RailIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3h-4l-2-3H2" /><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" /></svg>
          </RailIcon>
          <RailIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
          </RailIcon>
          <RailIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
          </RailIcon>
          <span style={{ flex: 1 }} />
          <RailIcon>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" /></svg>
          </RailIcon>
        </aside>

        <div className="mock-body">
          <div className="mock-topbar">
            <div className="mock-crumbs">
              <strong>Overview</strong>
              <span className="mock-divider">/</span>
              <span>Rolling Shutters Inc.</span>
            </div>
            <div className="mock-search">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
              <span>Search…</span>
              <kbd className="mock-kbd">⌘K</kbd>
            </div>
            <div className="mock-actions">
              <button className="mock-icon-btn" aria-label="Notifications">
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
              </button>
              <span className="mock-avatar">JD</span>
            </div>
          </div>

          <div className="mock-kpis">
            <KpiCard label="Total Leads" value={leads.toLocaleString()} delta="+12% vs last 30d" />
            <KpiCard label="Quotes Generated" value={`$${quotes.toFixed(1)}k`} delta="+8% acceptance" />
            <KpiCard label="Installations Booked" value={bookings.toString()} delta="+4 this week" />
          </div>

          <div className="mock-section-head">
            <div className="mock-section-title">
              Recent Interactions
              <span className="mock-livefeed">
                <span className="mock-pulse" />
                Live
              </span>
            </div>
            <button className="mock-filter-btn" type="button">
              <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 6h18M6 12h12M10 18h4" /></svg>
              Filter
            </button>
          </div>

          <div className="mock-table">
            <div className="mock-thead">
              <span>Contact</span>
              <span>Assistant</span>
              <span>Activity</span>
              <span>Action</span>
            </div>
            {rows.map((r) => (
              <div className="mock-row" key={r.id}>
                <div className="mock-contact">
                  <span className="mock-msg-icon" aria-hidden>
                    <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>
                  </span>
                  <div>
                    <div className="mock-contact-name">{r.contact}</div>
                    <div className="mock-contact-sub">{r.contactSub}</div>
                  </div>
                </div>
                <div className="mock-assist">
                  <span className="mock-assist-avatar">{r.initial}</span>
                  <span>{r.assistant}</span>
                </div>
                <div className="mock-activity">
                  <div className="mock-activity-text">{r.message}</div>
                  <div className="mock-activity-age">{formatAge(r.ageSec)}</div>
                </div>
                <div className="mock-action">
                  <ActionPill action={r.action} />
                </div>
              </div>
            ))}
          </div>
          <div className="mock-foot">
            Showing 6 of 198 · <a href="/dashboard">Open the real dashboard →</a>
          </div>
        </div>
      </div>
    </div>
  );
}

function RailIcon({ children, active }: { children: React.ReactNode; active?: boolean }) {
  return <span className={`mock-rail-icon ${active ? "active" : ""}`}>{children}</span>;
}

function KpiCard({ label, value, delta }: { label: string; value: string; delta: string }) {
  return (
    <div className="kpi-card">
      <div className="kpi-card-label">{label}</div>
      <div className="kpi-card-value">{value}</div>
      <div className="kpi-card-delta up">
        <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><polyline points="18 15 12 9 6 15" /></svg>
        {delta}
      </div>
    </div>
  );
}

function ActionPill({ action }: { action: Action }) {
  if (action.kind === "deal-won") {
    return <span className="action-pill won"><Dot color="#16a34a" /> Deal Won · ${action.amount.toLocaleString()}</span>;
  }
  if (action.kind === "quote-generated") {
    return <span className="action-pill quote"><Dot color="#7c3aed" /> Quote Sent · ${action.amount.toLocaleString()}</span>;
  }
  if (action.kind === "appointment-booked") {
    return <span className="action-pill booked"><Dot color="#2563eb" /> Booked</span>;
  }
  if (action.kind === "subsidy-checked") {
    return <span className="action-pill subsidy"><Dot color="#d2532b" /> Subsidy Match</span>;
  }
  return <span className="action-pill status"><Dot color="#6b7280" /> Qualifying</span>;
}

function Dot({ color }: { color: string }) {
  return <span className="action-dot" style={{ background: color }} />;
}

function formatAge(sec: number): string {
  if (sec < 30) return "Just now";
  if (sec < 60) return `${sec}s ago`;
  const m = Math.floor(sec / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  return `${h}h ago`;
}
