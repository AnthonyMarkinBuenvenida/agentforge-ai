import os
from abc import ABC, abstractmethod

from anthropic import Anthropic
from google import genai
from google.genai import types as genai_types

from app.agents.models import AgentConfig, AgentContext


class AIProvider(ABC):
    """Anything that can turn an agent config + context into a text response."""

    @abstractmethod
    def generate(self, config: AgentConfig, context: AgentContext) -> str:
        raise NotImplementedError


class DemoProvider(AIProvider):
    """Deterministic, offline stand-in for a real model. No API key required."""

    def generate(self, config: AgentConfig, context: AgentContext) -> str:
        return (
            f"[DEMO MODE] Agent '{config.name}' received input: '{context.user_input}'. "
            "This is a deterministic placeholder response used when no Anthropic API "
            "key is configured."
        )


class AnthropicProvider(AIProvider):
    """Calls the real Anthropic API using a key from the environment (or passed in)."""

    def __init__(self, api_key: str | None = None) -> None:
        key = api_key or os.getenv("ANTHROPIC_API_KEY")
        if not key:
            raise ValueError(
                "ANTHROPIC_API_KEY is not set; cannot create AnthropicProvider."
            )
        self._client = Anthropic(api_key=key)

    def generate(self, config: AgentConfig, context: AgentContext) -> str:
        messages = [*context.history, {"role": "user", "content": context.user_input}]
        response = self._client.messages.create(
            model=config.model,
            system=config.system_instructions,
            max_tokens=config.max_tokens,
            messages=messages,
        )
        return response.content[0].text


class GeminiProvider(AIProvider):
    """Calls the real Gemini API using a key from the environment (or passed in)."""

    MODEL = "gemini-3.5-flash-lite"

    def __init__(self, api_key: str | None = None) -> None:
        key = api_key or os.getenv("GEMINI_API_KEY")
        if not key:
            raise ValueError(
                "GEMINI_API_KEY is not set; cannot create GeminiProvider."
            )
        self._client = genai.Client(api_key=key)

    def generate(self, config: AgentConfig, context: AgentContext) -> str:
        response = self._client.models.generate_content(
            model=self.MODEL,
            contents=context.user_input,
            config=genai_types.GenerateContentConfig(
                system_instruction=config.system_instructions,
                max_output_tokens=config.max_tokens,
            ),
        )
        return response.text


def get_default_provider() -> AIProvider:
    """Picks a provider by priority: Gemini, then Anthropic, then the offline demo."""
    if os.getenv("GEMINI_API_KEY"):
        return GeminiProvider()
    if os.getenv("ANTHROPIC_API_KEY"):
        return AnthropicProvider()
    return DemoProvider()
