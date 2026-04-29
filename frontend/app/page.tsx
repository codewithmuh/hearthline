import Link from "next/link";

import ChatWidget from "./ChatWidget";
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
        <section className="shell hero">
          <span className="hero-eyebrow">
            <span className="dot" /> For HVAC · Plumbing · Roofing · Solar · Reno
          </span>
          <h1 className="hero-title">
            The AI Communication Hub<br />for Home Services.
          </h1>
          <p className="hero-sub">
            Automate your entire customer flow. Hearthline handles 24/7 inbound calls,
            qualifies leads instantly, and generates precise quotes in seconds —
            empowering your team to close more deals with less effort.
          </p>
          <div className="hero-actions">
            <Link href="/dashboard" className="btn btn-primary">
              Talk with our AI receptionist <span aria-hidden>→</span>
            </Link>
            <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">Book a demo</a>
          </div>

          {/* Animated dashboard preview */}
          <MockDashboard />
        </section>

        {/* SECTION INTRO */}
        <section className="shell section-tight" id="features">
          <div className="section-head">
            <h2 className="section-title">Hearthline turns every lead into a sales opportunity</h2>
            <p className="section-sub">
              Designed for home-service professionals. Our AI agents handle calls, qualify
              prospects, and sync everything to your CRM — so you never miss a deal.
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
                  Never miss a call again. Anna picks up every inbound within two rings,
                  qualifies the lead in real time, and books the slot directly into your team's
                  calendar — all in a voice that sounds like part of your brand.
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

        {/* WORKFLOW */}
        <section className="shell section-tight" id="workflow">
          <div className="section-head">
            <h2 className="section-title">Communication workflows.</h2>
            <p className="section-sub">
              From simple call routing to multi-step processes — Hearthline adapts to your
              business logic.
            </p>
          </div>

          <div className="workflow-tabs">
            {[
              { name: "Lead Prequalification", sub: "Intake & routing", active: true,
                icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg> },
              { name: "Support & Ticketing", sub: "Resolution & sync",
                icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg> },
              { name: "Order Management", sub: "Status & logistics",
                icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" /><polyline points="3.27 6.96 12 12.01 20.73 6.96" /><line x1="12" y1="22.08" x2="12" y2="12" /></svg> },
              { name: "Installation Booking", sub: "Scheduling & reminders",
                icon: <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
            ].map((t) => (
              <div className={`workflow-tab ${t.active ? "active" : ""}`} key={t.name}>
                <span className="workflow-tab-icon">{t.icon}</span>
                <div>
                  <span className="workflow-tab-name">{t.name}</span>
                  <span className="workflow-tab-sub">{t.sub}</span>
                </div>
              </div>
            ))}
          </div>

          <div className="workflow-canvas">
            {/* Visual node graph */}
            <div className="workflow-graph">
              <span className="workflow-live">
                <span className="dot-pulse" /> Live Workflow
              </span>

              <div className="wgraph-node start">
                <div className="wgraph-node-tag">
                  <span className="wgraph-icon green">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                  </span>
                  Trigger
                </div>
                <div className="wgraph-node-title">Source Created</div>
                <div className="wgraph-node-sub">Inbound Call · Vapi</div>
              </div>

              <div className="wgraph-edge" />

              <div className="wgraph-row">
                <div className="wgraph-node">
                  <div className="wgraph-node-tag">
                    <span className="wgraph-icon blue">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 11H1l8-8" /><path d="M9 13h8l-8 8" /></svg>
                    </span>
                    LLM Step
                  </div>
                  <div className="wgraph-node-title">Lead Qualification</div>
                  <div className="wgraph-node-sub">Trade · Urgency · Value</div>
                </div>
                <div className="wgraph-node">
                  <div className="wgraph-node-tag">
                    <span className="wgraph-icon purple">
                      <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                    </span>
                    Action
                  </div>
                  <div className="wgraph-node-title">Audit Trigger</div>
                  <div className="wgraph-node-sub">CRM · HubSpot</div>
                </div>
              </div>

              <div className="wgraph-edge converge" />

              <div className="wgraph-node end">
                <div className="wgraph-node-tag">
                  <span className="wgraph-icon orange">
                    <svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                  </span>
                  Output
                </div>
                <div className="wgraph-node-title">Estimate Generated</div>
                <div className="wgraph-node-sub">PDF · sent via SMS</div>
              </div>
            </div>

            {/* Conversation panel (right) */}
            <div className="workflow-convo">
              <div className="workflow-convo-head">
                <span className="workflow-convo-icon">
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2A19.79 19.79 0 0 1 2 4.18 2 2 0 0 1 4 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" /></svg>
                </span>
                <div>
                  <h3>Inbound Lead Automation</h3>
                  <p>Qualifies new leads, creates CRM records, and sends preliminary estimates automatically.</p>
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
              </div>
            </div>
          </div>
        </section>

        {/* INDUSTRIES */}
        <section className="shell section-tight">
          <div className="section-head">
            <h2 className="section-title">Designed for your industry, built for results.</h2>
            <p className="section-sub">
              Hearthline's pricing rules, dispatch logic, and workflows come pre-tuned for the
              way home-service teams actually operate.
            </p>
          </div>
          <div className="industries-grid">
            {[
              { name: "Windows & Doors", body: "Automate quote requests, schedule measurements, manage installation bookings." },
              { name: "HVAC & Plumbing", body: "Handle emergency calls 24/7, dispatch technicians, streamline maintenance contracts." },
              { name: "Solar & Roofing", body: "Pre-qualify leads on roof type and bill, coordinate site surveys seamlessly." },
              { name: "Energy Renovation", body: "Qualify insulation projects, manage energy audits, streamline subsidy applications." },
            ].map((it) => (
              <div className="industry-card" key={it.name}>
                <h3>{it.name}</h3>
                <p>{it.body}</p>
              </div>
            ))}
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
              <a href={DEMO_URL} target="_blank" rel="noreferrer" className="btn btn-onDark">
                Book a demo <span aria-hidden>→</span>
              </a>
              <Link href="/dashboard" className="btn btn-onDark-ghost">
                Talk with our AI receptionist
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
            <a href="#features">Voice AI</a>
            <a href="#features">Chat Assistant</a>
            <a href="#features">Photo Quoting</a>
            <a href="#features">CRM Sync</a>
          </div>
          <div className="footer-col">
            <h5>Company</h5>
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/docs">Docs</Link>
            <a href={DEMO_URL} target="_blank" rel="noreferrer">Book a demo</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href="#">Privacy</a>
            <a href="#">Terms</a>
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
