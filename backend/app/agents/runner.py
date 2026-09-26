from typing import Optional

from app.agents.models import AgentConfig, AgentContext, AgentResult
from app.agents.providers import AIProvider


class AgentRunner:
    """Runs one agent config against one provider and always returns an AgentResult."""

    def __init__(self, provider: AIProvider) -> None:
        self.provider = provider

    def run(
        self,
        config: AgentConfig,
        user_input: str,
        history: Optional[list[dict]] = None,
    ) -> AgentResult:
        context = AgentContext(user_input=user_input, history=history or [])
        provider_name = type(self.provider).__name__
        try:
            output = self.provider.generate(config, context)
            return AgentResult(
                success=True,
                output=output,
                error=None,
                agent_name=config.name,
                provider=provider_name,
            )
        except Exception as exc:
            return AgentResult(
                success=False,
                output=None,
                error=str(exc),
                agent_name=config.name,
                provider=provider_name,
            )
