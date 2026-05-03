import Link from "next/link";

import ThemeToggle from "../ThemeToggle";
import LanguageSwitcher from "../LanguageSwitcher";

export const metadata = {
  title: "Docs",
  description:
    "Self-host Hearthline — Django 5 + DRF backend, Next.js 15 frontend, Vapi + Twilio voice. Stack, architecture, quick start, roadmap.",
  alternates: { canonical: "/docs" },
  openGraph: {
    title: "Hearthline · Docs",
    description: "Self-host Hearthline. Stack, architecture, quick start, roadmap.",
    url: "/docs",
  },
};

const GITHUB_URL = "https://github.com/codewithmuh/hearthline";
const YT_URL = "https://www.youtube.com/@codewithmuh";

const STACK = [
  { tag: "Backend", title: "Django 5 + DRF", body: "5 apps · 8 models · Vapi custom-LLM endpoint · Twilio webhooks · service layer for Claude orchestration + OpenAI Vision. Migrations included.", codeHint: "apps/{core,leads,calls,quotes,ai}" },
  { tag: "Frontend", title: "Next.js 15 + React 19", body: "App Router, server components, real-time dashboard with KPIs, lead detail, quote line items, customers, settings.", codeHint: "app/dashboard/{leads,calls,quotes,…}" },
  { tag: "Voice", title: "Vapi + Twilio (custom-LLM mode)", body: "Vapi POSTs every conversation turn to /api/calls/vapi/chat/completions/ — Anna runs an agentic loop server-side and returns the next utterance plus optional X-Vapi-End-Call header.", codeHint: "apps/calls/views.py · chat_completions" },
  { tag: "AI Pipeline", title: "Anna · Claude Sonnet 4.6 + GPT-4o vision", body: "5-tool loop (qualify_lead, check_availability, book_appointment, send_sms, end_call). Tools persist Customer, Lead, Conversation rows in real time. Vision pipeline drafts quotes from a single photo.", codeHint: "apps/calls/agent/{prompts,tools,receptionist}.py" },
  { tag: "Database", title: "Postgres 16", body: "Single docker volume. Seed command included — one shell command and you have 8 leads, 5 calls, 4 quotes to play with.", codeHint: "manage.py seed_demo --wipe" },
  { tag: "Infra", title: "Docker Compose", body: "Three services: db, backend, frontend. Hot-reload mounted on both apps. No build tooling, no Vercel config, no AWS.", codeHint: "docker-compose.yml" },
];

const PIPELINE = [
  { stage: "Inbound call", code: "Vapi · custom-LLM mode", body: "Vapi handles STT + TTS. The caller hears Anna in the voice you picked, in the language you configured." },
  { stage: "Every turn POSTs the transcript", code: "POST /api/calls/vapi/chat/completions/", body: "OpenAI-compatible payload. Django converts it to Claude format and runs the agent loop." },
  { stage: "Anna decides what to do next", code: "agent/receptionist.py", body: "Claude Sonnet 4.6 picks from 5 tools — qualify_lead, check_availability, book_appointment, send_sms, end_call — or speaks." },
  { stage: "Tools write to the database", code: "services/persistence.py", body: "qualify_lead creates/updates Customer + Lead + Conversation. book_appointment confirms a slot. Every fact Anna learned is persisted." },
  { stage: "Photo → quote", code: "POST /api/quotes/from-photo/", body: "GPT-4o vision drafts line items, subtotal, tax, total, and customer-facing notes from a single inbound MMS or chat upload." },
  { stage: "Dashboard updates live", code: "GET /api/leads/ · GET /api/calls/", body: "Server component re-fetches, action pill flips to Qualified / Quote Sent / Booked / Won." },
];

const ROADMAP = {
  done: [
    "Django data model (Business, Channel, Customer, Lead, Conversation, Message, Call, Quote, LineItem)",
    "Vapi + Twilio webhook handlers with structured-JSON Claude extraction",
    "OpenAI Vision pipeline → drafted quote with line items, tax, total",
    "Next.js dashboard: Overview, Leads, Calls, Quotes, Customers, Settings",
    "Lead-detail conversation timeline + extracted_fields inspector",
    "seed_demo management command for instant believable data",
    "Docker Compose 3-service stack with hot-reload",
  ],
  wip: [
    "Stripe checkout for deposit collection on quote acceptance",
    "Outbound SMS / WhatsApp via Twilio for quote delivery",
    "Multi-tenant auth (today: single business, no login)",
    "PDF rendering for the customer-facing quote",
  ],
  todo: [
    "Subsidy lookup integration (solar / energy renovation)",
    "Tech dispatch + GPS routing for booked jobs",
    "Review request automation (Google + Trustpilot webhooks)",
    "Eval harness for the Claude extraction prompt",
  ],
};

export default function DocsPage() {
  return (
    <>
      <div className="topbar-wrap">
        <header className="topbar">
          <Link href="/" className="brand" aria-label="Hearthline home">
            <span className="brand-mark"><Flame /></span>
            <span>Hearthline</span>
            <span className="oss-pill">open-source</span>
          </Link>
          <nav className="nav-links">
            <Link href="/" className="nav-link">Home</Link>
            <Link href="#stack" className="nav-link">Stack</Link>
            <Link href="#flow" className="nav-link">Pipeline</Link>
            <Link href="#run" className="nav-link">Quick start</Link>
            <Link href="#roadmap" className="nav-link">Roadmap</Link>
            <Link href="/login" className="nav-link">Sign in</Link>
          </nav>
          <div className="topbar-right">
            <LanguageSwitcher />
            <ThemeToggle />
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-ghost gh-btn">
              <Github /> Star on GitHub
            </a>
            <a href={YT_URL} target="_blank" rel="noreferrer" className="btn btn-primary">▶ Build along</a>
          </div>
        </header>
      </div>

      <main>
        {/* HERO */}
        <section className="shell hero">
          <span className="hero-eyebrow">
            <span className="dot" /> Built in public · AGPL-3.0 · Self-hostable
          </span>
          <h1 className="hero-title">
            Fork the whole stack.<br />Run it on your laptop.
          </h1>
          <p className="hero-sub">
            Hearthline is open source. Same dashboard you saw on the home page, same AI pipeline,
            the same code we ship in the YouTube build-alongs — yours under AGPL-3.0.
          </p>
          <div className="hero-actions">
            <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
              <Github /> Clone the repo
            </a>
            <a href={YT_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
              ▶ Watch the build
            </a>
          </div>

          <ul className="hero-meta">
            <li><strong>0</strong> SaaS lock-in</li>
            <li><strong>5</strong> Django apps</li>
            <li><strong>2</strong> AI providers (Claude + OpenAI)</li>
            <li><strong>3</strong> Docker services</li>
          </ul>
        </section>

        <div className="ember-line" aria-hidden />

        {/* STACK */}
        <section className="shell section-tight" id="stack">
          <div className="section-head">
            <span className="section-flourish">What&rsquo;s in the repo</span>
            <h2 className="section-title">A real, runnable stack — not a marketing site.</h2>
            <p className="section-sub">
              Every box below is wired up in code. No "coming soon" labels. Empty fields just
              mean you haven't filled in your API keys yet.
            </p>
          </div>
          <div className="stack-grid">
            {STACK.map((s) => (
              <article className="stack-card" key={s.title}>
                <span className="stack-tag">{s.tag}</span>
                <h3 className="stack-title">{s.title}</h3>
                <p className="stack-body">{s.body}</p>
                <code className="stack-code">{s.codeHint}</code>
              </article>
            ))}
          </div>
        </section>

        <div className="ember-line" aria-hidden />

        {/* PIPELINE */}
        <section className="shell section" id="flow">
          <div className="section-head">
            <span className="section-flourish">The pipeline</span>
            <h2 className="section-title">What happens when Anna picks up.</h2>
            <p className="section-sub">
              Six stages, each one a single function, webhook, or tool dispatch in the
              codebase. Trace it with your IDE in five minutes.
            </p>
          </div>
          <ol className="pipeline">
            {PIPELINE.map((s, i) => (
              <li key={s.stage} className="pipeline-step">
                <span className="pipeline-num">{String(i + 1).padStart(2, "0")}</span>
                <div>
                  <div className="pipeline-stage">{s.stage}</div>
                  <code className="pipeline-code">{s.code}</code>
                  <p className="pipeline-body">{s.body}</p>
                </div>
              </li>
            ))}
          </ol>
        </section>

        <div className="ember-line" aria-hidden />

        {/* RUN */}
        <section className="shell section-tight" id="run">
          <div className="section-head">
            <span className="section-flourish">Get it running</span>
            <h2 className="section-title">Three commands. No login. No waitlist.</h2>
          </div>
          <div className="run-grid">
            <pre className="codeblock">
              <code>{`# 1 — clone
git clone https://github.com/codewithmuh/hearthline.git
cd hearthline

# 2 — copy the env template (works without API keys)
cp .env.example .env

# 3 — bring it up
docker compose up --build

# you now have:
#   http://localhost:3000        Next.js dashboard
#   http://localhost:8000/admin  Django admin
#   http://localhost:8000/api    REST API`}</code>
            </pre>
            <div className="run-side">
              <h3>Want demo data?</h3>
              <p>Run the seed command and the dashboard fills with believable rows.</p>
              <pre className="codeblock codeblock-mini">
                <code>docker compose exec backend \
  python manage.py seed_demo --wipe</code>
              </pre>
              <h3 style={{ marginTop: 28 }}>Wiring real voice</h3>
              <p>Drop your Vapi key in <code>.env</code> and point the assistant webhook at:</p>
              <pre className="codeblock codeblock-mini">
                <code>https://&lt;ngrok&gt;/api/calls/webhooks/vapi/</code>
              </pre>
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ marginTop: 24 }}>
                <Github /> Read the README
              </a>
            </div>
          </div>
        </section>

        <div className="ember-line" aria-hidden />

        {/* ROADMAP */}
        <section className="shell section" id="roadmap">
          <div className="section-head">
            <span className="section-flourish">Built in public</span>
            <h2 className="section-title">What's done. What's next. What's not yet.</h2>
            <p className="section-sub">
              Pull requests welcome. Each line below is a real GitHub issue.
            </p>
          </div>
          <div className="roadmap-grid">
            <RoadmapCol title="Shipped" tone="done" items={ROADMAP.done} />
            <RoadmapCol title="In progress" tone="wip" items={ROADMAP.wip} />
            <RoadmapCol title="Open issues" tone="todo" items={ROADMAP.todo} />
          </div>
        </section>

        {/* CREATOR */}
        <section className="shell section-tight">
          <div className="creator-card">
            <div className="creator-text">
              <span className="section-flourish">Built by</span>
              <h2 className="creator-title">@codewithmuh</h2>
              <p className="creator-body">
                I make AI build-along videos for developers. Hearthline is one of the projects
                I'm shipping live — the codebase here is the same one in the videos. If you're
                learning to ship AI agents end-to-end, the channel walks through every line.
              </p>
              <div className="creator-actions">
                <a href={YT_URL} target="_blank" rel="noreferrer" className="btn btn-primary">
                  ▶ codewithmuh on YouTube
                </a>
                <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-ghost">
                  <Github /> github.com/codewithmuh
                </a>
              </div>
            </div>
            <div className="creator-grid">
              <div className="creator-stat"><strong>25K+</strong><span>YouTube subscribers</span></div>
              <div className="creator-stat"><strong>75</strong><span>Build-along videos</span></div>
              <div className="creator-stat"><strong>1</strong><span>Video / week cadence</span></div>
              <div className="creator-stat"><strong>AGPL-3.0</strong><span>Licensed code</span></div>
            </div>
          </div>
        </section>

        <div className="ember-line" aria-hidden />

        {/* FINAL CTA */}
        <section className="shell section-tight">
          <div className="final-cta">
            <span className="final-cta-mark"><Flame /></span>
            <h2 className="final-cta-title">
              The whole thing is yours. Fork it, deploy it, sell it under your own brand.
            </h2>
            <p className="final-cta-sub">
              AGPL-3.0 by default; commercial license available for white-label and closed-source
              forks. The dashboard you've been scrolling through is the one you'll get.
            </p>
            <div className="final-cta-actions">
              <a href={GITHUB_URL} target="_blank" rel="noreferrer" className="btn btn-onDark">
                <Github /> Clone on GitHub
              </a>
              <Link href="/login" className="btn btn-onDark-ghost">
                Sign in to dashboard
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
              <span className="oss-pill">AGPL-3.0</span>
            </div>
            <p className="footer-tag">
              Open-source AI front-desk for home-service teams.
              Built in public by <a href={YT_URL} target="_blank" rel="noreferrer">@codewithmuh</a>.
            </p>
          </div>
          <div className="footer-col">
            <h5>Code</h5>
            <a href={GITHUB_URL} target="_blank" rel="noreferrer">GitHub repo</a>
            <a href="#run">Quick start</a>
            <a href="#stack">Stack</a>
            <a href="#roadmap">Roadmap</a>
          </div>
          <div className="footer-col">
            <h5>Build along</h5>
            <a href={YT_URL} target="_blank" rel="noreferrer">YouTube channel</a>
            <a href="https://x.com/codewithmuh" target="_blank" rel="noreferrer">@codewithmuh on X</a>
          </div>
          <div className="footer-col">
            <h5>Legal</h5>
            <a href={`${GITHUB_URL}/blob/main/LICENSE`} target="_blank" rel="noreferrer">AGPL-3.0 License</a>
            <a href={`${GITHUB_URL}/blob/main/COMMERCIAL.md`} target="_blank" rel="noreferrer">Commercial license</a>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Hearthline. Open-source under AGPL-3.0.</span>
            <span>Next.js · Django · Vapi · Twilio · Claude · Postgres</span>
          </div>
        </footer>
      </main>
    </>
  );
}

function RoadmapCol({ title, tone, items }: { title: string; tone: "done" | "wip" | "todo"; items: string[] }) {
  const symbol = tone === "done" ? "✓" : tone === "wip" ? "·" : "○";
  return (
    <div className={`roadmap-col tone-${tone}`}>
      <h3>{title} <span className="roadmap-count">{items.length}</span></h3>
      <ul>
        {items.map((it) => (
          <li key={it}><span className="roadmap-bullet">{symbol}</span>{it}</li>
        ))}
      </ul>
    </div>
  );
}

function Flame() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d="M8.5 14.5A2.5 2.5 0 0 0 11 17c1.5 0 2.5-.5 3-1.5 1-1.6.6-3.4-1-5-1.6-1.6-2-3.4-1-5C12.5 4 12 3 11 2.5 9.5 2 8 2.5 7 4 5.5 6 5 9 6.5 11c.5 1 .5 2.5-.5 3.5z" />
    </svg>
  );
}

function Github() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" width="16" height="16" aria-hidden>
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.28-.01-1.02-.02-2-3.2.7-3.88-1.54-3.88-1.54-.52-1.32-1.27-1.67-1.27-1.67-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.18 1.76 1.18 1.02 1.75 2.68 1.25 3.34.95.1-.74.4-1.25.72-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.29 1.18-3.1-.12-.29-.51-1.46.11-3.04 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.79 0c2.21-1.49 3.18-1.18 3.18-1.18.62 1.58.23 2.75.11 3.04.74.81 1.18 1.84 1.18 3.1 0 4.42-2.69 5.39-5.25 5.68.41.36.78 1.06.78 2.13 0 1.54-.01 2.79-.01 3.16 0 .31.21.68.8.56C20.21 21.39 23.5 17.08 23.5 12 23.5 5.65 18.35.5 12 .5z"/>
    </svg>
  );
}
