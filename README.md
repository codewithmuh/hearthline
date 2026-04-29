# Hearthline

> The 24/7 AI front-desk for home-service teams.

Hearthline is the AI communication hub for HVAC, plumbing, roofing, solar, and energy-renovation businesses. Every inbound call, SMS, WhatsApp, email, and chat lands on one timeline — qualified, photo-quoted, and routed to the right tech without anyone picking up the phone.

## What makes Hearthline different

- **Photo-first quoting.** Customers text a photo of the broken AC unit / damaged roof / window opening. Hearthline's vision pipeline measures, classifies, and drafts a real PDF estimate in under 60 seconds — no measurement visit needed for the first pass.
- **Multi-channel from day one.** Phone (Vapi + Twilio), SMS, WhatsApp, email, and web chat all land on the same lead record. No "phone-only" version of the product.
- **Field-tech dispatch built in.** Once a deal is won, Hearthline assigns the closest tech, creates a calendar event, sends GPS directions, and pings the customer with the ETA.
- **Payments + reviews automated.** Stripe deposit collected at quote acceptance. Job-complete webhook fires a review request to Google + Trustpilot.
- **Subsidy matching.** For solar / energy-renovation projects, Hearthline checks customer eligibility for local rebates and bundles the answer into the quote.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 15 (App Router, TypeScript) |
| Backend | Django 5 + DRF |
| Database | PostgreSQL 16 |
| Voice | Vapi (primary) + Twilio (SMS / fallback voice) |
| LLM | Anthropic Claude (Sonnet) for orchestration, OpenAI for vision when needed |
| Local dev | Docker Compose (`db`, `backend`, `frontend`) |

## Quick start

```bash
cp .env.example .env
# fill in your ANTHROPIC_API_KEY, OPENAI_API_KEY, VAPI_*, TWILIO_*

docker compose up --build
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:8000/api/
- Django admin: http://localhost:8000/admin/

The backend container runs migrations automatically on startup. To create a superuser:

```bash
docker compose exec backend python manage.py createsuperuser
```

## Repo layout

```
hearthline/
├── docker-compose.yml
├── .env.example
├── frontend/        # Next.js — marketing landing + business dashboard
└── backend/         # Django — REST API + Vapi/Twilio webhooks + AI pipeline
    └── apps/
        ├── core/     # Business, User, Channel
        ├── leads/    # Lead, Customer, Conversation
        ├── calls/    # Call records, Vapi/Twilio webhook handlers
        ├── quotes/   # Quote, LineItem, PDF generator
        └── ai/       # Claude/OpenAI service layer (extraction, vision, drafting)
```
