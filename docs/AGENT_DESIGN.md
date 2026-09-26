# Agent Design

This document explains the building blocks of the agent engine (`backend/app/agents/`) and how the Academic Research Factory's four agents use them. The engine is deliberately small: plain dataclasses, one abstract provider interface, two concrete providers, and one runner class.

## AgentConfig

A plain dataclass (`app/agents/models.py`) describing *what an agent is*, not what it's doing right now:

```python
@dataclass
class AgentConfig:
    name: str
    description: str
    system_instructions: str
    model: str = "claude-sonnet-5"
    max_tokens: int = 1024
```

This is intentionally just data — no methods, no behavior. It's built fresh from a stored `Agent` database row every time an agent runs (see `workflow_engine.py`'s `_run_step`), so editing an agent's instructions immediately affects its next run.

`AgentContext` (also in `models.py`) pairs a config with a specific input: `{user_input: str, history: list[dict]}`. `AgentResult` is the structured outcome: `{success, output, error, agent_name, provider}`.

## AgentRunner

`app/agents/runner.py`. Takes a provider once, then `run(config, user_input)` any number of times. Its one job: never let a provider's exception escape.

```python
def run(self, config, user_input, history=None) -> AgentResult:
    context = AgentContext(user_input=user_input, history=history or [])
    try:
        output = self.provider.generate(config, context)
        return AgentResult(success=True, output=output, error=None, ...)
    except Exception as exc:
        return AgentResult(success=False, output=None, error=str(exc), ...)
```

Every caller — a single-agent run, or a step inside a workflow — always gets a structured result back, success or failure, never a crash. This is what lets `WorkflowRunner` record a clean "failed" `AgentExecution` instead of the whole request blowing up with a 500 when, say, the Anthropic API rejects a bad key.

## AIProvider

An abstract base class (`app/agents/providers.py`) with one method: `generate(config, context) -> str`. Anything that can turn a config + input into text can be a provider.

### DemoProvider

No API key needed. Returns a deterministic, canned string that echoes the agent's name and the input back:

```python
f"[DEMO MODE] Agent '{config.name}' received input: '{context.user_input}'. This is a deterministic placeholder response used when no Anthropic API key is configured."
```

Deterministic on purpose — the same input always produces the same output, so demo runs are repeatable and the whole app (single agents, the full four-step factory) works offline with zero setup.

### AnthropicProvider

Wraps the real `anthropic` Python SDK. Reads the API key from the environment (`ANTHROPIC_API_KEY`), and raises `ValueError` immediately at construction if no key is present — fail fast, with a clear message, rather than failing deep inside a request. `get_default_provider()` picks between the two automatically based on whether a key is configured (`app/config.py`'s `DEMO_MODE`), so nothing above the provider layer needs to know or care which one is active.

## ToolRegistry

`app/agents/tools.py`. A `Tool` is just a `{name, description, func}` triple; `ToolRegistry` is a name → `Tool` lookup with `register()` and `get()`. It exists so tools can be added without redesigning the agent classes — the Academic Research Factory's knowledge-base search (`app/knowledge_base.py`) is registered here and is currently the only tool in use.

## WorkflowRunner

`app/workflow_engine.py`. Connects the agent engine to the database — see [ARCHITECTURE.md](ARCHITECTURE.md) for the full data-flow walkthrough. The one piece of agent-specific logic living here (rather than in a generic tool-calling loop) is: when the current step's agent is named `"Researcher"`, its input is augmented with the local knowledge base's search results before the agent runs:

```python
if agent.name == RESEARCHER_NAME:
    findings = tool_registry.get("knowledge_base_search").func(step_input)
    return f"{step_input}\n\nKnowledge base findings:\n{findings}"
```

This is a small, explicit special case rather than a generic function-calling framework — enough to genuinely demonstrate "agentic" tool use without the complexity of a full tool-calling protocol.

## The four built-in agents

Defined in `app/factories/academic_research.py` as plain data (name, description, system instructions) — they're stored as ordinary `Agent` rows, not a different kind of object.

| Agent | Role | System instructions (summary) |
|---|---|---|
| **Planner** | Breaks the user's request into concrete research tasks | "Break the request into 2-4 clear, concrete research tasks." |
| **Researcher** | Answers the plan using the local knowledge base | "Use the retrieved knowledge base findings to answer the planner's tasks factually." (Its input is the only one augmented with KB search results — see above.) |
| **Critic** | Reviews the research for gaps or unsupported claims | "Review the findings for missing information, weak reasoning, or unsupported claims." |
| **Writer** | Produces the final structured report | "Using the plan, research, and critique, write a report with headings: Summary, Findings, Limitations, Conclusion." |

They run through `WorkflowRunner` in exactly the order defined by their `WorkflowStep.step_order` (1-4) — the same mechanism any user-created workflow uses. Nothing about the workflow engine is hardcoded to this specific factory except the one `RESEARCHER_NAME` check above.
