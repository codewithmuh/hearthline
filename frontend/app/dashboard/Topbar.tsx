"use client";

import { useState } from "react";

export function DashGlobalTopbar() {
  return (
    <div className="dash-global-topbar">
      <DashSearch />
      <div className="dash-topbar-right">
        <DashBell />
        <DashUser />
      </div>
    </div>
  );
}

function DashSearch() {
  const [val, setVal] = useState("");
  return (
    <form
      className="dash-search"
      onSubmit={(e) => {
        e.preventDefault();
        if (!val.trim()) return;
        window.location.href = `/dashboard/leads?q=${encodeURIComponent(val)}`;
      }}
    >
      <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></svg>
      <input
        value={val}
        onChange={(e) => setVal(e.target.value)}
        placeholder="Search leads, calls, customers…"
      />
      <kbd>⌘K</kbd>
    </form>
  );
}

function DashBell() {
  const [open, setOpen] = useState(false);
  return (
    <div className="dash-pop">
      <button className="dash-icon-btn" aria-label="Notifications" onClick={() => setOpen((o) => !o)}>
        <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" /><path d="M13.73 21a2 2 0 0 1-3.46 0" /></svg>
        <span className="dash-bell-dot" />
      </button>
      {open && (
        <>
          <span className="dash-pop-overlay" onClick={() => setOpen(false)} />
          <div className="dash-pop-menu">
            <div className="dash-pop-head">Notifications</div>
            <div className="dash-pop-empty">You're all caught up.</div>
          </div>
        </>
      )}
    </div>
  );
}

function DashUser() {
  const [open, setOpen] = useState(false);
  return (
    <div className="dash-pop">
      <button className="dash-user-btn" onClick={() => setOpen((o) => !o)}>
        <span className="dash-user-avatar">JD</span>
        <span className="dash-user-meta">
          <span className="dash-user-name">Jordan Davis</span>
          <span className="dash-user-role">Owner · Rolling Shutters</span>
        </span>
        <svg viewBox="0 0 24 24" width="12" height="12" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="6 9 12 15 18 9" /></svg>
      </button>
      {open && (
        <>
          <span className="dash-pop-overlay" onClick={() => setOpen(false)} />
          <div className="dash-pop-menu dash-pop-menu-right">
            <a href="/dashboard/settings" className="dash-pop-item">Settings</a>
            <a href="/dashboard/customers" className="dash-pop-item">Customers</a>
            <a href="http://localhost:8000/admin/" target="_blank" rel="noreferrer" className="dash-pop-item">Django admin ↗</a>
            <hr />
            <a href="/" className="dash-pop-item">← Back to landing</a>
          </div>
        </>
      )}
    </div>
  );
}
