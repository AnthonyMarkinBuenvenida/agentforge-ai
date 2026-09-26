import pytest

from app.agents.models import AgentConfig, AgentContext
from app.agents.providers import AnthropicProvider, DemoProvider


def _config() -> AgentConfig:
    return AgentConfig(
        name="Writer",
        description="Writes summaries.",
        system_instructions="You are a writing agent.",
    )


def test_demo_provider_is_deterministic():
    provider = DemoProvider()
    context = AgentContext(user_input="Summarize photosynthesis")

    first = provider.generate(_config(), context)
    second = provider.generate(_config(), context)

    assert first == second
    assert "Writer" in first
    assert "Summarize photosynthesis" in first


def test_anthropic_provider_requires_api_key(monkeypatch):
    monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

    with pytest.raises(ValueError):
        AnthropicProvider()
