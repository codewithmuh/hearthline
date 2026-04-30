import Link from "next/link";

import ChatWidget from "./ChatWidget";
import HeroBackdrop from "./HeroBackdrop";
import HeroPipeline from "./HeroPipeline";
import LiveTicker from "./LiveTicker";
import MockDashboard from "./MockDashboard";
import PhoneWidget from "./PhoneWidget";

const DEMO_URL = "https://calendly.com/contact-codewithmuh/30min";

const FEATURES = [
  {
    name: "AI Phone Receptionist",
    body: "Never miss a call again. Anna answers 24/7, qualifies leads in real time, and books appointments straight into your calendar.",
  },
  { name: "AI Chat Assistant" },
  { name: "CRM Integration" },
  { name: "Smart Quoting" },
  { name: "AI Knowledge Base" },
  { name: "Data Analytics" },
];

export default function HomePage() {
  return (
    <>
      <div className="topbar-wrap">
        <header className="topbar">
          <Link href="/" className="brand" aria-label="Hearthline home">
            <span className="brand-mark"><Flame /></span>
            <span>Hearthline</span>
          </Link>
          <nav className="nav-links">
            <Link href="#features" className="nav-link">Features</Link>
            <Link href="#workflow" className="nav-link">How it works</Link>
            <Link href="#impact" className="nav-link">Impact</Link>
            <Link href="/dashboard" className="nav-link">Dashboard</Link>
            <Link href="/docs" className="nav-link">Docs</Link>
          </nav>
          <div className="topbar-right">
            <Link href="/dashboard" className="btn btn-ghost">Log in</Link>
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-primary">Book a demo</a>
          </div>
        </header>
      </div>

      <main>
        {/* HERO */}
        <section className="shell hero hero-illustrated">
          <HeroBackdrop />
          <span className="hero-meet hero-meet-platform">
            <span className="dot-pulse" aria-hidden />
            <span>For HVAC · Plumbing · Roofing · Solar · Reno</span>
          </span>
          <h1 className="hero-title">
            The 24/7 AI Front Desk<br />
            <span className="hero-title-em">for Home Services.</span>
          </h1>
          <p className="hero-sub">
            Hearthline picks up every call, qualifies every lead, and turns a customer
            photo into a real quote in under a minute. Your crew stays on the tools.
            We run the front desk.
          </p>
          <div className="hero-actions">
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
              Book a demo <span aria-hidden>→</span>
            </a>
            <Link href="/dashboard" className="btn btn-ghost">See the live dashboard</Link>
          </div>

          <LiveTicker />

          {/* Animated dashboard preview */}
          <MockDashboard />
        </section>

        {/* SECTION INTRO */}
        <section className="shell section-tight" id="features">
          <div className="section-head">
            <h2 className="section-title">Configure once. Captures every lead.</h2>
            <p className="section-sub">
              Set your business hours, pricing rules, and service area. Hearthline adapts
              to your trade — from emergency plumbing at 2 AM to a $25k solar quote at noon.
            </p>
          </div>
        </section>

        {/* FEATURE SPLIT — active feature description + numbered list on left, phone widget on right */}
        <section className="shell section-tight">
          <div className="feature-split feature-split-stretch">
            <div className="feature-split-left">
              <div className="feature-active">
                <div className="feature-active-row">
                  <h3 className="feature-active-name">AI Phone Receptionist</h3>
                  <span className="feature-num feature-num-active">01</span>
                </div>
                <p className="feature-active-body">
                  Never miss a call again. Hearthline picks up every inbound within two rings,
                  qualifies the lead in real time, and books the slot directly into your team's
                  calendar — in a voice you choose, with the script your business runs on.
                </p>
                <Link href="/dashboard" className="feature-cta">
                  Explore <span aria-hidden>→</span>
                </Link>
              </div>
              <div className="features-list features-list-tight">
                {FEATURES.slice(1).map((f, i) => (
                  <div className="feature-row muted" key={f.name}>
                    <h3 className="feature-name">{f.name}</h3>
                    <span className="feature-num">0{i + 2}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="feature-split-right">
              <PhoneWidget />
            </div>
          </div>
        </section>

        {/* DARK STATS BAND */}
        <section className="shell section" id="impact">
          <div className="stats-band">
            <div>
              <h2 className="stats-band-title">Designed to capture every opportunity.</h2>
              <p className="stats-band-body">
                Hearthline doesn't just answer phones — it picks up every inbound across every
                channel, qualifies it on the spot, and hands your team a deal-ready conversation.
              </p>
              <ul>
                <li>Automate call qualification &amp; scheduling</li>
                <li>Instant technical answers from your manuals</li>
                <li>Sync every interaction into your CRM</li>
              </ul>
            </div>
            <div className="stats-band-right">
              <div className="stats-card">
                <div className="stats-card-num">24 / 7</div>
                <div className="stats-card-label">Always-on coverage. Even the 2 AM emergency.</div>
              </div>
              <div className="stats-card">
                <div className="stats-card-num">&lt;60s</div>
                <div className="stats-card-label">From customer photo to drafted PDF quote.</div>
              </div>
              <div className="stats-card">
                <div className="stats-card-num">5</div>
                <div className="stats-card-label">Channels on day one. Phone, SMS, WhatsApp, email, chat.</div>
              </div>
            </div>
          </div>
        </section>

        {/* HOW IT FLOWS — cartoon pipeline */}
        <section className="shell section-tight" id="flow">
          <div className="section-head">
            <h2 className="section-title">How a job flows through Hearthline.</h2>
            <p className="section-sub">
              Five stages, fully automated. The customer never feels the handoffs —
              they just get a quick answer, a quote, and a booked time slot.
            </p>
          </div>
          <HeroPipeline />
        </section>

        {/* CONVERSATION SAMPLE */}
        <section className="shell section-tight" id="workflow">
          <div className="section-head">
            <h2 className="section-title">A real conversation, not a chatbot script.</h2>
            <p className="section-sub">
              SMS thread between Hearthline and a customer. Quote drafted, deal created,
              calendar booked — all auto.
            </p>
          </div>
          <div className="workflow-convo workflow-convo-solo">
            <div className="workflow-convo-head">
              <span className="workflow-convo-icon">
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
              </span>
              <div>
                <h3>Inbound Lead Automation</h3>
                <p>Qualifies the lead, syncs to CRM, drafts an estimate — automatically.</p>
              </div>
            </div>

            <div className="workflow-thread">
              <div className="workflow-msg in">
                <span className="workflow-avatar">
                  <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4" /><path d="M4 21c0-4 4-7 8-7s8 3 8 7" /></svg>
                </span>
                <div className="workflow-msg-bubble">
                  I need to replace about 5 windows in my living room. Looking for white PVC.
                </div>
              </div>
              <div className="workflow-msg out">
                <div className="workflow-msg-bubble">
                  Understood. Based on standard sizing, that would start around $3,500. I've just
                  texted you a detailed breakdown and a link to book the technician.
                </div>
                <span className="workflow-avatar ai">AI</span>
              </div>
            </div>

            <div className="workflow-output-label">Output Result</div>
            <div className="workflow-output-row">
              <span className="action-pill quote">
                <span className="action-dot" style={{ background: "#7c3aed" }} />
                Estimate #E-291 · sent
              </span>
              <span className="action-pill booked">
                <span className="action-dot" style={{ background: "#2563eb" }} />
                Deal Created · HubSpot
              </span>
              <span className="action-pill won">
                <span className="action-dot" style={{ background: "#16a34a" }} />
                Survey Booked · Tue 9:30 AM
              </span>
            </div>
          </div>
        </section>

        {/* INDUSTRIES — wide flexibility */}
        <section className="shell section-tight" id="industries">
          <div className="section-head">
            <h2 className="section-title">One platform. Every trade.</h2>
            <p className="section-sub">
              Pricing logic, scripts, and dispatch rules come pre-tuned for each trade — and
              are fully editable. Don't see yours? Hearthline configures to any home-service
              workflow.
            </p>
          </div>
          <div className="industries-grid industries-grid-wide">
            {[
              { name: "HVAC & Plumbing", sketch: <SkPipe />, body: "Emergency-call routing 24/7, technician dispatch, maintenance contracts." },
              { name: "Windows & Doors", sketch: <SkWindow />, body: "Photo quoting, measurement scheduling, installation bookings." },
              { name: "Solar & Roofing", sketch: <SkSolar />, body: "Roof-type qualification, rebate matching, site-survey coordination." },
              { name: "Energy Renovation", sketch: <SkInsulation />, body: "Insulation audits, subsidy applications, multi-step renovation flows." },
              { name: "Garage & Shutters", sketch: <SkGarage />, body: "Brand + model identification, repair vs replace triage, after-hours calls." },
              { name: "Electrical", sketch: <SkBolt />, body: "Emergency vs scheduled job triage, safety-warning scripts, smart-home upsells." },
              { name: "Landscaping & Pools", sketch: <SkLeaf />, body: "Seasonal scheduling, recurring contracts, photo-based estimates." },
              { name: "Cleaning & Restoration", sketch: <SkSpray />, body: "Damage triage, insurance routing, recurring booking, before/after photos." },
              { name: "Pest Control", sketch: <SkBug />, body: "Symptom triage, recurring contracts, neighbour-coverage upsell, follow-ups." },
            ].map((it) => (
              <div className="industry-card" key={it.name}>
                <span className="industry-sketch" aria-hidden>{it.sketch}</span>
                <h3>{it.name}</h3>
                <p>{it.body}</p>
              </div>
            ))}
          </div>
          <p className="industries-note">
            Plus: not in this list? Hearthline plugs into any workflow your team already
            runs. <a href={DEMO_URL} target="_blank" rel="noreferrer">Tell us about yours</a>.
          </p>
        </section>

        {/* CONFIGURABILITY HIGHLIGHT */}
        <section className="shell section-tight">
          <div className="config-band">
            <div className="config-band-text">
              <p className="section-eyebrow">Configurable end-to-end</p>
              <h2 className="config-band-title">
                Your voice. Your pricing. Your CRM. Your hours.
              </h2>
              <p className="config-band-body">
                Pick from 30+ neural voices in 7 languages. Drop in your price book.
                Connect HubSpot, Pipedrive, Salesforce, ServiceTitan, or your custom API.
                Set business hours per channel. Hearthline runs on your rules — not the other
                way around.
              </p>
            </div>
            <ul className="config-knobs">
              <li><span>Voice</span><strong>30+ neural · 7 languages</strong></li>
              <li><span>Pricing</span><strong>Your price book · per-trade rules</strong></li>
              <li><span>CRM</span><strong>HubSpot · Pipedrive · Salesforce · API</strong></li>
              <li><span>Hours</span><strong>Per-channel · per-day · holidays</strong></li>
              <li><span>Voice cloning</span><strong>Use your owner's voice (optional)</strong></li>
              <li><span>Self-host</span><strong>MIT-licensed code on GitHub</strong></li>
            </ul>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className="shell section-tight">
          <div className="final-cta">
            <span className="final-cta-mark"><Flame /></span>
            <h2 className="final-cta-title">
              Stop letting opportunities slip through the cracks.
            </h2>
            <p className="final-cta-sub">
              Calls, chats, photo quote requests — Hearthline captures and qualifies 100%
              of your leads, 24/7. Focus on your craft. We fill your schedule.
            </p>
            <div className="final-cta-actions">
              <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-onDark btn-lg">
                Book a demo <span aria-hidden>→</span>
              </a>
              <Link href="/dashboard" className="btn btn-onDark-ghost">
                See the live dashboard
              </Link>
            </div>
          </div>
        </section>

        {/* FOOTER */}
        <footer className="shell footer">
          <div>
            <div className="brand" style={{ marginBottom: 12 }}>
              <span className="brand-mark"><Flame /></span>
              <span>Hearthline</span>
            </div>
            <p className="footer-tag">
              The 24/7 AI communication hub for home-service teams.
            </p>
          </div>
          <div className="footer-col">
            <h5>Product</h5>
            <a href="#features">Features</a>
            <a href="#industries">Industries</a>
            <Link href="/dashboard">Dashboard</Link>
          </div>
          <div className="footer-col">
            <h5>Resources</h5>
            <Link href="/faq">FAQ</Link>
            <Link href="/docs">Docs</Link>
            <a href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <Link href="/privacy">Privacy</Link>
            <Link href="/terms">Terms</Link>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Hearthline.</span>
            <span>Made with care for home-service teams.</span>
          </div>
        </footer>
      </main>

      {/* Floating chat widget */}
      <ChatWidget />
    </>
  );
}

function Flame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
    </svg>
  );
}

// Hand-drawn sketch icons used on the industry cards.
const sketchProps = {
  viewBox: "0 0 64 64",
  fill: "none" as const,
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

function SkPipe() {
  return (
    <svg {...sketchProps}>
      <path d="M6 28h22a8 8 0 0 1 8 8v18" />
      <rect x="4" y="24" width="6" height="8" rx="1" />
      <rect x="32" y="52" width="10" height="6" rx="1" />
      <circle cx="36" cy="36" r="6" />
      <path d="M36 28v-6M30 36h-4M46 36h-4" />
    </svg>
  );
}
function SkWindow() {
  return (
    <svg {...sketchProps}>
      <rect x="10" y="8" width="44" height="48" rx="2" />
      <path d="M10 32h44M32 8v48" />
      <path d="M14 12h36M14 36h36" strokeOpacity="0.4" />
    </svg>
  );
}
function SkSolar() {
  return (
    <svg {...sketchProps}>
      <path d="M6 50 L24 14 L52 14 L34 50 Z" />
      <path d="M16 32 L42 32M22 22 L38 50M30 14 L24 50" />
      <circle cx="46" cy="10" r="4" />
      <path d="M46 4v3M46 13v3M40 10h3M52 10h3M42 6l2 2M48 14l2 2" />
    </svg>
  );
}
function SkInsulation() {
  return (
    <svg {...sketchProps}>
      <path d="M6 22 L32 6 L58 22 L58 58 L6 58 Z" />
      <path d="M14 30c4 0 4 4 8 4s4-4 8-4 4 4 8 4 4-4 8-4" />
      <path d="M14 42c4 0 4 4 8 4s4-4 8-4 4 4 8 4 4-4 8-4" />
      <path d="M14 54h36" />
    </svg>
  );
}
function SkGarage() {
  return (
    <svg {...sketchProps}>
      <path d="M6 24 L32 8 L58 24 L58 58 L6 58 Z" />
      <rect x="14" y="32" width="36" height="22" />
      <path d="M14 40h36M14 47h36M22 32v22M32 32v22M42 32v22" strokeOpacity="0.6" />
    </svg>
  );
}
function SkBolt() {
  return (
    <svg {...sketchProps}>
      <path d="M30 6 L14 36 L26 36 L20 58 L46 28 L34 28 L40 6 Z" />
    </svg>
  );
}
function SkLeaf() {
  return (
    <svg {...sketchProps}>
      <path d="M10 54c0-22 18-40 44-44 0 26-18 44-44 44z" />
      <path d="M14 50 L48 16" />
      <path d="M22 42q4-2 8-2M28 36q4-2 8-2M34 30q4-2 8-2" strokeOpacity="0.6" />
    </svg>
  );
}
function SkSpray() {
  return (
    <svg {...sketchProps}>
      <rect x="20" y="16" width="20" height="40" rx="2" />
      <rect x="22" y="6" width="16" height="10" rx="1" />
      <path d="M40 18 L52 14 L52 26 L40 22" />
      <path d="M48 16 L56 14M48 18 L56 18M48 20 L56 22" strokeOpacity="0.5" />
      <path d="M22 36h16" />
    </svg>
  );
}
function SkBug() {
  return (
    <svg {...sketchProps}>
      <ellipse cx="32" cy="36" rx="14" ry="18" />
      <circle cx="32" cy="20" r="6" />
      <path d="M26 16 L20 8M38 16 L44 8" />
      <path d="M18 30 L8 26M46 30 L56 26M18 40 L8 40M46 40 L56 40M18 50 L10 56M46 50 L54 56" />
      <path d="M32 22v32M26 30q6 4 12 0M26 42q6 4 12 0" strokeOpacity="0.5" />
    </svg>
  );
}
