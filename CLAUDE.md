# Hearthline — project context for Claude

This file is loaded by Claude Code on every conversation. It captures the
"why" and "how" of Hearthline so I don't have to re-explain it each time.

---

## What this project is

**Hearthline** is an open-source AI front desk for home-service teams (HVAC,
plumbing, roofing, solar, energy renovation, garage, electrical, landscaping,
cleaning, pest control). MIT licensed. Built in public.

Tagline: *"The 24/7 AI front desk for home services."*

The product:
- A persona named **Anna** answers every inbound call via Vapi, qualifies the
  lead, books a slot, and sends an SMS confirmation.
- Captures multi-channel touches (phone, SMS, WhatsApp, email, web chat).
- Drafts photo-based quotes using OpenAI vision.
- Writes structured leads into a Django dashboard the business owner uses.

Live demo target: **hearthline.codewithmuh.com**.
Repo target: **github.com/codewithmuh/hearthline** (public, MIT).

## Who's behind it

- **Muhammad Rashid (@codewithmuh)** — content creator, 25K+ YouTube subs,
  channel focused on AI build-along videos.
- Site: https://codewithmuh.com
- LinkedIn: https://www.linkedin.com/in/muhammad-rashid-daha/
- YouTube: https://www.youtube.com/@codewithmuh
- X: https://x.com/codewithmuh
- Calendly: https://calendly.com/contact-codewithmuh/30min

The business model is **OSS first, done-for-you setup paid**. Companies
self-host (or pay Rashid to deploy). No multi-tenant SaaS yet.

---

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 + React 19 + TypeScript (App Router, server components) |
| Backend | Django 5 + DRF |
| Database | Postgres 16 (Neon on Vercel deploys) |
| Voice | Vapi (custom-LLM mode) + Twilio (SMS / fallback) |
| AI | Anthropic Claude Sonnet 4.6 (orchestration), OpenAI GPT-4o vision |
| Local dev | Docker Compose (db + backend + frontend) |
| Production | Vercel (multi-service: frontend + Django serverless) OR VPS Docker Compose + Caddy |

## Repo layout

```
hearthline/
├── README.md                    # public-facing
├── LICENSE                      # MIT, Muhammad Rashid 2026
├── CONTRIBUTING.md              # PR workflow
├── DEPLOY.md                    # Vercel + VPS deploy guide
├── CLAUDE.md                    # this file
├── docker-compose.yml           # local dev
├── docker-compose.prod.yml      # VPS production
├── Caddyfile                    # auto-HTTPS reverse proxy for VPS
├── vercel.json                  # multi-service config (frontend + backend)
├── .env.example                 # all env vars documented
├── .github/                     # CI, FUNDING, issue/PR templates
├── frontend/                    # Next.js app
│   ├── app/                     # routes
│   │   ├── page.tsx             # marketing landing
│   │   ├── faq/, privacy/, terms/, docs/   # legal + docs
│   │   ├── dashboard/           # full SaaS app shell
│   │   │   ├── layout.tsx       # sidebar + global topbar
│   │   │   ├── page.tsx         # Overview
│   │   │   ├── leads/, calls/, quotes/, customers/, settings/, test-call/
│   │   │   └── lib.ts, parts.tsx
│   │   ├── HeroBackdrop.tsx     # animated SVG sketches behind hero
│   │   ├── HeroPipeline.tsx     # 5-stage cartoon flow
│   │   ├── MockDashboard.tsx    # animated dashboard preview
│   │   ├── PhoneWidget.tsx      # ringing-call card with live transcript
│   │   ├── ChatWidget.tsx       # floating bottom-right chat
│   │   ├── LiveTicker.tsx       # scrolling activity ticker
│   │   ├── FeatureExplorer.tsx  # interactive feature switcher
│   │   └── globals.css          # all styles in one file (intentional)
│   ├── vercel.json
│   └── package.json             # Next 15.5.x + React 19
└── backend/                     # Django
    ├── api/index.py             # Vercel Python WSGI entrypoint
    ├── manage.py
    ├── Dockerfile               # local dev (runserver)
    ├── Dockerfile.prod          # VPS production (gunicorn)
    ├── vercel.json              # @vercel/python runtime config
    ├── requirements.txt
    ├── hearthline/              # Django project (settings, urls, wsgi, asgi)
    └── apps/
        ├── core/                # Business, Channel
        ├── leads/               # Customer, Lead, Conversation, Message
        │   └── management/commands/seed_demo.py    # populates dashboard
        ├── calls/               # Call + Vapi/Twilio + Anna agent
        │   ├── views.py         # CallList, VapiWebhook, TwilioWebhook, chat_completions
        │   ├── agent/
        │   │   ├── prompts.py        # Anna's system prompt
        │   │   ├── tools.py          # 5 tool schemas
        │   │   └── receptionist.py   # agentic loop (Claude + tool dispatch)
        │   └── services/
        │       ├── sms.py            # Twilio sender (stubs without keys)
        │       ├── scheduling.py     # slot availability stub
        │       └── persistence.py    # qualify_lead_tool, book_appointment_tool
        ├── quotes/              # Quote, LineItem (editable, printable PDF)
        └── ai/                  # services.py — vision photo→quote, transcript→lead
```

## Key URLs / endpoints

**Public dashboard routes:**
- `/` landing (marketing)
- `/faq`, `/privacy`, `/terms`, `/docs` — legal + OSS docs
- `/dashboard` — Overview (KPIs + Recent Interactions)
- `/dashboard/leads` (`+ /[id]`), `/dashboard/calls`, `/dashboard/quotes` (`+ /new`, `/[id]`)
- `/dashboard/customers`, `/dashboard/settings`, `/dashboard/test-call`

**API endpoints:**
- `GET  /api/health/`
- `GET  /api/businesses/`, `/api/leads/`, `/api/calls/`, `/api/quotes/`
- `GET/PATCH /api/leads/<id>/`, `/api/quotes/<id>/`
- `POST /api/quotes/from-photo/`               (vision → quote)
- `POST /api/calls/webhooks/vapi/`             (Vapi end-of-call report)
- `POST /api/calls/webhooks/twilio/`           (Twilio voice/SMS)
- `POST /api/calls/vapi/chat/completions/`     (Vapi custom-LLM, OpenAI-compatible)

## How Anna's agent loop works

1. Vapi handles STT + TTS, POSTs the running conversation to
   `/api/calls/vapi/chat/completions/` on every turn.
2. View converts OpenAI-format messages → Claude format, runs the loop in
   `apps/calls/agent/receptionist.py`.
3. Claude can call tools (`qualify_lead`, `check_availability`,
   `book_appointment`, `send_sms`, `end_call`). Tool dispatchers are in
   `apps/calls/services/`.
4. Lead/Customer rows are created/updated as Anna learns more.
5. Final response returns as OpenAI completion. SSE streaming supported.
   `X-Vapi-End-Call: true` header tells Vapi to hang up.

If `ANTHROPIC_API_KEY` is missing the agent returns a friendly stub so dev never crashes.

---

## Commands

### Local dev (Docker Compose)

```bash
docker compose up --build              # 3 services: db, backend, frontend
docker compose exec backend python manage.py seed_demo --wipe   # seed
docker compose exec backend python manage.py createsuperuser
```

URLs:
- http://localhost:3000 — Next.js dashboard
- http://localhost:8000/admin — Django admin
- http://localhost:8000/api — REST API

### Production VPS (Path B)

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy handles auto-HTTPS via Let's Encrypt. Backend must have `API_DOMAIN`
and `FRONTEND_ORIGIN` env vars.

### Vercel (Path A — preferred for the demo)

Push to GitHub → import on vercel.com/new → Vercel reads root `vercel.json`
and deploys both services. Run migrations from laptop pointed at Neon.

---

## Coding conventions

- **No comments unless the *why* is non-obvious.** The *what* is the code.
- **Short PRs.** One concern at a time.
- **No emojis in code unless the user explicitly asks.** OK in CSS for UI badges.
- **Tailwind is NOT used.** All styles live in `frontend/app/globals.css` —
  intentional, keeps the design system in one place. Don't bring in Tailwind
  or styled-components.
- **No `any` in TypeScript without a `// reason:` comment.**
- **Python:** PEP 8, type hints encouraged. The pylint warnings about
  `Class 'X' has no 'objects' member` are pylint-django false positives —
  ignore them.
- **Django models** stay in `apps/<app>/models.py`. Migrations live in
  `apps/<app>/migrations/`.
- **Marketing landing pages** must NEVER use realistic PII. The mock dashboard
  uses `Customer 001`–`Customer 008` with `+1 (000) 123-4567` phone numbers
  and `example.test` emails. The internal dashboard (behind `/dashboard`) can
  use realistic-feeling seed data — that's a deliberate split.

## Things to remember (lessons from earlier conversations)

1. **Never frame Hearthline as a "Bravi alternative."** Position as its own
   project. The user explicitly corrected this.
2. **Anna is the recurring brand character** — voice persona, chat widget AI,
   Test Call simulator. Use her name consistently.
3. **The user is a content creator.** The repo's purpose is to drive YouTube
   build-along videos and Calendly bookings for done-for-you setups, NOT to
   become a SaaS.
4. **Brand presence:** "by codewithmuh" pill in the topbar + creator credit
   row in the footer (codewithmuh.com, LinkedIn, YouTube, X, GitHub).
5. **No real customer testimonials.** No fake "X said about us" quotes. The
   project doesn't have customers yet — be honest.
6. **Dashboard demo data uses realistic names** (Mark Johnson etc.) but
   the marketing page does NOT. Don't mix these.
7. **Two deploy paths supported** (Vercel multi-service OR Vercel + VPS) —
   don't drop one for the other without asking.
8. **Hot reload caveats:** when CSS/component changes don't appear, the cause
   is usually browser cache. Tell the user to hard-refresh (Cmd+Shift+R)
   before debugging further.
9. **MockDashboard data must be deterministic on first render** — it caused
   a hydration mismatch when `Math.random()` ran at module load. New random
   rows only appear inside `useEffect` after mount.

## What NOT to add

- ❌ Tailwind CSS or any other CSS framework
- ❌ Multi-tenant auth / billing (stays out of OSS until traction proves it)
- ❌ Fake customer logos in the trusted-by strip
- ❌ Fake testimonials / case studies
- ❌ Realistic-looking PII on the marketing page
- ❌ Background jobs requiring a queue (no Celery / Redis) — Vercel doesn't
  support long-running workers; use Vercel Cron + a separate function if
  needed
- ❌ Server-Sent Events on the dashboard (works, but adds complexity Vercel
  serverless doesn't love)

## Things in flight / roadmap

**Shipped**
- Django data model (Business, Channel, Customer, Lead, Conversation, Message, Call, Quote, LineItem)
- Vapi custom-LLM endpoint with structured Claude tool loop
- OpenAI Vision → drafted quote with line items + tax + total
- Next.js dashboard: Overview, Leads, Calls, Quotes (editable + browser-print PDF), Customers, Settings, Test Anna
- Lead-detail conversation timeline + extracted_fields JSON inspector
- `seed_demo` management command
- Docker Compose local + production stacks
- Vercel multi-service deploy config

**In progress / next**
- Stripe checkout for deposit collection on quote acceptance
- Outbound SMS / WhatsApp via Twilio for quote delivery
- Multi-tenant auth (today: single business)
- PDF rendering server-side (replacing browser print path)
- Real Google Calendar integration in `services/scheduling.py`

**Open issues**
- Subsidy lookup integration (solar / energy renovation)
- Tech dispatch + GPS routing for booked jobs
- Review request automation (Google + Trustpilot webhooks)
- Eval harness for the Anna prompt

---

## Style for content (when generating YouTube titles, README sections, etc.)

- Lead with the **outcome** ("From first ring to final invoice"), not the tech.
- Use the build-along voice: "I shipped X. Here's the code."
- Keep tagline punchy. Avoid corporate language ("empowering teams to…").
- Do NOT compare to competitors by name in copy. Position as standalone.
