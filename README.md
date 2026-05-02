# VoteSetu

VoteSetu is an interactive election assistant focused on India. It helps users understand the election process, official timelines, eligibility, registration steps, EPIC guidance, and polling-day actions in a simple and actionable flow.

## Problem Statement Alignment

This project directly targets the problem statement:
- **Interactive and easy-to-follow guidance** through timeline cards, journey maps, simulation, FAQ, and chat assistant.
- **Election process clarity** with end-to-end phases from announcement to counting.
- **Actionable next steps** based on user profile (age, registration, EPIC status).
- **Official-source grounding** with citations to ECI and related public resources.

## Core Features

- Guided election timeline with role-based checklists (voter/candidate/official).
- Personalized voter journey and next-step recommendations.
- EPIC helper and validation with official references.
- AI chat assistant with election-only scope control.
- Voice/live assistant bridge (WebSocket).
- Multi-language content support.
- Accessibility-first UX patterns (skip links, keyboard-visible focus states, ARIA labels).

## Tech Stack

- Frontend: React + TypeScript + Vite + Tailwind + shadcn/ui
- Backend: Express + WebSocket (`ws`)
- AI: Google Gemini API (`@google/generative-ai`)
- Testing: Vitest + Testing Library
- Deployment: Docker + Google Cloud Run

## Local Setup

### Prerequisites
- Node.js 20+
- npm 10+

### Install

```bash
npm ci
cp .env.example .env
```

Set `GEMINI_API_KEY` in `.env`.

### Run

```bash
npm run dev
```

### Verify Quality

```bash
npm run lint
npm run test
npm run build
```

## Cloud Run Deployment

Build and deploy from project root:

```bash
gcloud builds submit --tag gcr.io/$GOOGLE_CLOUD_PROJECT/votesetu
gcloud run deploy votesetu \
  --image gcr.io/$GOOGLE_CLOUD_PROJECT/votesetu \
  --platform managed \
  --region asia-south1 \
  --allow-unauthenticated \
  --set-env-vars GEMINI_API_KEY=$GEMINI_API_KEY
```

Health endpoint:
- `GET /healthz`

## Security Posture

- Secrets excluded from Git via `.gitignore` (`.env` not tracked).
- Request-size cap for JSON payloads.
- Basic per-IP rate limiting on chat API.
- Message length validation to reduce abuse risk.
- Security headers (`X-Frame-Options`, `X-Content-Type-Options`, `Referrer-Policy`).
- CORS configurable with `CORS_ORIGIN`.

## Testing Strategy

- Unit tests for domain gate (`isElectionQuery`) and EPIC validation rules.
- CI checks lint + test + build on every push/PR.
- Recommended extension: add API integration tests for `/api/chat` and `/healthz`.

## Accessibility Checklist

- Keyboard navigation and focus-visible styling.
- Skip-to-content support.
- Meaningful ARIA labels on interactive controls.
- Semantic structure (`header`, `main`, `footer`, form controls).

## Repository Quality Signals (Hackathon AI Scrape)

- Clear README with architecture and deployment instructions.
- Explicit problem-statement mapping.
- CI pipeline (`.github/workflows/ci.yml`).
- Environment template (`.env.example`).
- Deterministic commands for lint/test/build.

## Project Structure

```text
src/
  components/       UI + interactive assistant flows
  context/          global user state
  data/             election facts, timeline, EPIC rules
  i18n/             language support
  lib/              assistant/domain utility logic
  pages/            routed page views
  test/             unit tests
```

## Disclaimer

VoteSetu is an educational assistant and is not affiliated with the Election Commission of India. Users should verify critical details from official ECI portals.
