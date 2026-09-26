def test_create_and_get_agent(client):
    response = client.post(
        "/api/agents",
        json={
            "name": "Planner",
            "description": "Plans research",
            "system_instructions": "You are a planner.",
        },
    )
    assert response.status_code == 201
    body = response.json()
    assert body["name"] == "Planner"
    assert body["model"] == "claude-sonnet-5"

    get_response = client.get(f"/api/agents/{body['id']}")
    assert get_response.status_code == 200
    assert get_response.json()["name"] == "Planner"


def test_list_agents_returns_created_agents(client):
    existing_names = {agent["name"] for agent in client.get("/api/agents").json()}

    client.post("/api/agents", json={"name": "A", "system_instructions": "x"})
    client.post("/api/agents", json={"name": "B", "system_instructions": "y"})

    response = client.get("/api/agents")
    assert response.status_code == 200
    new_names = [
        agent["name"] for agent in response.json() if agent["name"] not in existing_names
    ]
    assert new_names == ["A", "B"]


def test_update_agent(client):
    created = client.post(
        "/api/agents", json={"name": "Old", "system_instructions": "x"}
    ).json()

    response = client.put(
        f"/api/agents/{created['id']}",
        json={
            "name": "New",
            "description": "updated",
            "system_instructions": "y",
            "model": "custom-model",
        },
    )
    assert response.status_code == 200
    body = response.json()
    assert body["name"] == "New"
    assert body["model"] == "custom-model"


def test_delete_agent(client):
    created = client.post(
        "/api/agents", json={"name": "Temp", "system_instructions": "x"}
    ).json()

    delete_response = client.delete(f"/api/agents/{created['id']}")
    assert delete_response.status_code == 204
    assert client.get(f"/api/agents/{created['id']}").status_code == 404


def test_get_missing_agent_returns_404(client):
    assert client.get("/api/agents/999").status_code == 404


def test_create_agent_missing_required_field_returns_422(client):
    response = client.post("/api/agents", json={"name": "NoInstructions"})
    assert response.status_code == 422


def test_run_agent_returns_demo_output(client):
    created = client.post(
        "/api/agents", json={"name": "Runnable", "system_instructions": "x"}
    ).json()

    response = client.post(
        f"/api/agents/{created['id']}/run", json={"input": "Say hello"}
    )
    assert response.status_code == 200
    body = response.json()
    assert body["success"] is True
    assert body["error"] is None
    assert "Runnable" in body["output"]
    assert "Say hello" in body["output"]


def test_run_missing_agent_returns_404(client):
    response = client.post("/api/agents/999/run", json={"input": "hi"})
    assert response.status_code == 404
