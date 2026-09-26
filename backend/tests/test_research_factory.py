from app.factories.academic_research import (
    CRITIC_NAME,
    FACTORY_WORKFLOW_NAME,
    PLANNER_NAME,
    RESEARCHER_NAME,
    WRITER_NAME,
)


def _get_factory_workflow(client):
    workflows = client.get("/api/workflows").json()
    return next(w for w in workflows if w["name"] == FACTORY_WORKFLOW_NAME)


def test_academic_research_factory_seeded_on_startup(client):
    workflow = _get_factory_workflow(client)
    step_agent_ids = [step["agent_id"] for step in workflow["steps"]]
    assert len(step_agent_ids) == 4

    agents = client.get("/api/agents").json()
    names_by_id = {agent["id"]: agent["name"] for agent in agents}
    ordered_names = [names_by_id[agent_id] for agent_id in step_agent_ids]
    assert ordered_names == [PLANNER_NAME, RESEARCHER_NAME, CRITIC_NAME, WRITER_NAME]


def test_academic_research_factory_runs_end_to_end_in_demo_mode(client):
    workflow = _get_factory_workflow(client)

    response = client.post(
        f"/api/workflows/{workflow['id']}/run",
        json={"input": "How does climate change affect renewable energy adoption?"},
    )
    assert response.status_code == 201
    run = response.json()

    assert run["status"] == "completed"
    assert run["error"] is None
    assert run["final_output"]

    executions = run["executions"]
    assert len(executions) == 4
    assert all(execution["status"] == "completed" for execution in executions)

    researcher_execution = executions[1]
    assert "Knowledge base findings" in researcher_execution["input"]

    # Each step receives the previous step's output (Researcher's input is
    # augmented, so it starts with rather than exactly equals the prior output).
    assert executions[1]["input"].startswith(executions[0]["output"])
    assert executions[2]["input"] == executions[1]["output"]
    assert executions[3]["input"] == executions[2]["output"]

    fetched_run = client.get(f"/api/runs/{run['id']}").json()
    assert fetched_run["status"] == "completed"
    assert len(fetched_run["executions"]) == 4
