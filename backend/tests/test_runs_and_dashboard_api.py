def test_list_runs_empty(client):
    response = client.get("/api/runs")
    assert response.status_code == 200
    assert response.json() == []


def test_get_missing_run_returns_404(client):
    assert client.get("/api/runs/1").status_code == 404


def test_dashboard_stats_reflect_created_resources(client):
    before = client.get("/api/dashboard/stats").json()

    client.post("/api/agents", json={"name": "A", "system_instructions": "x"})
    client.post("/api/workflows", json={"name": "W", "steps": []})

    response = client.get("/api/dashboard/stats")
    assert response.status_code == 200
    body = response.json()
    assert body["total_agents"] == before["total_agents"] + 1
    assert body["total_workflows"] == before["total_workflows"] + 1
    assert body["total_runs"] == before["total_runs"]
    assert body["completed_runs"] == before["completed_runs"]
    assert body["failed_runs"] == before["failed_runs"]
