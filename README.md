# Hearthline

> **The open-source AI front desk for home-service teams.**
> Inbound calls, SMS, photo quotes, dispatch, deposits — automated 24/7.
> Self-hostable. MIT-licensed. Built in public.

[![License: MIT](https://img.shields.io/badge/License-MIT-black.svg)](LICENSE)
[![Built with Claude](https://img.shields.io/badge/AI-Claude%20Sonnet%204.6-d2532b.svg)](https://anthropic.com)
[![Voice by Vapi](https://img.shields.io/badge/Voice-Vapi-2563eb.svg)](https://vapi.ai)
[![Stack](https://img.shields.io/badge/Stack-Next.js%20%C2%B7%20Django%20%C2%B7%20Postgres-black.svg)](#stack)

**🌐 Live demo:** [hearthline.codewithmuh.com](https://hearthline.codewithmuh.com) ·
**📺 Build along:** [@codewithmuh on YouTube](https://youtube.com/@codewithmuh) ·
**📅 [Book a setup call](https://calendly.com/contact-codewithmuh/30min)**

---

## What it does

Hearthline is the AI communication hub for HVAC, plumbing, roofing, solar, and energy-renovation businesses. Every inbound call, SMS, WhatsApp, email, and chat lands on one timeline — qualified, photo-quoted, and routed to the right tech without anyone picking up the phone.

- **🎙️ Voice receptionist** — Vapi answers every call 24/7, qualifies the lead, books the slot
- **💬 Multi-channel** — Phone + SMS + WhatsApp + email + web chat on one inbox
- **📸 Photo-first quoting** — Customer texts a photo → vision pipeline drafts a real PDF estimate in <60s
- **🚐 Tech dispatch** — Booked job auto-routes to the closest tech with GPS + ETA SMS
- **💳 Payments + reviews** — Stripe deposit on quote acceptance · review request after job complete
- **🌍 Subsidy matching** — For solar / energy-renovation, checks rebate eligibility and bundles into quote

## Stack

| Layer | Tech | Why |
|------|------|-----|
| Frontend | Next.js 15 + React 19 + TypeScript | Server components, App Router |
| Backend | Django 5 + DRF | 5 apps · 8 models · webhook handlers |
| Database | Postgres 16 | Single docker volume |
| Voice | Vapi (primary) + Twilio (SMS / fallback) | Vapi handles STT+TTS, calls our custom-LLM endpoint |
| AI | Anthropic Claude Sonnet 4.6 + OpenAI GPT-4o vision | Claude for orchestration, OpenAI for vision quoting |
| Local dev | Docker Compose (db + backend + frontend) | One command up |

## Architecture

```
┌─────────────────┐    ┌──────────────────────────────────────┐
│ Caller (phone)  │───▶│ Vapi (STT + TTS)                     │
└─────────────────┘    └──────────────────┬───────────────────┘
                                          │ POST /api/calls/vapi/chat/completions/
                                          ▼
                       ┌──────────────────────────────────────┐
                       │ Django · Anna agent (Claude + tools) │
                       │  · qualify_lead   · book_appointment │
                       │  · check_avail    · send_sms         │
                       │  · end_call                          │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │ Postgres                             │
                       │  Lead · Customer · Conversation · Quote │
                       └──────────────────┬───────────────────┘
                                          │
                                          ▼
                       ┌──────────────────────────────────────┐
                       │ Next.js dashboard                    │
                       │  /dashboard · /quotes · /leads · /calls │
                       └──────────────────────────────────────┘
```

## Quick start (60 seconds)

```bash
# 1 — clone
git clone https://github.com/codewithmuh/hearthline.git
cd hearthline

# 2 — copy the env template (works without API keys for the dashboard)
cp .env.example .env

# 3 — bring it up
docker compose up --build

# you now have:
#   http://localhost:3000        Next.js dashboard
#   http://localhost:8000/admin  Django admin
#   http://localhost:8000/api    REST API
```

Seed the dashboard with believable demo data:

```bash
docker compose exec backend python manage.py seed_demo --wipe
```

## Deploying

Same stack [codewithmuh.com](https://codewithmuh.com) runs on:

- **Frontend → Vercel** (free tier, auto-deploys from GitHub)
- **Backend (Django + Postgres) → Docker Compose on a small VPS** with **Caddy** out front for auto-HTTPS

`docker-compose.prod.yml` + `Caddyfile` ship in the repo. Total cost for a single demo lands around **$10–25/mo**. Full step-by-step in [DEPLOY.md](DEPLOY.md).

```bash
# on a $6 VPS — backend + Postgres + Caddy:
git clone https://github.com/codewithmuh/hearthline.git && cd hearthline
cp .env.example .env && nano .env
docker compose -f docker-compose.prod.yml up -d --build
```

```bash
# on your laptop — push, then import on vercel.com/new (root dir = frontend/):
gh repo create codewithmuh/hearthline --public --source=. --push
```

## Wire real voice (Vapi)

1. Expose your local backend: `ngrok http 8000` → grab the HTTPS URL as `BASE`
2. On [vapi.ai](https://vapi.ai), create an Assistant with **Custom LLM** mode
   - Custom LLM URL: `{BASE}/api/calls/vapi/chat/completions/`
   - Model: `claude-sonnet-4-6`
   - First message: `Hi, this is Anna. How can I help you today?`
3. Set Server URL to `{BASE}/api/calls/webhooks/vapi/`
4. Place a real call to your Vapi number — Anna answers, qualifies, books, hangs up. Refresh `/dashboard/leads` to see the new record.

Full setup guide on the [`/dashboard/settings`](http://localhost:3000/dashboard/settings) page after you boot.

## Repo layout

```
hearthline/
├── docker-compose.yml
├── .env.example
├── frontend/                  # Next.js 15
│   └── app/
│       ├── (marketing)/       # /, /faq, /privacy, /terms, /docs
│       └── dashboard/         # /dashboard/{leads,calls,quotes,customers,settings,test-call}
└── backend/                   # Django 5
    └── apps/
        ├── core/              # Business, Channel
        ├── leads/             # Customer, Lead, Conversation, Message
        ├── calls/             # Call + Vapi/Twilio handlers + agent loop
        │   ├── agent/         # prompts, tools, receptionist (Claude + tool-use loop)
        │   └── services/      # sms, scheduling, persistence
        ├── quotes/            # Quote, LineItem (editable + printable PDF)
        └── ai/                # Photo → quote vision pipeline
```

## Configuration

All keys live in `.env` (template: `.env.example`):

| Var | Purpose | Required for |
|-----|---------|--------------|
| `ANTHROPIC_API_KEY` | Claude tool-use loop | Anna talking |
| `OPENAI_API_KEY` | GPT-4o vision quoting | Photo → quote |
| `VAPI_API_KEY` + `VAPI_PHONE_NUMBER_ID` | Inbound voice | Real phone calls |
| `TWILIO_ACCOUNT_SID` + `TWILIO_AUTH_TOKEN` + `TWILIO_FROM_NUMBER` | SMS confirmations | Outbound SMS |
| `POSTGRES_*` | Database | Always |

Without keys, every external integration falls back to a stub so the dashboard still demos cleanly.

## Try it without any keys

The Test Anna page (`/dashboard/test-call`) lets you chat with Anna the same way Vapi will — a live POST to `/api/calls/vapi/chat/completions/` on every turn, full agentic loop, real lead creation in your database. Drop in your `ANTHROPIC_API_KEY` and Anna becomes a real conversation.

## Roadmap

**Shipped**
- ✅ Django data model (Business, Channel, Customer, Lead, Conversation, Message, Call, Quote, LineItem)
- ✅ Vapi custom-LLM endpoint with structured-JSON Claude tool loop
- ✅ OpenAI Vision pipeline → drafted quote with line items, tax, total
- ✅ Next.js dashboard: Overview, Leads, Calls, Quotes (editable + PDF), Customers, Settings, Test Anna
- ✅ Lead-detail conversation timeline + extracted_fields inspector
- ✅ `seed_demo` management command for instant believable data
- ✅ Docker Compose 3-service stack with hot-reload

**In progress**
- 🔨 Stripe checkout for deposit collection on quote acceptance
- 🔨 Outbound SMS / WhatsApp via Twilio for quote delivery
- 🔨 Multi-tenant auth (today: single business, no login)

**Open issues**
- ⭕ Subsidy lookup integration (solar / energy renovation)
- ⭕ Tech dispatch + GPS routing for booked jobs
- ⭕ Review request automation (Google + Trustpilot webhooks)
- ⭕ Eval harness for the Claude extraction prompt

## Contributing

Pull requests welcome. See [CONTRIBUTING.md](CONTRIBUTING.md) for the workflow.

## License

[MIT](LICENSE) — fork it, deploy it, sell it under your own brand. No attribution required (but appreciated).

---

Built in public by **[@codewithmuh](https://youtube.com/@codewithmuh)** — AI build-along videos for developers shipping real agents. Hire me to deploy Hearthline for your business: [Book a 30-min call](https://calendly.com/contact-codewithmuh/30min).
