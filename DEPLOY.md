# Deploying Hearthline

Same pattern as the [codewithmuh.com](https://codewithmuh.com) stack:

- **Frontend (Next.js) → Vercel** — auto-deploys from GitHub
- **Backend (Django + Postgres) → Docker Compose on a VPS** — Caddy out front for auto-HTTPS

Total cost for a single demo: **~$6–10/mo VPS + Vercel free tier + Vapi $2/mo + per-minute talk**.

---

## 1. Backend — VPS + Docker Compose + Caddy

### a. Spin up a tiny VPS

Anything works:

| Provider | Cheapest option |
|----------|-----------------|
| Hetzner | CX22 — €4.50/mo |
| DigitalOcean | $6/mo droplet |
| OVH | VPS Starter |
| your existing Docker host | free |

Ubuntu 22.04 / 24.04. SSH in.

### b. Install Docker + Docker Compose

```bash
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
newgrp docker
```

### c. Clone + configure

```bash
git clone https://github.com/codewithmuh/hearthline.git
cd hearthline
cp .env.example .env
nano .env     # fill in the prod values (see below)
```

Minimum `.env` for production:

```bash
POSTGRES_DB=hearthline
POSTGRES_USER=hearthline
POSTGRES_PASSWORD=$(openssl rand -base64 32)   # generate one
DJANGO_SECRET_KEY=$(openssl rand -base64 50)   # generate one
DJANGO_DEBUG=0

API_DOMAIN=api.hearthline.codewithmuh.com
FRONTEND_ORIGIN=https://hearthline.codewithmuh.com
DJANGO_ALLOWED_HOSTS=api.hearthline.codewithmuh.com
DJANGO_CORS_ALLOWED_ORIGINS=https://hearthline.codewithmuh.com

ANTHROPIC_API_KEY=...
OPENAI_API_KEY=...
VAPI_API_KEY=...
TWILIO_ACCOUNT_SID=...
TWILIO_AUTH_TOKEN=...
TWILIO_FROM_NUMBER=+1...
```

### d. Point DNS

Add an A record:

```
api.hearthline.codewithmuh.com  →  <your-vps-ip>
```

### e. Boot the stack

```bash
docker compose -f docker-compose.prod.yml up -d --build
```

Caddy automatically issues a Let's Encrypt cert on first request. Within 30 seconds:

```bash
curl https://api.hearthline.codewithmuh.com/api/health/
# {"status": "ok", "service": "hearthline"}
```

### f. Seed demo data + admin user

```bash
docker compose -f docker-compose.prod.yml exec backend python manage.py seed_demo --wipe
docker compose -f docker-compose.prod.yml exec backend python manage.py createsuperuser
```

Django admin lives at `https://api.hearthline.codewithmuh.com/admin/`.

---

## 2. Frontend — Vercel

### a. Push the repo to GitHub

```bash
gh repo create codewithmuh/hearthline --public --source=. --remote=origin --push
```

### b. Import on Vercel

1. Go to [vercel.com/new](https://vercel.com/new) → Import the repo
2. **Root Directory:** `frontend`
3. Vercel auto-detects Next.js, no build override needed

### c. Environment variables

```
INTERNAL_API_URL    = https://api.hearthline.codewithmuh.com/api
NEXT_PUBLIC_API_URL = https://api.hearthline.codewithmuh.com/api
```

`INTERNAL_API_URL` is what server components use; `NEXT_PUBLIC_API_URL` is what the browser uses. Both point to the same Caddy domain in production.

### d. Custom domain

Add `hearthline.codewithmuh.com` (or whatever subdomain you want) on Vercel → Domains. Vercel issues a CNAME you add at your DNS provider.

### e. Push to deploy

Every push to `main` triggers a Vercel build. ~30s deploys.

---

## 3. Wire Vapi to the live backend

On your Vapi Assistant (model = Custom LLM):

| Field | Value |
|------|-------|
| Custom LLM URL | `https://api.hearthline.codewithmuh.com/api/calls/vapi/chat/completions/` |
| Model | `claude-sonnet-4-6` |
| First message | `Hi, this is Anna at Rolling Shutters. How can I help?` |
| Server URL | `https://api.hearthline.codewithmuh.com/api/calls/webhooks/vapi/` |

Buy a phone number in Vapi → attach the assistant → place a real call. Anna answers, runs `qualify_lead` + `book_appointment`, the call lands in `/dashboard/calls` seconds after hangup.

---

## 4. Updating

```bash
# on the VPS:
cd hearthline
git pull
docker compose -f docker-compose.prod.yml up -d --build
```

Migrations run automatically on container start (the Dockerfile.prod CMD wraps `python manage.py migrate --noinput`).

Frontend updates: just push to `main`, Vercel ships.

---

## 5. Watch + maintain

```bash
# tail backend logs
docker compose -f docker-compose.prod.yml logs -f backend

# tail Caddy access log
docker compose -f docker-compose.prod.yml logs -f caddy

# database shell
docker compose -f docker-compose.prod.yml exec db psql -U hearthline

# free disk
docker system prune -f
```

Backup the Postgres volume nightly:

```bash
# add to root crontab:
0 3 * * * docker compose -f /root/hearthline/docker-compose.prod.yml exec -T db \
  pg_dump -U hearthline hearthline | gzip > /root/backups/$(date +\%F).sql.gz
```

---

## 6. Cost ballpark

| Line item | Cost |
|-----------|------|
| Hetzner CX22 VPS (or equivalent) | €4.50–6/mo |
| Vercel Hobby (frontend) | $0 |
| Vapi phone number | ~$2/mo |
| Vapi talk usage | ~$0.07/min |
| Twilio SMS | ~$0.0079/message |
| Anthropic Claude Sonnet 4.6 | usage-based |
| OpenAI GPT-4o vision | usage-based |
| **Demo monthly total** | **~$10–25/mo** |

---

## 7. Troubleshooting

**Vercel says "Backend unreachable"**
→ `INTERNAL_API_URL` and `NEXT_PUBLIC_API_URL` on Vercel must point to your Caddy domain over HTTPS. Re-deploy after changing.

**Caddy says "no certificate available"**
→ DNS A record hasn't propagated yet. `dig api.hearthline.codewithmuh.com` on the VPS — should return its public IP. Wait, then `docker compose -f docker-compose.prod.yml restart caddy`.

**Anna sounds robotic / says "I'd love to help, but my AI brain isn't connected"**
→ `ANTHROPIC_API_KEY` not in `.env`, or model access not granted. Set it, then `docker compose -f docker-compose.prod.yml restart backend`.

**Migration errors on first up**
→ `docker compose -f docker-compose.prod.yml exec backend python manage.py migrate` and read the error. Usually a missing env var.

**Vapi webhook 502s**
→ Caddy's `request_body` cap might be too tight. Bump it in `Caddyfile` and reload Caddy. We default to 8MB which fits long transcripts.

---

## 8. Going further

- **Per-business deploys:** copy this stack onto a fresh VPS per customer with their own `.env` and DNS subdomain. Costs ~$10–20/mo per tenant.
- **Multi-tenant SaaS:** add row-level filtering on `business_id` everywhere + auth (NextAuth.js or django-allauth) + Stripe billing. Out of scope for the OSS today.
- **Self-host on your own laptop:** the dev `docker-compose.yml` already works. Add `ngrok http 8000` and Vapi can hit your laptop directly for development.

Questions? Open an issue or [book a call](https://calendly.com/contact-codewithmuh/30min).
