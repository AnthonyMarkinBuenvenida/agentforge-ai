from app.agents.models import AgentConfig, AgentContext
from app.agents.providers import AIProvider, DemoProvider
from app.agents.runner import AgentRunner


def _config(name: str = "Researcher") -> AgentConfig:
    return AgentConfig(
        name=name,
        description="Finds sources.",
        system_instructions="You are a research agent.",
    )


class FailingProvider(AIProvider):
    """Test double that always raises, to exercise AgentRunner's error handling."""

    def generate(self, config: AgentConfig, context: AgentContext) -> str:
        raise RuntimeError("simulated provider failure")


def test_agent_runner_success_with_demo_provider():
    runner = AgentRunner(DemoProvider())

    result = runner.run(_config(), "Find sources about black holes")

    assert result.success is True
    assert result.error is None
    assert "Researcher" in result.output
    assert result.provider == "DemoProvider"


def test_agent_runner_handles_provider_error():
    runner = AgentRunner(FailingProvider())

    result = runner.run(_config("Critic"), "Check this claim")

    assert result.success is False
    assert result.output is None
    assert result.error == "simulated provider failure"
    assert result.provider == "FailingProvider"
