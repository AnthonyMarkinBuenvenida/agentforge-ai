import pytest

from app.agents.models import AgentConfig, AgentContext
from app.agents.providers import (
    AnthropicProvider,
    DemoProvider,
    GeminiProvider,
    get_default_provider,
)


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


def test_gemini_provider_requires_api_key(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)

    with pytest.raises(ValueError):
        GeminiProvider()


def test_gemini_provider_constructs_with_a_key():
    # Only constructs the client; does not make a real API call.
    provider = GeminiProvider(api_key="fake-key-for-construction-test")
    assert provider.MODEL == "gemini-3.5-flash-lite"


class TestGetDefaultProvider:
    def test_prefers_gemini_when_gemini_key_is_set(self, monkeypatch):
        monkeypatch.setenv("GEMINI_API_KEY", "fake-gemini-key")
        monkeypatch.setenv("ANTHROPIC_API_KEY", "fake-anthropic-key")

        assert isinstance(get_default_provider(), GeminiProvider)

    def test_falls_back_to_anthropic_when_only_anthropic_key_is_set(self, monkeypatch):
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        monkeypatch.setenv("ANTHROPIC_API_KEY", "fake-anthropic-key")

        assert isinstance(get_default_provider(), AnthropicProvider)

    def test_falls_back_to_demo_when_no_keys_are_set(self, monkeypatch):
        monkeypatch.delenv("GEMINI_API_KEY", raising=False)
        monkeypatch.delenv("ANTHROPIC_API_KEY", raising=False)

        assert isinstance(get_default_provider(), DemoProvider)
