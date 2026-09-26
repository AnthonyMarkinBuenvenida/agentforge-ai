def _create_agent(client, name="Planner"):
    return client.post(
        "/api/agents", json={"name": name, "system_instructions": "x"}
    ).json()


def test_create_workflow_with_steps(client):
    agent = _create_agent(client)

    response = client.post(
        "/api/workflows",
        json={
            "name": "Research Factory",
            "description": "d",
            "steps": [{"agent_id": agent["id"], "step_order": 1}],
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Research Factory"
    assert len(body["steps"]) == 1
    assert body["steps"][0]["agent_id"] == agent["id"]


def test_create_workflow_with_unknown_agent_returns_400(client):
    response = client.post(
        "/api/workflows",
        json={"name": "Bad", "steps": [{"agent_id": 999, "step_order": 1}]},
    )
    assert response.status_code == 400


def test_update_workflow_replaces_steps(client):
    agent1 = _create_agent(client, "A1")
    agent2 = _create_agent(client, "A2")
    workflow = client.post(
        "/api/workflows",
        json={"name": "W", "steps": [{"agent_id": agent1["id"], "step_order": 1}]},
    ).json()

    response = client.put(
        f"/api/workflows/{workflow['id']}",
        json={"name": "W2", "steps": [{"agent_id": agent2["id"], "step_order": 1}]},
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "W2"
    assert len(body["steps"]) == 1
    assert body["steps"][0]["agent_id"] == agent2["id"]


def test_delete_workflow(client):
    workflow = client.post("/api/workflows", json={"name": "ToDelete", "steps": []}).json()

    delete_response = client.delete(f"/api/workflows/{workflow['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/api/workflows/{workflow['id']}").status_code == 404


def test_get_missing_workflow_returns_404(client):
    assert client.get("/api/workflows/999").status_code == 404
