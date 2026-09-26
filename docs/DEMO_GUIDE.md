# Demo Guide

Exact steps for a live demo of AgentForge AI. Everything here works in demo mode — no API key or internet access required.

## 1. Start the app

Terminal 1 (backend):
```
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```
Wait for `Application startup complete.` This also creates the SQLite database and seeds the Academic Research Factory automatically — nothing to set up by hand.

Terminal 2 (frontend):
```
cd frontend
npm run dev
```
Open the printed URL, normally **http://localhost:5173**.

## 2. Show the Dashboard

- Point out the four stat tiles: total agents, total workflows, successful runs, failed runs.
- Point out the "Built-in AI Factory" card — this is the Academic Research Factory, front and center, exactly as the assignment expects it to be easy to find.
- Note "Recent Runs" is empty on a fresh database — that will change in the next step.

## 3. Run the Academic Research Factory

1. Click **"Try the Academic Research Factory"** on the Dashboard (or go to **Workflows → Academic Research Factory**).
2. Point out the visible agent chain: **Planner → Researcher → Critic → Writer**.
3. Type a research question into the box, e.g. *"How does climate change affect renewable energy adoption?"*
4. Click **Run Workflow**.
5. When it completes, walk through the result top to bottom:
   - The run's overall status badge (**Completed**).
   - Each of the four steps, in order, each showing its own status, its input (expandable), and its output.
   - Point out that **Researcher**'s input includes a "Knowledge base findings" section — this is the local knowledge-base tool actually being used, not just plumbing.
   - Point out that each step's output becomes the next step's input — this is the "output passed to next step" requirement, visibly demonstrated.
   - The **Final Output** panel at the bottom — the Writer's structured report.

## 4. Show Run History

1. Go to **Run History**.
2. The run just completed is listed with its status and timestamp.
3. Click **View** to reopen it — the exact same step-by-step breakdown renders again, proving runs are durably stored, not just shown once.

## 5. Show the AI Platform side (not just the factory)

1. Go to **Agents → New Agent**. Create a simple one (e.g. name "Summarizer", instructions "Summarize text in one sentence.").
2. Open its detail page, type something into "Run this agent," click **Run** — show a single agent running standalone, outside any workflow.
3. Go to **Workflows → New Workflow**. Give it a name, add your new agent (and maybe one of the factory's agents) as steps using the dropdown, reorder them with the Up/Down buttons.
4. Save it, then run it the same way as the factory — demonstrating that the platform isn't hardcoded to one workflow; anyone can build their own multi-agent pipeline.

## 6. (Optional) Show error handling

- Run a workflow, then navigate directly to a nonexistent run/agent/workflow URL (or just mention it) — the app shows a readable "not found" message instead of crashing.
- If you have a real (or intentionally invalid) `ANTHROPIC_API_KEY` set, mention that a failed real API call is handled the same clean way: the run and the failing step are marked "Failed" with the actual error message, and the workflow stops instead of continuing on bad data.

## 7. (Optional) Show it works with a real API key

- Stop the backend, set `ANTHROPIC_API_KEY` in `backend/.env` to a real key, restart the backend.
- `GET /api/health` now reports `"demo_mode": false`.
- Re-run any agent or the factory — the exact same UI now shows real model output instead of the deterministic demo text, with no code changes anywhere.

## Talking points while it runs

- "This whole run happened in one HTTP request — no background job, no polling — which is why the UI shows a loading state and then the complete result."
- "Every step you're seeing is a real database row: a `WorkflowRun` plus one `AgentExecution` per step, so this is genuine execution history, not just a live view."
- "The Researcher doesn't call an external search API or a vector database — it searches a small local knowledge base, which satisfies 'tool use' without extra infrastructure."
