# Hearthline

> **The open-source AI front desk for home-service teams.**
> Your receptionist's name, voice, and script. Your AI keys. Your data.
> Self-hostable. AGPL-3.0 (commercial license available). Built in public.

[![License: AGPL-3.0](https://img.shields.io/badge/License-AGPL--3.0-black.svg)](LICENSE)
[![Commercial license](https://img.shields.io/badge/Commercial-license%20available-d2532b.svg)](COMMERCIAL.md)
[![Built with Claude](https://img.shields.io/badge/AI-Claude%20Sonnet%204.6-d2532b.svg)](https://anthropic.com)
[![Voice by Vapi](https://img.shields.io/badge/Voice-Vapi-2563eb.svg)](https://vapi.ai)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%C2%B7%20Django%20%C2%B7%20Postgres-black.svg)](#stack)

**🌐 Live demo:** [hearthline.codewithmuh.com](https://hearthline.codewithmuh.com) ·
**📺 Build along:** [@codewithmuh on YouTube](https://youtube.com/@codewithmuh) ·
**📅 [Book a setup call](https://calendly.com/contact-codewithmuh/30min)**

---

## Why Hearthline

Most "AI receptionist" SaaS costs $300+/month per location, ships you a
generic voice the vendor picked, and locks the call data inside their
platform. Hearthline flips all three:

| | Closed SaaS | Hearthline |
|---|---|---|
| **Receptionist persona** | Vendor's choice | Your name, voice, script, knowledge base |
| **AI cost** | Bundled markup | Your own API keys, you pay cents per call |
| **Data ownership** | Vendor's database | Your Postgres, your laptop or VPS |
| **Trades** | One vertical | 9 trades on day one, customizable knowledge base |
| **Languages** | Usually 1–2 | 10 dashboard languages incl. Arabic (RTL) |
| **Source** | Closed | AGPL-3.0, fork freely |

## What it does

Hearthline is the AI communication hub for HVAC, plumbing, windows, roofing,
solar, energy-renovation, electrical, garage, and pest-control businesses.
Every inbound call, SMS, WhatsApp, email, and chat lands on one timeline —
qualified, photo-quoted, and routed to the right tech without anyone picking
up the phone.

- **🎙️ Branded voice receptionist** — Configure name, persona, voice, and
  knowledge base per business. Customer hears YOUR shop answer the phone, 24/7.
- **🤖 Bring your own AI keys** — Per-business Anthropic / OpenAI / Vapi /
  Twilio keys, encrypted at rest. Swap LLM providers in the dashboard, pay
  the actual API cost (cents per call), no vendor markup.
- **💬 Multi-channel inbox** — Phone + SMS + WhatsApp + email + web chat on
  one timeline.
- **📸 Photo-first quoting** — Customer texts a photo → vision pipeline drafts
  a real PDF estimate in <60s with line items, tax, and total.
- **🌍 10 languages out of the box** — English, Spanish, German, French,
  Italian, Portuguese, Dutch, Chinese, Japanese, Arabic (RTL).
- **🚐 Tech dispatch** *(roadmap)* — Booked job auto-routes to the closest
  tech with GPS + ETA SMS.
- **💳 Payments + reviews** *(roadmap)* — Stripe deposit on quote acceptance,
  review request after job complete.

## Quick start (60 seconds, no API keys needed)

```bash
git clone https://github.com/codewithmuh/hearthline.git
cd hearthline
cp .env.example .env
docker compose up --build
```

You now have:
- `http://localhost:3000` — Next.js dashboard
- `http://localhost:8000/admin` — Django admin
- `http://localhost:8000/api` — REST API

Seed believable demo data and a default admin login:

```bash
docker compose exec backend python manage.py seed_demo --wipe
docker compose exec backend python manage.py seed_admin
# Default credentials: admin / hearthline (override with HEARTHLINE_ADMIN_PASSWORD)
```

Sign in at `http://localhost:3000/login`, then poke `/dashboard`. The marketing
site at `/` has no admin links — single **Sign in** entry point.

## Try the receptionist without any keys

The `/dashboard/test-call` page lets you chat with the receptionist the same
way Vapi will — a live POST to `/api/calls/vapi/chat/completions/` on every
turn, full agentic loop, real lead creation in your database.

Drop in your `ANTHROPIC_API_KEY` (or `OPENAI_API_KEY`) and the simulator
becomes a real conversation. Without keys, every external integration falls
back to a friendly stub so the dashboard still demos cleanly.

## Configure your business from the dashboard

Everything that matters lives in `/dashboard/settings`, not Django admin:

- **Business profile** — Name, phone, AI persona name, trade, timezone.
- **Knowledge base** — Pricing rules, FAQ, service area. The receptionist
  reads this on every call as system-prompt context.
- **Provider API keys** — Anthropic, OpenAI, Vapi, Twilio. Encrypted at rest
  with Fernet, masked in the UI, per-business with env-var fallback. Pick
  Anthropic or OpenAI as the LLM provider per business.
- **Channels** — Phone, SMS, WhatsApp, email, chat. Add, toggle, remove.

`HEARTHLINE_ADMIN_*` env vars only seed the first login user; everything
else is data-driven and editable in the UI.

## Stack

| Layer | Tech |
|------|------|
| Frontend | Next.js 15 + React 19 + TypeScript (App Router, server components) |
| Backend | Django 5 + DRF (5 apps · 8+ models · webhook handlers) |
| Database | Postgres 16 |
| Voice | Vapi (custom-LLM mode) + Twilio (SMS / fallback) |
| AI | Anthropic Claude Sonnet 4.6 (orchestration) + OpenAI GPT-4o (vision) |
| Local dev | Docker Compose (db + backend + frontend) — one command up |

## Architecture

```
┌─────────────────┐    ┌──────────────────────────────────────────┐
│ Caller (phone)  │───▶│ Vapi (STT + TTS, your phone number)       │
└─────────────────┘    └──────────────────┬────────────────────────┘
                                          │ POST /api/calls/vapi/chat/completions/
                                          │ (OpenAI-compatible, custom-LLM mode)
                                          ▼
                       ┌──────────────────────────────────────────┐
                       │ Django · Receptionist agent loop          │
                       │  Tools: qualify_lead · check_availability │
                       │         draft_quote · book_appointment    │
                       │         send_sms · send_email · end_call  │
                       │  LLM provider: Anthropic OR OpenAI        │
                       │  System prompt: per-business knowledge    │
                       └──────────────────┬────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────┐
                       │ Postgres                                  │
                       │  Business · Channel · Customer · Lead     │
                       │  Conversation · Message · Call · Quote    │
                       └──────────────────┬────────────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────────┐
                       │ Next.js dashboard (10 languages, RTL OK)  │
                       │  Overview · Leads · Calls · Quotes · ...  │
                       └──────────────────────────────────────────┘
```

## Wire real voice (Vapi)

1. Expose your local backend: `ngrok http 8000` → grab the HTTPS URL as `BASE`.
2. On [vapi.ai](https://vapi.ai), create an Assistant with **Custom LLM** mode:
   - Custom LLM URL: `{BASE}/api/calls/vapi/chat/completions/`
   - Model: `claude-sonnet-4-6`
   - First message: `Hi, this is <your-receptionist-name>. How can I help?`
   - Server URL Secret: paste your `VAPI_WEBHOOK_SECRET`
3. Set Server URL to `{BASE}/api/calls/webhooks/vapi/`.
4. Place a real call to your Vapi number. The receptionist answers, qualifies,
   books, hangs up cleanly. Refresh `/dashboard/leads` to see the new record.

Full setup guide also surfaces inside `/dashboard/settings` after you boot.

## Deploying

Two supported paths:

- **Path A — All on Vercel** (Next.js + Django serverless, Neon Postgres). Demo
  cost ~$5–15/mo. One push deploys both services.
- **Path B — Vercel frontend + Docker Compose VPS backend** with **Caddy**
  for auto-HTTPS. ~$10–25/mo, no cold starts, full Django admin with media.

```bash
# Path B, on a $6 VPS:
git clone https://github.com/codewithmuh/hearthline.git && cd hearthline
cp .env.example .env && nano .env
docker compose -f docker-compose.prod.yml up -d --build
```

Full step-by-step for both paths, env vars, and rotation guidance in
[DEPLOY.md](DEPLOY.md).

## Repo layout

```
hearthline/
├── docker-compose.yml          # local dev — 3 services, hot reload
├── docker-compose.prod.yml     # VPS production — gunicorn + Caddy
├── .env.example                # every var documented
├── frontend/                   # Next.js 15
│   └── app/
│       ├── (marketing)/        # /, /faq, /privacy, /terms, /docs
│       └── dashboard/          # /dashboard/{leads,calls,quotes,customers,settings,test-call}
└── backend/                    # Django 5
    └── apps/
        ├── core/               # Business, Channel, encrypted-key fields
        ├── leads/              # Customer, Lead, Conversation, Message
        ├── calls/              # Call + Vapi/Twilio handlers + agent loop
        │   ├── agent/          # prompts, tools, receptionist loop (Anthropic + OpenAI)
        │   ├── services/       # sms, email, scheduling, persistence
        │   └── tests/          # happy-path + auth-matrix tests
        ├── quotes/             # Quote, LineItem (editable + printable PDF)
        └── ai/                 # Photo → quote vision pipeline
```

## Configuration

All keys live in `.env` (template: `.env.example`). Production-required
secrets are documented inline with generate commands.

| Var | Purpose | Required for |
|-----|---------|--------------|
| `DJANGO_SECRET_KEY` | Standard Django session signing | Always (prod hard-fails on default) |
| `HEARTHLINE_ENCRYPTION_KEY` | Fernet key encrypting per-business API keys | Always in prod |
| `VAPI_WEBHOOK_SECRET` | Shared secret for Vapi webhook + custom-LLM auth | Anytime Vapi is wired |
| `ANTHROPIC_API_KEY` | Claude tool-use loop (env fallback) | Receptionist talking |
| `OPENAI_API_KEY` | Vision quoting + optional LLM provider (env fallback) | Photo→quote |
| `VAPI_API_KEY` + `VAPI_PHONE_NUMBER_ID` | Inbound voice | Real phone calls |
| `TWILIO_*` | SMS confirmations | Outbound SMS |
| `POSTGRES_*` / `DATABASE_URL` | Database | Always |

Per-business keys saved through `/dashboard/settings` override the env-var
fallbacks — so each business runs on their own AI usage account.

## Roadmap

**Shipped**
- ✅ Per-business AI/voice keys with Fernet encryption
- ✅ Receptionist agent loop (Anthropic + OpenAI providers, 7 tools)
- ✅ OpenAI Vision pipeline → drafted quote with line items, tax, total
- ✅ Next.js dashboard: Overview, Leads, Calls, Quotes (editable + PDF), Customers, Settings, Test simulator
- ✅ 10 dashboard languages incl. RTL Arabic
- ✅ Lead-detail conversation timeline + extracted_fields inspector
- ✅ `seed_demo` + `seed_admin` management commands
- ✅ Docker Compose 3-service stack with hot-reload
- ✅ Production hardening: ratelimit on custom-LLM, hard-fail boot guards, signed webhook verification

**In progress**
- 🔨 Stripe checkout for deposit collection on quote acceptance
- 🔨 Outbound SMS / WhatsApp via Twilio for quote delivery
- 🔨 Multi-tenant auth (today: single business per deployment, no shared cluster)

**Open issues — good first PRs**
- ⭕ Subsidy lookup integration (solar / energy renovation)
- ⭕ Tech dispatch + GPS routing for booked jobs
- ⭕ Review request automation (Google + Trustpilot webhooks)
- ⭕ Eval harness for the receptionist prompt
- ⭕ Server-side PDF rendering (replacing the browser-print path)

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.
Small, focused PRs merge fast.

## License

Hearthline is dual-licensed:

- **[AGPL-3.0](LICENSE)** for self-hosting, learning, and internal use. If you
  modify Hearthline and run it as a network service, your modifications must
  be released under AGPL-3.0 too.
- **[Commercial license](COMMERCIAL.md)** for white-labeling, reselling,
  embedding in closed-source products, or done-for-you deployment. Email
  **codewithmuh@gmail.com** or [book a call](https://calendly.com/contact-codewithmuh/30min).

---

Built in public by **[@codewithmuh](https://youtube.com/@codewithmuh)** —
AI build-along videos for developers shipping real agents. Hire me to deploy
Hearthline for your business: [Book a 30-min call](https://calendly.com/contact-codewithmuh/30min).
