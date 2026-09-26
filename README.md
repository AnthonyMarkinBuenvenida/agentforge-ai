# AgentForge AI

A small web platform for creating, running, and combining AI agents into workflows — plus one built-in multi-agent **AI Factory**. Built as a solo school project to demonstrate both assignment options at once: an *AI Factory with Agentic AI* and a custom *AI Platform*.

## What this platform does

AgentForge AI lets you:

- **Create and edit AI agents** — a name, a description, system instructions, and a model.
- **Run a single agent** directly against a text input and see its output.
- **Create workflows** by chaining agents together in a chosen order.
- **Run a workflow** on a request and watch it pass each agent's output into the next.
- **See execution logs and run history** — every workflow run and every individual agent execution is stored and can be reopened later.
- **Try the built-in Academic Research Factory** without any setup.

## The Academic Research Factory (AI Factory)

A ready-made, four-agent workflow that ships with the app and is seeded automatically on first run:

```
User Request → Planner → Researcher → Critic → Writer → Final Report
```

- **Planner** breaks the request into concrete research tasks.
- **Researcher** searches a small local knowledge base and answers using what it finds (this is the "tool use" — no external search service or vector database).
- **Critic** reviews the research for gaps, weak reasoning, or unsupported claims.
- **Writer** turns the plan, research, and critique into a structured final report.

Each step's output becomes the next step's input, every step is recorded as an `AgentExecution`, and the whole run is recorded as a `WorkflowRun` — visible afterward in Run History.

## Architecture overview

```
Browser (React)
   │  fetch('/api/...')
   ▼
FastAPI backend
   │
   ├─ Routers (agents / workflows / runs / dashboard)  →  Pydantic request/response validation
   ├─ WorkflowRunner  →  runs each WorkflowStep in order, chains output → input
   ├─ AgentRunner     →  calls a provider, always returns a structured result (never raises)
   ├─ AIProvider      →  DemoProvider (offline, deterministic) or AnthropicProvider (real API)
   └─ SQLAlchemy models  →  SQLite locally / PostgreSQL (Neon) in production (agents, workflows, workflow_steps, workflow_runs, agent_executions)
```

The frontend never talks to Anthropic directly — it only calls this backend's own `/api/*` endpoints, and the API key (when present) lives only in backend environment variables. See [docs/ARCHITECTURE.md](docs/ARCHITECTURE.md) for the full breakdown and [docs/AGENT_DESIGN.md](docs/AGENT_DESIGN.md) for how the agent engine's pieces fit together.

## Main features

1. Agent management (create, edit, delete, run)
2. Workflow management (create, edit, delete, reorder steps)
3. Single-agent execution
4. Multi-agent workflow execution
5. Execution logs (per-step input/output/status/timestamps/errors)
6. Run history (list + reopen any past run)
7. Dashboard (totals, recent runs)
8. Built-in Academic Research Factory (demo-ready out of the box)

## Technology stack

- **Frontend:** React, TypeScript, Vite, Tailwind CSS, react-router-dom
- **Backend:** Python, FastAPI, SQLAlchemy
- **Database:** SQLite locally (auto-created, zero setup) or PostgreSQL via [Neon](https://neon.com) in production — same SQLAlchemy models either way, switched purely by the `DATABASE_URL` environment variable
- **AI:** Anthropic API, with a built-in demo mode that needs no API key

## Project structure

```
AgentForge-AI/
├── CLAUDE.md
├── README.md
├── vercel.json           # Vercel Services config (frontend + backend, deployed together)
├── docs/
│   ├── ARCHITECTURE.md
│   ├── AGENT_DESIGN.md
│   ├── DEMO_GUIDE.md
│   ├── PRESENTATION.md
│   └── FINAL_CHECKLIST.md
├── backend/
│   ├── app/
│   │   ├── agents/          # AgentConfig, AgentRunner, providers, ToolRegistry
│   │   ├── factories/       # Academic Research Factory definition + seeding
│   │   ├── routers/         # /api/agents, /api/workflows, /api/runs, /api/dashboard
│   │   ├── db.py            # SQLAlchemy engine/session, init_db()
│   │   ├── db_models.py     # Agent, Workflow, WorkflowStep, WorkflowRun, AgentExecution
│   │   ├── schemas.py       # Pydantic request/response models
│   │   ├── workflow_engine.py
│   │   ├── knowledge_base.py
│   │   ├── config.py        # env vars, demo-mode switch
│   │   └── main.py          # FastAPI app, routes, startup seeding
│   ├── tests/                # pytest suite (40 tests)
│   ├── requirements.txt
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/client.ts     # the one place that calls the backend
    │   ├── components/       # Layout, Button, Card, StatusBadge, RunResultView
    │   ├── pages/             # Dashboard, Agents, Workflows, Run History
    │   └── types.ts
    └── package.json
```

## Prerequisites

- Python 3.12+
- Node.js 20+ and npm
- Git

## Installation

Clone the repository, then set up each half:

```
git clone <your-repo-url>
cd AgentForge-AI
```

### Backend setup

```
cd backend
python -m venv .venv
.venv\Scripts\activate        # Windows
# source .venv/bin/activate   # macOS/Linux
pip install -r requirements.txt
```

### Frontend setup

```
cd frontend
npm install
```

## Environment variables

Copy `backend/.env.example` to `backend/.env`:

```
ANTHROPIC_API_KEY=
DATABASE_URL=
```

- **`ANTHROPIC_API_KEY`** — leave blank to run in **demo mode** (no network calls, deterministic canned responses); set a real key to call the real Anthropic API instead.
- **`DATABASE_URL`** — optional locally; defaults to a local SQLite file (`sqlite:///./agentforge.db`) if unset. In production on Vercel, the Neon Postgres integration injects this automatically as a `postgresql://` URL — you don't set it by hand there.

`backend/.env` is gitignored and is never committed. The frontend never reads or sees either of these values — only the backend process does.

## Demo mode

Demo mode is automatic whenever `ANTHROPIC_API_KEY` is unset or empty. `GET /api/health` reports it:

```json
{"status": "ok", "demo_mode": true}
```

In demo mode, `DemoProvider` returns a deterministic, offline response for every agent call — so every flow (single-agent runs, the Academic Research Factory, workflow chaining) is fully demonstrable with no API key and no internet access.

## How to start the backend

```
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

Runs on `http://127.0.0.1:8000`. On first startup it creates the database tables (SQLite locally, or Postgres if `DATABASE_URL` is set) and seeds the Academic Research Factory automatically.

## How to start the frontend

```
cd frontend
npm run dev
```

Runs on `http://localhost:5173` and proxies `/api/*` requests to the backend on port 8000.

## How to run tests

Backend (from `backend/`):
```
python -m pytest
```

Frontend (from `frontend/`):
```
npm run build   # production build / type-check
npm run lint    # oxlint
npm test        # vitest unit tests
```

## How to use the Academic Research Factory

1. Start both the backend and frontend (above).
2. Open `http://localhost:5173` — the Dashboard has a "Try the Academic Research Factory" card.
3. Click it (or go to **Workflows → Academic Research Factory**).
4. Type a research question into the "Run this workflow" box and click **Run Workflow**.
5. Watch all four steps (Planner → Researcher → Critic → Writer) complete in order, each with its own input/output, and read the final report at the bottom.
6. Open **Run History** any time afterward to reopen that run and inspect each step again.

See [docs/DEMO_GUIDE.md](docs/DEMO_GUIDE.md) for a full walkthrough script.

## Deployment

The entire app (frontend + backend) deploys together as one Vercel project using [Vercel Services](https://vercel.com/docs/services): `vercel.json` at the repo root declares a `frontend` service (`frontend/`) and a `backend` service (`backend/`, FastAPI entrypoint `app.main:app`), with `/api/*` routed to the backend and everything else to the frontend. In production, the database is Postgres via a Neon Marketplace integration — `DATABASE_URL` is injected automatically, and `ANTHROPIC_API_KEY` is set directly in the Vercel project's environment variables (never in git, never on the frontend).

## GitHub repository

This project's source is hosted on GitHub, with deployment-ready configuration (`vercel.json`) committed alongside the application code.

## Known limitations

- **No authentication** — anyone with access to the running app can use it. Fine for a local demo/school project; not intended for public deployment.
- **Synchronous workflow execution** — a workflow run happens within a single HTTP request; there's no background job queue or live streaming of in-progress steps, so the UI shows a loading state, then the complete result all at once.
- **Demo-mode output is intentionally repetitive** — `DemoProvider` echoes the previous step's full input back verbatim, so by the Writer step the demo text is visibly nested. This is expected: it makes the data flow between agents easy to see without needing a real API key.
- **Local knowledge base only** — the Researcher agent searches a small, hardcoded set of topics (deterministic keyword matching), not a real search engine or vector database, by design.
- **SQLite locally, Postgres in production** — local development defaults to a zero-setup SQLite file; a deployed instance needs a Neon Postgres database (free tier) since Vercel's serverless functions have no persistent local filesystem.
