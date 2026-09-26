# AgentForge AI

A small web platform for creating, running, and combining AI agents into workflows — built as a school project to demonstrate both an **AI Factory with Agentic AI** and a custom **AI Platform**.

## Status

Phase 1 complete: project scaffolding, backend health check, frontend build, and dev-server integration are working. Agent/workflow features come in later phases.

## Tech stack

- Frontend: React + TypeScript + Vite + Tailwind CSS
- Backend: Python + FastAPI
- Database: SQLite
- AI: Anthropic API (with a demo mode that requires no API key)

## Project layout

```
AgentForge-AI/
├── backend/    FastAPI app, agent engine, SQLite database
├── frontend/   React + Vite + Tailwind UI
└── docs/       Architecture notes and presentation materials
```

## Running locally

### Backend

```
cd backend
.venv\Scripts\activate   # or: python -m venv .venv  (first time)
pip install -r requirements.txt
uvicorn app.main:app --reload
```

Copy `backend/.env.example` to `backend/.env` and add `ANTHROPIC_API_KEY` to use the real API. Leave it blank to run in demo mode.

### Frontend

```
cd frontend
npm install
npm run dev
```

The Vite dev server proxies `/api` requests to the backend on port 8000.
