from dataclasses import dataclass, field
from typing import Optional


@dataclass
class AgentConfig:
    """Static configuration describing what an agent is and how it should behave."""

    name: str
    description: str
    system_instructions: str
    model: str = "claude-sonnet-5"
    max_tokens: int = 1024


@dataclass
class AgentContext:
    """The input for a single agent run: the user's message plus any prior turns."""

    user_input: str
    history: list[dict] = field(default_factory=list)


@dataclass
class AgentResult:
    """The structured outcome of an agent run, success or failure."""

    success: bool
    output: Optional[str]
    error: Optional[str]
    agent_name: str
    provider: str
