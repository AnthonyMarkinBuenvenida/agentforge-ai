# Architecture

AgentForge AI is a two-tier application: a React frontend and a FastAPI backend, talking over a JSON HTTP API. There is no message queue, no microservices, and no external database server — everything runs as two local processes plus a SQLite file.

## Layers

```
┌─────────────────────────────────────────────────────────────┐
│ Frontend (React + TypeScript + Vite + Tailwind)              │
│  pages/  →  components/  →  api/client.ts  →  fetch('/api')  │
└───────────────────────────────┬───────────────────────────────┘
                                 │ HTTP / JSON (Vite dev proxy → :8000)
┌───────────────────────────────▼───────────────────────────────┐
│ FastAPI backend                                                │
│                                                                  │
│  routers/  (agents, workflows, runs, dashboard)                 │
│      │  Pydantic schemas validate every request/response        │
│      ▼                                                          │
│  workflow_engine.WorkflowRunner  ───────────┐                   │
│      │  runs each WorkflowStep in order      │                  │
│      ▼                                       ▼                  │
│  agents.runner.AgentRunner            knowledge_base.py         │
│      │  always returns a structured result   (Researcher's      │
│      ▼  (never raises)                        local KB lookup)  │
│  agents.providers.AIProvider                                    │
│      ├─ DemoProvider     (offline, deterministic)                │
│      └─ AnthropicProvider (real Anthropic API)                   │
│                                                                  │
│  db_models.py (SQLAlchemy)  ⇄  SQLite file                       │
└──────────────────────────────────────────────────────────────┘
```

## Frontend

Plain React function components, routed with `react-router-dom`. There's exactly one file that talks to the backend — `frontend/src/api/client.ts` — a thin typed wrapper around `fetch()` that throws a readable `ApiError` (using the backend's `detail` message) on any non-2xx response. Every page follows the same pattern: fetch on mount, track `loading`/`error`/data in local state, render accordingly. No global state library, no server-cache library — the app is small enough that plain `useState`/`useEffect` is simpler and easier to explain than adding one.

## FastAPI backend

**Routers** (`app/routers/`) are the only HTTP surface. Each one is a thin CRUD layer over a SQLAlchemy model, using Pydantic schemas (`app/schemas.py`) to validate input and shape output. They contain no business logic beyond input validation (e.g. checking a referenced agent exists) and 404/400 handling.

**Database** (`app/db.py`, `app/db_models.py`): five tables — `Agent`, `Workflow`, `WorkflowStep`, `WorkflowRun`, `AgentExecution`. A `Workflow` has an ordered list of `WorkflowStep`s (each pointing at an `Agent`); a `WorkflowRun` has an ordered list of `AgentExecution`s (one per step, in the order it ran). `init_db()` creates the tables on startup if they don't exist — no manual migration step for a project this size. The engine is created from `DATABASE_URL`: a local SQLite file by default (zero setup, used in dev and in the test suite), or a Postgres URL (Neon, injected automatically in production) — the SQLAlchemy models and every query are identical either way; only the connection string changes.

**Agent engine** (`app/agents/`) is independent of the database and the web layer — it just takes a plain `AgentConfig` and some input text and returns a result. See [AGENT_DESIGN.md](AGENT_DESIGN.md) for the full breakdown of `AgentConfig`, `AgentRunner`, `AIProvider`, and the two providers.

**Workflow engine** (`app/workflow_engine.py`) is the only piece that connects the agent engine to the database: `WorkflowRunner.run()` creates a `WorkflowRun` row, then for each `WorkflowStep` (in `step_order`) builds an `AgentConfig` from the stored `Agent`, calls `AgentRunner.run()`, and records the result as an `AgentExecution`. The previous step's output becomes the next step's input. If a step fails, the loop stops immediately — no further steps run, and the `WorkflowRun` is marked `failed` with the error message. This is deliberately simple: one Python function, no retries, no parallelism, no background job system.

**The Academic Research Factory** (`app/factories/academic_research.py`) isn't special-cased infrastructure — it's just four `Agent` rows and one `Workflow` row with four `WorkflowStep`s, created once on startup by `ensure_academic_research_factory()` if they don't already exist. It runs through the exact same `WorkflowRunner` as any user-created workflow. The one exception: when the workflow engine reaches the step named `"Researcher"`, it appends the local knowledge base's search results to that step's input before calling the agent — see `knowledge_base.py` and [AGENT_DESIGN.md](AGENT_DESIGN.md).

## Data flow: running a workflow

1. Frontend `POST /api/workflows/{id}/run` with `{"input": "..."}`.
2. Router loads the `Workflow` (404 if missing), hands it to `WorkflowRunner`.
3. `WorkflowRunner` creates a `WorkflowRun` row (`status="running"`).
4. For each step, in order: build `AgentConfig` from the DB `Agent` → (if Researcher) append KB findings to the input → `AgentRunner.run()` → provider generates a response (or the call fails) → record an `AgentExecution` row with input/output/status/timestamps/error.
5. On success, the step's output becomes the next step's input. On failure, the loop stops and the run is marked `failed`.
6. Once all steps finish, the run is marked `completed` with `final_output` set to the last step's output.
7. The full `WorkflowRun` (with its `executions` list) is returned as the HTTP response — the same shape `GET /api/runs/{id}` returns later, so the frontend can render it identically whether it's a fresh run or a reopened one from history.

## Why it's simple on purpose

- No authentication — this is a local, single-user demo app.
- No background job queue — a workflow run is one synchronous request; acceptable at demo scale, and it means there's no extra moving part (no Redis, no Celery, no polling) to explain.
- No vector database — the "AI Factory" tool use is a small, deterministic local keyword search, exactly matching the assignment's constraint against external search/vector infrastructure.
- SQLite for local development — zero setup, no server to run. In production, Vercel's serverless functions have no persistent local disk, so deployment uses a small managed Postgres database (Neon) instead; the application code doesn't know or care which one it's talking to.
