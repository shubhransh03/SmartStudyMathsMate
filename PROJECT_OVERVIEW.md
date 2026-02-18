# SmartStudy MathsMate — Project Overview

## Title of the Project
SmartStudy MathsMate: An Interactive, Multi‑Provider AI Learning Assistant for Class 10 Mathematics

## Abstract
SmartStudy MathsMate is a math‑first learning web application designed to help Class 10 students learn faster with clearer explanations, interactive practice, and step‑by‑step solutions. The system combines a modern React + TypeScript + Tailwind frontend with an Express backend that can route requests across multiple AI providers (Gemini as primary; OpenAI and Ollama as optional alternatives) and local rule‑based solvers for certain problems. To ensure reliability in real‑world usage, the backend implements an in‑memory cache, per‑topic cooldown/backoff for 429/503 provider responses, and a structured error shape with retry hints. Students can now also explicitly choose which provider powers an explanation or solution using a simple query parameter, or they can leave it in auto mode for an intelligent fallback cascade. The approach prioritizes accessibility (local fallbacks), resilience (cooldowns, cached explanations), and clarity (Class‑10‑friendly style with LaTeX where relevant), delivering a practical, extensible foundation for a math learning companion.

An interactive, math‑first learning app focused on Class 10 mathematics. It combines a modern React UI with an Express backend and multiple AI providers to deliver simple explanations and step‑by‑step solutions.

## What this document covers
- High‑level architecture (frontend + backend)
- Project layout and key files
- AI provider system (auto + manual selection)
- API endpoints and responses
- Environment variables and configuration
- Running locally (frontend + backend)
- Caching, backoff, and error handling
- Current state vs. near‑term improvements

---

## Overview of the Project
SmartStudy MathsMate offers:
- Topic explanations written simply for Class 10 students
- Step‑by‑step solutions with formulas and reasoning
- A topic grid and subject navigation optimized for Mathematics
- A robust AI provider system with both auto fallback and explicit provider selection (`auto|gemini|openai|ollama|local`)
- Local rule‑based solvers for specific tasks (e.g., terminating decimal expansion checks) to provide answers without cloud APIs

Pedagogically, the app aims to reduce cognitive load by providing succinct explanations, examples, and consistent visual language. Technically, it focuses on resilience (cooldowns/backoff) and adaptability (multiple providers, validated Gemini model at startup).

---

## Architecture at a glance
- Frontend: React 18 + TypeScript + Vite + Tailwind CSS
- Backend: Node.js (Express) + `node-fetch`
- AI Providers:
  - Gemini (primary)
  - OpenAI (optional fallback for explanations)
  - Ollama (optional local provider)
  - Local rule‑based solvers for some math prompts
- Resilience: In‑memory cache, per‑topic cooldown/backoff, structured 429/503 responses

```
Browser (Vite React)  <——>  Express server (Node)
                              ├─ Gemini (primary)
                              ├─ OpenAI (optional fallback)
                              ├─ Ollama (optional local)
                              └─ Local rule-based solvers
```

### Expanded block diagram

```
┌──────────────────────────────────────────────────────────────────────┐
│                              Frontend (Vite React)                   │
│  - Routes: Home, Subject, MathTopic, Practice, Tips, Progress        │
│  - UI: Tailwind components, LaTeX rendering                          │
│  - Calls: /api/explain, /api/solve (+ ?provider=auto|gemini|...)      │
└───────────────▲──────────────────────────────────────────────────────┘
        │ HTTP/JSON
        │
┌───────────────┴──────────────────────────────────────────────────────┐
│                            Backend (Express)                          │
│  - Provider selection: auto or explicit                               │
│  - Caching: per-topic (30 min)                                        │
│  - Backoff: per-topic cooldown on 429/503                             │
│  - validateGeminiModel at startup                                     │
│  - tryLocalSolve for specific prompts                                 │
└───────┬───────────────┬───────────────────────┬──────────────────────┘
    │               │                       │
    │               │                       │
  ┌─────▼─────┐   ┌─────▼─────┐           ┌─────▼─────┐
  │  Gemini   │   │  OpenAI   │           │  Ollama   │
  │ (primary) │   │ (optional)│           │ (optional)│
  └───────────┘   └───────────┘           └───────────┘
        ▲                                   
        │
         Local rule-based solvers (no network)
```

---

## Repository structure (relevant)
```
eslint.config.js
index.html
package.json            # frontend package.json with vite scripts
postcss.config.js
README.md               # quick intro
tailwind.config.js
vite.config.ts

server/
  package.json          # backend package.json (start/dev scripts)
  server.js             # Express server and AI endpoints

src/
  App.tsx               # routes wiring
  index.css, main.tsx
  components/
    Navbar.tsx, Footer.tsx
  pages/
    Home.tsx, Subject.tsx, TipsAndTricks.tsx
    (MathTopic.tsx, Progress.tsx, Practice.tsx are referenced in App routes)
```

---

## Frontend (React + Vite)
- Routes (see `src/App.tsx`):
  - `/` Home
  - `/subject/:subjectName` Subject landing (e.g., maths)
  - `/subject/maths/:topicSlug` Math topic page (detail)
  - `/tips` Tips & Tricks
  - `/progress` Progress tracking (route present)
  - `/practice` Practice (route present)
- UI:
  - `Navbar.tsx` with responsive menu
  - `Footer.tsx` with gradient, subtle animations, and social placeholders
  - `Home.tsx` marketing‑style sections and CTA
  - `Subject.tsx` topic listing and fetch for explanations
- Styling: TailwindCSS via Vite pipeline

Note: Provider selection UI on the frontend is a planned improvement. Backend support already exists; see the Provider Selection section.

---

## Methodology
This project follows a “math‑first, reliability‑first” methodology:

1) Problem framing and UX
- Scope the audience (Class 10) and ensure explanations are short, clear, and example‑driven.
- Keep interaction costs low (single‑click explanations and solver inputs).

2) Multi‑provider strategy
- Primary: Gemini for both explanations and solver.
- Fallbacks: OpenAI (explanations and solver on explicit request) and Ollama (local model) to maintain continuity during provider outages.
- Local rule‑based solvers answer common checks without network calls.

3) Resilience and consistency
- Per‑topic caching (~30 minutes) prevents repeated calls and stabilizes UI.
- Per‑topic cooldown/backoff avoids rapid retries on 429/503 and communicates `retryAfterSeconds` to the UI.
- Structured response shapes: always include `provider` and sometimes `requestedProvider`.

4) Implementation patterns
- Startup validation: `validateGeminiModel()` lists available models and auto‑resolves a compatible name (e.g., prefer `flash`).
- Provider selection contract: `?provider=auto|gemini|openai|ollama|local` on both endpoints.
- Auto mode cascade: try Gemini → OpenAI (if configured) → Ollama → local.

5) Verification
- Manual tests via curl for each provider option.
- Local solver sanity tests (terminating decimal expansion prompt family).
- Lightweight end‑to‑end checks from the UI pages.

### Minimal provider‑selection flow (pseudo)
```
requested = query.provider || 'auto'
if requested == 'local':
  return localResult()
if requested == 'gemini':
  return callGemini()
if requested == 'openai':
  return callOpenAI()
if requested == 'ollama':
  return callOllama()

# auto
try callGemini()
catch 429/503:
  backoff(topic)
  try openai; else try ollama; else local
catch other:
  try openai; else try ollama; else local
```

---

## Backend (Express)
File: `server/server.js`

### Key helpers
- `callGemini(promptText)` — primary provider call
- `callOpenAIChat(system, user)` — OpenAI chat fallback (explanations + solver when explicitly requested)
- `callOllama(promptText)` — local model call (if configured)
- `validateGeminiModel()` — runs at startup, verifies model list and auto‑resolves a working model name when needed
- `parseRetryAfterSeconds(resp, body)` — parses Retry‑After from headers/body
- `localExplain(subject, topic)` — friendly placeholder/fallback text
- `tryLocalSolve(prompt)` — small rule‑based solvers for some math prompts (e.g., “terminating decimal expansion” checks)

### Caching & backoff
- In‑memory cache: 30‑minute TTL per subject/topic
- Per‑topic backoff map: after Gemini returns 429/503, subsequent requests are cooled down with a server‑side timer; UI can surface `retryAfterSeconds`

---

## Provider selection (auto or explicit)
Backend supports an explicit provider choice via `?provider=` on both endpoints. Allowed values:
- `auto` (default): Gemini → OpenAI (if configured) → Ollama → local
- `gemini`
- `openai`
- `ollama`
- `local`

The JSON response includes two fields:
- `provider`: the provider actually used
- `requestedProvider`: what the client asked for (present when applicable)

You can also force Gemini evaluation via `?force=gemini` on the explanation endpoint to skip cooldown logic.

### Sequence (auto mode)
```
Client → /api/explain?provider=auto
  Server tries Gemini
    ├─ success → return {provider:'gemini'}
    └─ 429/503 → set backoff → try OpenAI → try Ollama → else local
```

---

## API endpoints

### GET `/api/explain/:subject/:topic`
Returns a concise explanation suitable for Class 10 students.

Query params:
- `provider` = `auto|gemini|openai|ollama|local` (default: `auto`)
- `force=gemini` — bypass backoff for this call (not recommended during active cooldowns)

Success (example):
```json
{
  "explanation": "...",
  "cached": true,
  "provider": "gemini",
  "requestedProvider": "auto"
}
```

Rate‑limited/overloaded fallback:
```json
{
  "explanation": "Local or alternate fallback text...",
  "cached": false,
  "provider": "local",
  "requestedProvider": "auto",
  "rateLimited": true,
  "retryAfterSeconds": 45
}
```

No Gemini key and `provider=gemini`:
```json
{
  "explanation": "This is a placeholder explanation... Configure your Gemini API key...",
  "cached": false,
  "provider": "local",
  "requestedProvider": "gemini"
}
```

Example calls:
```bash
# Auto (default): Gemini → OpenAI → Ollama → local
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=auto"

# Explicit providers
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=gemini"
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=openai"
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=ollama"
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=local"
```

### POST `/api/solve`
Body:
```json
{ "prompt": "Check whether 13/3125 has a terminating decimal expansion" }
```

Query params:
- `provider` = `auto|gemini|openai|ollama|local` (default: `auto`)

Success (examples):
```json
{ "solution": "...", "provider": "gemini", "requestedProvider": "auto" }
{ "solution": "...", "provider": "ollama", "requestedProvider": "ollama" }
{ "solution": "...", "provider": "local",  "requestedProvider": "local" }
```

On provider rate‑limit/overload (429/503) in auto mode, server returns structured guidance and may attempt fallbacks before responding with:
```json
{
  "error": "RATE_LIMIT", // or OVERLOADED
  "message": "Model is temporarily unavailable. Please wait and try again.",
  "retryAfterSeconds": 60,
  "detail": "...provider raw message...",
  "provider": "gemini",
  "requestedProvider": "auto"
}
```

Local rule‑based solver can directly answer some prompts (for faster, keyless responses), for example: terminating decimal checks.

---

## Detailed Results
This section summarizes functional results and how to reproduce them. Since this application is not a classification model, a confusion matrix is not applicable.

### Functional outcomes
- Explanations (auto): When a valid Gemini key is configured, requests return concise, Class‑10‑friendly text. If Gemini is unavailable, the system falls back (OpenAI/Ollama/local) and includes `provider`/`requestedProvider` fields.
- Local solver: For prompts like “Check whether 13/3125 has a terminating decimal expansion,” the server instantly returns a step list without calling external APIs.
- Provider override: `?provider=gemini|openai|ollama|local` selects an explicit provider. Responses reflect the requested and actual provider.

Example responses (abbreviated):
```json
{"explanation":"...","cached":true,"provider":"gemini","requestedProvider":"auto"}
{"explanation":"...","cached":false,"provider":"local","requestedProvider":"local"}
{"solution":"...","provider":"ollama","requestedProvider":"ollama"}
```

### Suggested graphs (how to generate)
If you wish to produce graphs, consider:
- Response time per provider (ms) for explain/solve
- Cache hit ratio over time
- Rate‑limit events vs. successful calls

You can collect data by wrapping fetch calls with timers in a small Node script or adding simple logging in `server/server.js`, then visualize with your preferred tool (e.g., Chart.js, Python/matplotlib). Avoid fabricating numbers; record them on your machine and state the environment (CPU, RAM, macOS version, Node version).

### Confusion matrix (operational)
While a traditional ML confusion matrix applies to classification tasks, we can present a practical “requested vs. used provider” matrix summarizing how the backend routed recent requests. Counts below reflect observed runs during local testing (both endpoints combined: explain + solve). Use it as an operational reliability view, not a classifier metric.

Requested vs. Used provider (counts)

| Requested ↓ \ Used → | gemini | openai | ollama | local | error |
|----------------------:|:------:|:------:|:------:|:-----:|:-----:|
| auto                  |   1    |   0    |   0    |   0   |   0   |
| gemini                |   0    |   0    |   0    |   0   |   0   |
| openai                |   0    |   0    |   0    |   0   |   0   |
| ollama                |   0    |   0    |   0    |   0   |   0   |
| local                 |   0    |   0    |   0    |   2   |   0   |

Notes
- The two “local → local” entries came from (1) GET /api/explain with `?provider=local` and (2) POST /api/solve with `?provider=local` for a terminating-decimal check.
- The “auto → gemini” entry came from GET /api/explain with `?provider=auto` (Gemini key present), which returned a cached Gemini explanation.
- No explicit `gemini|openai|ollama` runs were recorded during the latest test pass; cells remain 0 until you run them.

How to regenerate locally
```bash
# Auto → expect gemini (if key valid)
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=auto" | jq -r '.provider'

# Explicit providers
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=gemini" | jq -r '.provider'
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=openai" | jq -r '.provider'
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=ollama" | jq -r '.provider'
curl -s "http://localhost:3001/api/explain/maths/Probability?provider=local" | jq -r '.provider'

# Solver examples
curl -s -X POST "http://localhost:3001/api/solve?provider=auto"   -H "Content-Type: application/json" -d '{"prompt":"Check whether 13/3125 has a terminating decimal expansion"}' | jq -r '.provider'
curl -s -X POST "http://localhost:3001/api/solve?provider=local"  -H "Content-Type: application/json" -d '{"prompt":"Check whether 13/3125 has a terminating decimal expansion"}' | jq -r '.provider'
```
Tally each `(requestedProvider, provider)` pair from the JSON and update the table above. If a request fails with a non‑200 status, increment the `error` column.

### Output screenshots (what to capture)
- Home page hero and feature tiles
- Subject → Mathematics category view with topic cards
- A MathTopic page showing an explanation, and—if added—the provider selector
- Example solver result (local rule‑based solution)

You can embed images in this document later by adding them to a `docs/` folder and referencing them:
```
![Maths Topic Grid](docs/maths-topic-grid.png)
![Explanation Panel](docs/explanation-panel.png)
```

---

## Environment configuration (`server/.env`)
Required/optional variables:
```env
# Primary provider (required for real AI explanations/solutions)
GEMINI_API_KEY=your_gemini_key
# Optional: version/model (validated at startup)
GEMINI_API_VERSION=v1beta
GEMINI_MODEL=gemini-1.5-flash

# Optional: explanation/solver alternative providers
OPENAI_API_KEY=your_openai_key
OPENAI_MODEL=gpt-4o-mini

# Optional: local provider (Ollama)
OLLAMA_BASE_URL=http://localhost:11434
OLLAMA_MODEL=llama3.1:8b

# Optional: server port
PORT=3001
```
Startup logs will display the resolved Gemini model:
```
🤖 Gemini model in use: gemini-1.5-flash (version v1beta)
```
If the configured model is unavailable, the server attempts to auto‑resolve a compatible one via `ListModels`.

---

## Running locally
From repository root:

```bash
# 1) Install
npm install
(cd server && npm install)

# 2) Backend (in a terminal)
cd server
node server.js
# or with nodemon:
npm run dev

# 3) Frontend (in another terminal)
npm run dev
```

- Frontend: http://localhost:5173/
- API:      http://localhost:3001/

Tip: The root `package.json` also includes convenience scripts:
- `npm run server` → `cd server && node server.js`
- `npm run dev:server` → `cd server && nodemon server.js`

---

## Error handling, caching, and cooldowns
- 429 (rate limit) and 503 (overloaded) are detected and mapped to structured JSON with `retryAfterSeconds`.
- In auto mode, the server will attempt provider fallbacks when possible before returning an error payload.
- Explanations are cached in memory for ~30 minutes to reduce provider calls; the cache key is `subject-topic`.
- A per‑topic backoff map prevents hammering a provider during cooldowns.

What you’ll see in the UI when no key is configured (or during cooldown): a clear placeholder explanation like the screenshot you shared, encouraging you to add keys or retry.

---

## Current state vs. next steps
- Implemented:
  - Provider selection via `?provider=` on both endpoints
  - Provider tagging in responses: `provider` and `requestedProvider`
  - Local fallbacks and rule‑based solvers for certain prompts
  - Gemini model auto‑validation at startup
- Near‑term improvements:
  - Add UI controls to choose provider on MathTopic and Solver views
  - Display “Requested vs. Used” provider badge when they differ
  - Optional one‑command dev runner (use `concurrently`) and Vite proxy

---

## Conclusion
SmartStudy MathsMate demonstrates a pragmatic approach to AI‑assisted learning: prioritize clarity for students, combine multiple providers for reliability, and incorporate local fallbacks to remain useful even without cloud access. The provider selection mechanism empowers users to choose the engine behind their explanations or solutions, while auto mode balances convenience and resilience with caching and cooldowns. Future work includes surfacing provider controls in the UI, expanding rule‑based solvers, adding richer interactive math tools, and building lightweight telemetry to generate performance graphs. Together, these improvements will make the app even more dependable and helpful for students preparing for exams.

---

## Troubleshooting
- "Placeholder explanation" keeps showing:
  - Ensure `server/.env` contains `GEMINI_API_KEY` and the server has been restarted.
- Port already in use:
  - Change the `PORT` or free the port (3001 for API, 5173 for Vite).
- 429/503 repeatedly:
  - Respect cooldowns indicated by `retryAfterSeconds`, or switch provider to `openai`, `ollama`, or `local` temporarily.

---

Made with care to make maths learning simple, visual, and reliable.
