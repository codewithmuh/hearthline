# Contributing to Hearthline

Thanks for thinking about contributing! This is a small project run in public — pull requests, issues, and discussion are all welcome.

## Ground rules

- **Be kind.** Trade businesses are real people running real companies. Code with that in mind.
- **Small PRs > big PRs.** One concern per PR. We'll merge fast if it's tight.
- **No "AI slop" PRs.** Use AI to help draft code — but read every line yourself before opening the PR.

## Local setup

```bash
git clone https://github.com/codewithmuh/hearthline.git
cd hearthline
cp .env.example .env
docker compose up --build
```

You should now have:
- `http://localhost:3000` — Next.js dashboard
- `http://localhost:8000/admin` — Django admin
- `http://localhost:8000/api` — REST API

Seed demo data:
```bash
docker compose exec backend python manage.py seed_demo --wipe
```

## What we're looking for

**Easy wins (good first issue):**
- Improve copy / accessibility / mobile responsiveness on the dashboard
- Add more unit tests for `apps/calls/agent/`
- Improve the seed data — more realistic transcripts, more variety
- Translate Anna's prompt for non-English markets

**Medium:**
- Stripe deposit on quote acceptance
- Outbound SMS / WhatsApp via Twilio
- PDF rendering server-side (replacing the browser print path)
- Real Google Calendar integration in `services/scheduling.py`

**Big (talk to us first):**
- Multi-tenant auth + per-business data isolation
- Eval harness for the Anna prompt
- Photo-quote vision pipeline accuracy improvements

## PR checklist

- [ ] One concern per PR
- [ ] `docker compose up` still works
- [ ] No new env vars without updating `.env.example`
- [ ] No secrets, no API keys, no `.env` committed
- [ ] If you touched the dashboard, hit the page in a browser before pushing
- [ ] Linked the issue (or opened one if it didn't exist)

## Code style

- **Backend (Python):** PEP 8, type hints encouraged, no unused imports
- **Frontend (TypeScript):** Strict types, no `any` unless commented why, server components by default
- **CSS:** Plain `globals.css` — keep new styles co-located with the section they belong to
- **Comments:** Only when the *why* is non-obvious. The *what* is the code.

## Filing a bug

Open an issue with:
1. What you expected
2. What happened
3. Reproduction steps (or a failing test)
4. `docker compose ps` + `docker compose logs --tail 50` if it's a runtime issue

## Reaching out

- **Issues:** [github.com/codewithmuh/hearthline/issues](https://github.com/codewithmuh/hearthline/issues)
- **Discussions:** for design + roadmap conversations
- **Setup help / consulting:** [Book a call](https://calendly.com/contact-codewithmuh/30min)

By contributing, you agree that your contributions will be licensed under the MIT License.
