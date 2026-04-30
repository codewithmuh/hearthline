"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000/api";

type Msg = { role: "user" | "assistant"; content: string };

const STARTERS = [
  "Hi, my AC stopped working and I need someone to come look at it today.",
  "I'd like a quote to replace 5 windows in my living room.",
  "When can someone come measure my roof for solar panels?",
  "I had a tech here yesterday but my drain is still backing up.",
];

export default function TestCall() {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [draft, setDraft] = useState("");
  const [phone, setPhone] = useState("+1 (555) 555-0199");
  const [thinking, setThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  async function send(text: string) {
    if (!text.trim() || thinking) return;
    const userMsg: Msg = { role: "user", content: text };
    const next = [...messages, userMsg];
    setMessages(next);
    setDraft("");
    setThinking(true);
    setError(null);
    try {
      const res = await fetch(`${API_URL}/calls/vapi/chat/completions/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next,
          call: { customer: { number: phone.replace(/[^\d+]/g, "") } },
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      const reply: string = data?.choices?.[0]?.message?.content ?? "(no response)";
      setMessages((m) => [...m, { role: "assistant", content: reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setThinking(false);
    }
  }

  function reset() {
    setMessages([]);
    setError(null);
  }

  return (
    <>
      <div className="app-pagebar">
        <div>
          <h1>Test Anna</h1>
          <p>
            <Link href="/dashboard" style={{ color: "var(--muted)" }}>← Dashboard</Link>
            {" · "}Talk to Anna the way Vapi will. Each message hits <code>/api/calls/vapi/chat/completions/</code>.
          </p>
        </div>
        <div className="app-pagebar-actions">
          <Link href="/dashboard/settings" className="btn btn-ghost">Vapi setup ↗</Link>
          <button type="button" className="btn btn-ghost" onClick={reset}>↻ Reset</button>
        </div>
      </div>

      <div className="app-content">
        {error && <div className="banner-error">Backend error: {error}</div>}

        <div className="testcall-grid">
          <article className="dash-card testcall-panel">
            <div className="dash-card-head">
              <h2 style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="testcall-avatar">A</span>
                Anna · live
                <span className="mock-livefeed">
                  <span className="mock-pulse" /> on call
                </span>
              </h2>
              <span className="dash-card-meta">{messages.length} turn{messages.length === 1 ? "" : "s"}</span>
            </div>

            <div className="testcall-thread" ref={scrollRef}>
              {messages.length === 0 && (
                <div className="testcall-empty">
                  <p>Pretend you're a customer calling. Tap a starter or type your own message.</p>
                </div>
              )}
              {messages.map((m, i) => (
                <div key={i} className={`testcall-msg ${m.role}`}>
                  <span className="testcall-msg-avatar">{m.role === "user" ? "U" : "A"}</span>
                  <div className="testcall-msg-bubble">{m.content}</div>
                </div>
              ))}
              {thinking && (
                <div className="testcall-msg assistant">
                  <span className="testcall-msg-avatar">A</span>
                  <div className="testcall-msg-bubble typing">
                    <span className="typing-dots"><i /><i /><i /></span>
                  </div>
                </div>
              )}
            </div>

            {messages.length === 0 && (
              <div className="testcall-starters">
                {STARTERS.map((s) => (
                  <button key={s} type="button" onClick={() => send(s)}>{s}</button>
                ))}
              </div>
            )}

            <form
              className="testcall-input"
              onSubmit={(e) => { e.preventDefault(); send(draft); }}
            >
              <input
                type="text"
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Type a customer message…"
                disabled={thinking}
                autoFocus
              />
              <button type="submit" className="btn btn-primary" disabled={thinking || !draft.trim()}>
                Send →
              </button>
            </form>
          </article>

          <aside className="testcall-side">
            <article className="dash-card">
              <div className="dash-card-head">
                <h2>Caller settings</h2>
              </div>
              <label className="testcall-field">
                <span>Caller phone (sent to Anna as customer.number)</span>
                <input
                  className="search-input"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <p style={{ color: "var(--muted)", fontSize: 12.5, marginTop: 12, lineHeight: 1.55 }}>
                Anna uses this to default-fill the contact phone when she calls{" "}
                <code>qualify_lead</code> or <code>book_appointment</code>. Change it to test how
                she handles different callers.
              </p>
            </article>

            <article className="dash-card">
              <div className="dash-card-head">
                <h2>What's wired</h2>
              </div>
              <ul className="dash-list">
                <li>
                  <span className="dash-list-id">qualify_lead</span>
                  <div className="dash-list-body">
                    <div className="dash-list-meta">Creates a Lead + Customer in your dashboard.</div>
                  </div>
                </li>
                <li>
                  <span className="dash-list-id">check_availability</span>
                  <div className="dash-list-body">
                    <div className="dash-list-meta">Returns open slots from the scheduling stub (replace with real calendar).</div>
                  </div>
                </li>
                <li>
                  <span className="dash-list-id">book_appointment</span>
                  <div className="dash-list-body">
                    <div className="dash-list-meta">Upgrades or creates a Lead with status = booked.</div>
                  </div>
                </li>
                <li>
                  <span className="dash-list-id">send_sms</span>
                  <div className="dash-list-body">
                    <div className="dash-list-meta">Twilio if keys are set, else logged to console.</div>
                  </div>
                </li>
                <li>
                  <span className="dash-list-id">end_call</span>
                  <div className="dash-list-body">
                    <div className="dash-list-meta">Signals Vapi to hang up after Anna's farewell.</div>
                  </div>
                </li>
              </ul>
              <p style={{ marginTop: 14, fontSize: 12.5, color: "var(--muted)" }}>
                After Anna calls a tool, refresh <Link href="/dashboard/leads">/dashboard/leads</Link> to see the new record.
              </p>
            </article>
          </aside>
        </div>
      </div>
    </>
  );
}
