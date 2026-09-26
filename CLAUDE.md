# AgentForge AI

Solo student project demonstrating two assignment options at once: an **AI Factory with Agentic AI** (the built-in Academic Research Factory) and a custom **AI Platform** (create/run/combine agents into workflows).

## Architecture

- `backend/app/agents/` — the agent engine: `AgentConfig`/`AgentContext`/`AgentResult` (dataclasses), `AIProvider` (abstract) with `DemoProvider` and `AnthropicProvider`, `AgentRunner` (always returns a structured result, never raises), `Tool`/`ToolRegistry`.
- `backend/app/db_models.py` + `app/schemas.py` — SQLAlchemy models and Pydantic schemas for `Agent`, `Workflow`, `WorkflowStep`, `WorkflowRun`, `AgentExecution`.
- `backend/app/workflow_engine.py` — `WorkflowRunner`: executes a workflow's steps in order, feeds each step's output into the next, records execution rows, stops cleanly on failure.
- `backend/app/factories/academic_research.py` — the built-in Planner → Researcher → Critic → Writer factory, auto-seeded into the DB on startup.
- `backend/app/knowledge_base.py` — the small deterministic local KB the Researcher step queries (no vector DB, no external search).
- `backend/app/routers/` — FastAPI endpoints (agents, workflows, runs, dashboard). Frontend talks only to these; never to the Anthropic API directly.
- `frontend/src/` — React + TypeScript + Vite + Tailwind, routed with `react-router-dom`. `api/client.ts` is the one place that calls the backend.

Demo mode is automatic: `DEMO_MODE = (ANTHROPIC_API_KEY == "")` in `backend/app/config.py`. No key needed to run or demo the app.

## Commands

Backend (from `backend/`, with `.venv` active):
```
uvicorn app.main:app --reload
python -m pytest
```

Frontend (from `frontend/`):
```
npm run dev
npm run build
npm run lint
npm test
```

## Constraints

- Keep it simple — no auth, no microservices, no vector DB, no cloud deployment. This is a single-developer, local-run demo app.
- No secrets in git. `ANTHROPIC_API_KEY` only ever comes from environment variables / `backend/.env` (gitignored); the frontend never sees it.
- Before declaring anything done, actually run the backend tests, the frontend build, and (for UI changes) exercise the app in a browser — don't assume.
