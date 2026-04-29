"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "ai" | "user" | "system"; text: string; ts: number };

const SCRIPT: Array<{ user: string; ai: string[] }> = [
  {
    user: "Need a quote for 5 windows",
    ai: [
      "Got it — 5 windows. Are these standard PVC and around 1.2m × 1.4m?",
      "If yes, indicative price starts around $3,500 fitted.",
    ],
  },
  {
    user: "Can someone come Saturday morning?",
    ai: [
      "I have Saturday at 9 AM open with our window team.",
      "Want me to lock that in and text you the confirmation?",
    ],
  },
  {
    user: "Do solar panels qualify for the new state rebate?",
    ai: [
      "Yes — properties under $400k AV qualify for the 30% rebate this year.",
      "I can check your address and bundle the savings into your quote.",
    ],
  },
];

const INTRO: Msg = {
  role: "ai",
  text: "Hi! I'm Anna from Hearthline. Need a quote, want to book a job, or have a question on a recent visit?",
  ts: Date.now(),
};

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [teaser, setTeaser] = useState(true);
  const [messages, setMessages] = useState<Msg[]>([INTRO]);
  const [draft, setDraft] = useState("");
  const [thinking, setThinking] = useState(false);
  const scriptIdx = useRef(0);
  const scrollRef = useRef<HTMLDivElement | null>(null);

  // Hide teaser after 8s
  useEffect(() => {
    const t = setTimeout(() => setTeaser(false), 8000);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, thinking]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { role: "user", text, ts: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setDraft("");
    setThinking(true);

    // simulate AI reply with scripted answers, fall back to a generic one
    const idx = scriptIdx.current % SCRIPT.length;
    const replies = SCRIPT[idx].ai;
    scriptIdx.current += 1;

    let delay = 900;
    replies.forEach((reply, i) => {
      setTimeout(() => {
        setMessages((m) => [...m, { role: "ai", text: reply, ts: Date.now() }]);
        if (i === replies.length - 1) setThinking(false);
      }, delay);
      delay += 1100;
    });
  }

  function trigger(presetText: string) {
    if (!open) setOpen(true);
    send(presetText);
  }

  return (
    <>
      {/* TEASER bubble (bottom-right) */}
      {!open && teaser && (
        <button className="chat-teaser" onClick={() => { setOpen(true); setTeaser(false); }}>
          <span className="chat-teaser-avatar">A</span>
          <div>
            <div className="chat-teaser-title">Anna · Hearthline AI</div>
            <div className="chat-teaser-body">Hi! Need a quote or want to book? Ask me anything.</div>
          </div>
          <span className="chat-teaser-close" onClick={(e) => { e.stopPropagation(); setTeaser(false); }}>×</span>
        </button>
      )}

      {/* FAB launcher */}
      {!open && (
        <button className="chat-fab" onClick={() => { setOpen(true); setTeaser(false); }} aria-label="Open chat">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" width="22" height="22">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <span className="chat-fab-pulse" />
        </button>
      )}

      {/* PANEL */}
      {open && (
        <div className="chat-panel">
          <div className="chat-head">
            <div className="chat-head-left">
              <span className="chat-avatar">A</span>
              <div>
                <div className="chat-name">Anna <span className="chat-online" /></div>
                <div className="chat-role">Hearthline AI · replies in seconds</div>
              </div>
            </div>
            <button className="chat-close" onClick={() => setOpen(false)} aria-label="Close chat">×</button>
          </div>

          <div className="chat-messages" ref={scrollRef}>
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.role === "ai" && <span className="chat-msg-avatar">A</span>}
                <div className="chat-msg-bubble">{m.text}</div>
              </div>
            ))}
            {thinking && (
              <div className="chat-msg ai">
                <span className="chat-msg-avatar">A</span>
                <div className="chat-msg-bubble typing">
                  <span className="typing-dots"><i /><i /><i /></span>
                </div>
              </div>
            )}
          </div>

          {/* Quick replies */}
          <div className="chat-quick">
            <button onClick={() => trigger("Need a quote for 5 windows")}>Get a quote</button>
            <button onClick={() => trigger("Can someone come Saturday morning?")}>Book a visit</button>
            <button onClick={() => trigger("Do solar panels qualify for the new state rebate?")}>Subsidy check</button>
          </div>

          <form
            className="chat-input"
            onSubmit={(e) => { e.preventDefault(); send(draft); }}
          >
            <input
              type="text"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Type a message…"
              autoFocus
            />
            <button type="submit" aria-label="Send">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13" /><polygon points="22 2 15 22 11 13 2 9 22 2" /></svg>
            </button>
          </form>
        </div>
      )}
    </>
  );
}
