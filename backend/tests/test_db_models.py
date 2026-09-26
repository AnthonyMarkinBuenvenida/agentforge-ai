from datetime import datetime, timezone

from app.db_models import Agent, AgentExecution, Workflow, WorkflowRun, WorkflowStep


def test_agent_and_workflow_step_relationship(db_session):
    agent = Agent(name="Planner", description="d", system_instructions="s")
    db_session.add(agent)
    db_session.commit()
    db_session.refresh(agent)

    workflow = Workflow(name="Research", description="d")
    workflow.steps.append(WorkflowStep(agent_id=agent.id, step_order=1))
    db_session.add(workflow)
    db_session.commit()
    db_session.refresh(workflow)

    assert workflow.id is not None
    assert len(workflow.steps) == 1
    assert workflow.steps[0].agent_id == agent.id
    assert workflow.steps[0].agent.name == "Planner"


def test_deleting_workflow_cascades_steps(db_session):
    agent = Agent(name="Researcher", description="d", system_instructions="s")
    db_session.add(agent)
    db_session.commit()

    workflow = Workflow(name="Research", description="d")
    workflow.steps.append(WorkflowStep(agent_id=agent.id, step_order=1))
    db_session.add(workflow)
    db_session.commit()
    workflow_id = workflow.id

    db_session.delete(workflow)
    db_session.commit()

    remaining_steps = (
        db_session.query(WorkflowStep).filter_by(workflow_id=workflow_id).all()
    )
    assert remaining_steps == []


def test_workflow_run_and_execution_relationship(db_session):
    agent = Agent(name="Writer", description="d", system_instructions="s")
    db_session.add(agent)
    workflow = Workflow(name="Research")
    db_session.add(workflow)
    db_session.commit()

    run = WorkflowRun(workflow_id=workflow.id, input="do the thing", status="running")
    db_session.add(run)
    db_session.commit()

    execution = AgentExecution(
        workflow_run_id=run.id,
        agent_id=agent.id,
        step_order=1,
        input="do the thing",
        status="completed",
        output="done",
        started_at=datetime.now(timezone.utc),
        completed_at=datetime.now(timezone.utc),
    )
    run.executions.append(execution)
    db_session.commit()
    db_session.refresh(run)

    assert len(run.executions) == 1
    assert run.executions[0].output == "done"
    assert run.executions[0].agent.name == "Writer"
