from app.agents.models import AgentConfig


def test_agent_config_defaults():
    config = AgentConfig(
        name="Planner",
        description="Breaks a research question into steps.",
        system_instructions="You are a planning agent.",
    )
    assert config.name == "Planner"
    assert config.model == "claude-sonnet-5"
    assert config.max_tokens == 1024


def test_agent_config_custom_values():
    config = AgentConfig(
        name="Writer",
        description="Writes the final report.",
        system_instructions="You are a writing agent.",
        model="custom-model",
        max_tokens=500,
    )
    assert config.model == "custom-model"
    assert config.max_tokens == 500
