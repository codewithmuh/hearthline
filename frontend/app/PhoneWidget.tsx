"use client";

import { useEffect, useState } from "react";

const TRANSCRIPT: Array<{ role: "in" | "out"; text: string; afterMs: number }> = [
  { role: "in", text: "Hello, I'd like to schedule a repair for my garage door.", afterMs: 700 },
  { role: "out", text: "I can help with that. Is it a motorised or manual door?", afterMs: 2400 },
  { role: "in", text: "Motorised — Liftmaster, about 5 years old.", afterMs: 4400 },
  { role: "out", text: "Got it. Saturday at 9 AM is open. Shall I book it in?", afterMs: 6300 },
];

export default function PhoneWidget() {
  const [seconds, setSeconds] = useState(8 * 60 + 12); // start at 08:12 like the reference
  const [visible, setVisible] = useState<Array<{ role: "in" | "out"; text: string }>>([]);
  const [typingFor, setTypingFor] = useState<"in" | "out" | null>("in");

  useEffect(() => {
    const interval = setInterval(() => setSeconds((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    TRANSCRIPT.forEach((entry, i) => {
      timers.push(
        setTimeout(() => {
          setVisible((cur) => [...cur, { role: entry.role, text: entry.text }]);
          const next = TRANSCRIPT[i + 1];
          setTypingFor(next ? next.role : null);
        }, entry.afterMs),
      );
    });
    return () => timers.forEach(clearTimeout);
  }, []);

  const mm = Math.floor(seconds / 60).toString().padStart(2, "0");
  const ss = (seconds % 60).toString().padStart(2, "0");

  return (
    <div className="phone-widget">
      {/* Dark Incoming Call card — always visible, decline + accept buttons */}
      <div className="phone-card">
        <div className="phone-avatar">
          <span className="phone-avatar-ring" />
          <span className="phone-avatar-ring delay" />
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="8" r="4" />
            <path d="M4 21c0-4 4-7 8-7s8 3 8 7" />
          </svg>
        </div>
        <div className="phone-title">Incoming Call</div>
        <div className="phone-num">+33 6 12 34 56 78</div>
        <div className="phone-call-actions">
          <div className="phone-action">
            <button className="phone-action-btn decline" aria-label="Decline call">
              <PhoneEnd />
            </button>
            <span>Decline</span>
          </div>
          <div className="phone-action">
            <button className="phone-action-btn accept" aria-label="Accept call">
              <PhoneIcon />
            </button>
            <span>Accept</span>
          </div>
        </div>
      </div>

      {/* Live transcript on the dotted area below */}
      <div className="phone-feed">
        <div className="phone-feed-status">
          <span className="phone-feed-pulse">
            <span className="dot-pulse" />
            AI Answering…
          </span>
          <span className="phone-feed-timer">{mm}:{ss}</span>
        </div>

        <div className="phone-feed-bubbles">
          {visible.map((b, i) => (
            <div key={i} className={`phone-feed-bubble ${b.role}`}>
              {b.role === "in" && (
                <span className="phone-feed-avatar">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
                </span>
              )}
              <span className="phone-feed-text">{b.text}</span>
              {b.role === "out" && <span className="phone-feed-avatar out">AI</span>}
            </div>
          ))}
          {typingFor && (
            <div className={`phone-feed-bubble ${typingFor} typing`}>
              {typingFor === "in" && (
                <span className="phone-feed-avatar">
                  <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
                </span>
              )}
              <span className="phone-feed-text">
                <span className="typing-dots"><i /><i /><i /></span>
              </span>
              {typingFor === "out" && <span className="phone-feed-avatar out">AI</span>}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function PhoneEnd() {
  return (
    <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(135deg)" }}>
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}
