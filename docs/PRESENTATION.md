# Presentation Outline — AgentForge AI

Target length: 5-10 minutes. Rough timing suggestions in brackets — adjust to fit your slot.

## 1. Project introduction [30s]

"AgentForge AI is a web platform I built solo that lets you create, run, and combine AI agents into workflows — plus it ships with one ready-made multi-agent AI Factory. It's built to satisfy both halves of this assignment at once, not as two separate projects."

## 2. Problem [30s]

Single AI prompts are limited: one model call, one perspective, no structure. Real agentic systems get better results by splitting work across specialized agents — a planner, a researcher, a critic — each focused on one job, passing their output to the next. But building that requires both the *infrastructure* to define and run agents, and a *concrete example* of agents actually collaborating.

## 3. Objectives [30s]

- Build a general platform for creating, editing, and running AI agents and multi-agent workflows.
- Build one concrete, working multi-agent "factory" on top of that platform, proving the concept end to end.
- Keep the whole thing simple enough to fully explain — no framework magic, every piece traceable in the source.
- Make it demonstrable without any API key (demo mode), so it always works live.

## 4. Option 1: AI Factory (with Agentic AI) [1 min]

The **Academic Research Factory**: a fixed four-agent pipeline —

```
User Request → Planner → Researcher → Critic → Writer → Final Report
```

- **Planner** breaks the request into concrete research tasks.
- **Researcher** uses a local knowledge-base search "tool" to find relevant facts — this is the agentic tool-use piece.
- **Critic** reviews the research for gaps or unsupported claims.
- **Writer** turns everything into a structured final report.

Each agent's output becomes the next agent's input — real data flow between agents, not four independent calls stitched together after the fact.

## 5. Option 2: AI Platform [1 min]

Underneath the factory is a general platform: anyone can create their own agents (name, instructions, model), create their own workflows (pick agents, order them), run either a single agent or a full workflow, and see every execution recorded — inputs, outputs, statuses, timestamps, errors — with a full run history you can reopen later. The Academic Research Factory isn't special-cased code; it's just data (four agents + one workflow) running through this exact same platform.

## 6. Architecture [1-1.5 min]

Two-tier app: a React/TypeScript/Vite/Tailwind frontend talking JSON over HTTP to a Python/FastAPI backend, backed by SQLite.

```
Frontend → FastAPI routers → WorkflowRunner → AgentRunner → AIProvider (Demo or Anthropic) → SQLite
```

Key design choice worth calling out: `AgentRunner` never lets a provider error crash the app — it always returns a structured success/failure result, which is what lets a bad API call show up as a clean "Failed" badge in the UI instead of a server crash. (Full diagram in `docs/ARCHITECTURE.md`.)

## 7. Academic Research Factory workflow [30s]

(Can be brief here since section 4 already covered it — use this slide to show the actual UI screenshot of the four-step chain and the final report, as a visual anchor before the live demo.)

## 8. Live demo sequence [2-3 min]

Follow `docs/DEMO_GUIDE.md`:
1. Dashboard → point out the Factory card.
2. Run the Academic Research Factory on a live question → walk through all four steps and the final report.
3. Open Run History → reopen that run.
4. Quickly create one custom agent and run it standalone, to show the platform isn't just the one factory.

## 9. Technical implementation [1 min]

- Backend: FastAPI + SQLAlchemy + Pydantic; five tables (`Agent`, `Workflow`, `WorkflowStep`, `WorkflowRun`, `AgentExecution`).
- Agent engine: plain dataclasses (`AgentConfig`), an abstract `AIProvider` with two implementations (`DemoProvider`, `AnthropicProvider`), and `AgentRunner` gluing them together.
- Demo mode: automatic whenever no `ANTHROPIC_API_KEY` is set — deterministic, offline responses so the whole app is always demoable.
- Frontend: plain React state (no Redux/React Query) — small enough not to need it.

## 10. Testing and verification [1 min]

- 37 backend pytest tests: agent config, both providers, the runner's error handling, the database models/relationships, every API endpoint (including 404/400/422 error cases), the workflow engine (execution order, output chaining, clean failure stopping), and a full end-to-end demo-mode run of the Academic Research Factory.
- A small frontend test suite (vitest + React Testing Library): API error handling, workflow result rendering, loading/error states.
- Manually verified live in a real browser: every user flow, desktop and mobile layout, zero console errors, zero failed network requests — including a real test against the live Anthropic API with an invalid key, confirming errors surface cleanly end to end.

## 11. Limitations [30s]

- No authentication — single-user local demo, not a production deployment.
- Workflow runs are synchronous (one HTTP request) — no background job queue or live streaming of in-progress steps.
- The Researcher's knowledge base is a small, hardcoded local dataset — not a real search engine or vector database, by design.
- SQLite — fine for one user on one machine, not built for concurrent production use.

## 12. Future improvements [30s]

- Let users attach custom tools to any agent, not just the built-in KB search.
- Background execution with live step-by-step status updates instead of one blocking request.
- Conversation history / multi-turn agents.
- Swap SQLite for a server database and add basic auth if this ever needed to run for more than one person.

## 13. Conclusion [30s]

"AgentForge AI demonstrates both assignment options as one coherent system rather than two disconnected demos: a real, working AI Factory (Planner → Researcher → Critic → Writer) built entirely on top of a general-purpose AI agent platform that anyone could extend with their own agents and workflows — fully testable and fully demoable with zero setup."
