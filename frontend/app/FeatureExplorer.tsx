"use client";

import { useState } from "react";

import PhoneWidget from "./PhoneWidget";

type FeatureKey = "phone" | "chat" | "crm" | "quote" | "kb" | "analytics";

const FEATURES: Array<{
  key: FeatureKey;
  num: string;
  name: string;
  blurb: string;
}> = [
  { key: "phone", num: "01", name: "AI Phone Receptionist", blurb: "Anna picks up every call, qualifies the lead, and books the slot — 24/7." },
  { key: "chat", num: "02", name: "AI Chat Assistant", blurb: "Same brain on your website, SMS, and WhatsApp. Same brand voice." },
  { key: "crm", num: "03", name: "CRM Integration", blurb: "Every interaction lands in HubSpot, Pipedrive, or your tool of choice — fully populated." },
  { key: "quote", num: "04", name: "Smart Quoting", blurb: "Customer texts a photo. Anna drafts a real PDF estimate in under 60 seconds." },
  { key: "kb", num: "05", name: "AI Knowledge Base", blurb: "Pricing rules, install manuals, FAQs — Anna pulls answers straight from your docs." },
  { key: "analytics", num: "06", name: "Data Analytics", blurb: "Dashboard tells you which channels close, which techs win, and what's leaking." },
];

export default function FeatureExplorer() {
  const [active, setActive] = useState<FeatureKey>("phone");

  return (
    <div className="fexp">
      <div className="fexp-list">
        {FEATURES.map((f) => (
          <button
            key={f.key}
            type="button"
            onClick={() => setActive(f.key)}
            className={`fexp-row ${active === f.key ? "active" : ""}`}
          >
            <div className="fexp-row-body">
              <div className="fexp-row-name">{f.name}</div>
              {active === f.key && <div className="fexp-row-blurb">{f.blurb}</div>}
            </div>
            <span className="fexp-row-num">{f.num}</span>
          </button>
        ))}
      </div>

      <div className="fexp-stage">
        {active === "phone" && <PhoneWidget />}
        {active === "chat" && <ChatDemo />}
        {active === "crm" && <CrmDemo />}
        {active === "quote" && <QuoteDemo />}
        {active === "kb" && <KbDemo />}
        {active === "analytics" && <AnalyticsDemo />}
      </div>
    </div>
  );
}

function ChatDemo() {
  return (
    <div className="demo-card">
      <div className="demo-card-head">
        <span className="chat-avatar">A</span>
        <div>
          <div className="chat-name">Anna <span className="chat-online" /></div>
          <div className="chat-role">Hearthline AI · WhatsApp</div>
        </div>
      </div>
      <div className="demo-thread">
        <Bubble role="in">Hi, my AC stopped cooling. Can someone come today?</Bubble>
        <Bubble role="out">Yes — I have a tech 14 mins away. Same-day visit is $129 + parts. Confirm?</Bubble>
        <Bubble role="in">Yes please.</Bubble>
        <Bubble role="out">Booked for 4:20 PM. I've texted the tech's photo + ETA so you know who's at the door.</Bubble>
      </div>
      <div className="demo-foot">
        <span className="action-pill booked"><span className="action-dot" style={{ background: "#2563eb" }} /> Booked · 4:20 PM</span>
        <span className="action-pill quote"><span className="action-dot" style={{ background: "#7c3aed" }} /> Tech ETA sent</span>
      </div>
    </div>
  );
}

function CrmDemo() {
  return (
    <div className="demo-card">
      <div className="demo-card-head">
        <span className="demo-icon">🔄</span>
        <div>
          <div className="chat-name">HubSpot · Auto-sync</div>
          <div className="chat-role">Lead pushed in 2.1s</div>
        </div>
      </div>
      <div className="demo-fields">
        <Field label="Contact" value="Mark Johnson · +1 (555) 777-8888" />
        <Field label="Source" value="Inbound Call · Vapi" />
        <Field label="Trade" value="HVAC" />
        <Field label="Estimated value" value="$12,300" />
        <Field label="Temperature" value="Hot" />
        <Field label="Owner" value="Auto-assigned · Anna" />
      </div>
      <div className="demo-foot">
        <span className="action-pill won"><span className="action-dot" style={{ background: "#16a34a" }} /> Deal Created</span>
        <span className="action-pill status"><span className="action-dot" style={{ background: "#6b7280" }} /> Stage: Quoted</span>
      </div>
    </div>
  );
}

function QuoteDemo() {
  return (
    <div className="demo-card">
      <div className="demo-card-head">
        <span className="demo-icon">📸</span>
        <div>
          <div className="chat-name">Photo → Quote</div>
          <div className="chat-role">Generated in 47s</div>
        </div>
      </div>
      <div className="demo-quote">
        <div className="demo-quote-row"><span>5× Standard PVC window 1.2 × 1.4m</span><span>$2,900</span></div>
        <div className="demo-quote-row"><span>Removal &amp; disposal</span><span>$300</span></div>
        <div className="demo-quote-row"><span>Site survey + measurement</span><span>$150</span></div>
        <div className="demo-quote-row demo-quote-total"><span>Total (incl. tax)</span><span>$3,618</span></div>
      </div>
      <div className="demo-foot">
        <span className="action-pill quote"><span className="action-dot" style={{ background: "#7c3aed" }} /> Quote HL-A1F3C2 · sent</span>
      </div>
    </div>
  );
}

function KbDemo() {
  return (
    <div className="demo-card">
      <div className="demo-card-head">
        <span className="demo-icon">📚</span>
        <div>
          <div className="chat-name">Knowledge Base</div>
          <div className="chat-role">Answer pulled from your manuals</div>
        </div>
      </div>
      <div className="demo-thread">
        <Bubble role="in">My Liftmaster 8500 keeps reversing on close. Is that the safety sensor?</Bubble>
        <Bubble role="out">
          Likely yes — that model uses a photo-eye sensor 6 inches off the ground. If it's misaligned or dusty, the door reverses. Try cleaning both lenses and check the LED is solid green.
        </Bubble>
        <Bubble role="in">Still happening.</Bubble>
        <Bubble role="out">I've booked our garage-door tech for tomorrow 9 AM. You'll get an SMS confirmation.</Bubble>
      </div>
      <div className="demo-foot">
        <span className="action-pill subsidy"><span className="action-dot" style={{ background: "#d2532b" }} /> Cited Liftmaster 8500 manual · §4.3</span>
      </div>
    </div>
  );
}

function AnalyticsDemo() {
  return (
    <div className="demo-card">
      <div className="demo-card-head">
        <span className="demo-icon">📊</span>
        <div>
          <div className="chat-name">This week</div>
          <div className="chat-role">Sept 23 – 29</div>
        </div>
      </div>
      <div className="demo-stats">
        <div className="demo-stat"><strong>92%</strong><span>Calls answered &lt; 2 rings</span></div>
        <div className="demo-stat"><strong>$47.3k</strong><span>Quoted</span></div>
        <div className="demo-stat"><strong>34%</strong><span>Quote → won rate</span></div>
        <div className="demo-stat"><strong>23m</strong><span>Avg response time</span></div>
      </div>
      <div className="demo-foot">
        <span className="action-pill won"><span className="action-dot" style={{ background: "#16a34a" }} /> +12% vs last week</span>
      </div>
    </div>
  );
}

function Bubble({ role, children }: { role: "in" | "out"; children: React.ReactNode }) {
  return (
    <div className={`workflow-msg ${role}`}>
      {role === "in" && (
        <span className="workflow-avatar">
          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
        </span>
      )}
      <div className="workflow-msg-bubble">{children}</div>
      {role === "out" && <span className="workflow-avatar ai">A</span>}
    </div>
  );
}

function Field({ label, value }: { label: string; value: string }) {
  return (
    <div className="demo-field">
      <span className="demo-field-label">{label}</span>
      <span className="demo-field-value">{value}</span>
    </div>
  );
}
