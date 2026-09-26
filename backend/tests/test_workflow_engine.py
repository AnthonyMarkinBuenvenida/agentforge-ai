from app.agents.models import AgentConfig, AgentContext
from app.agents.providers import AIProvider, DemoProvider
from app.agents.runner import AgentRunner
from app.db_models import Agent, Workflow, WorkflowStep
from app.workflow_engine import WorkflowRunner


def _make_workflow(db_session, agent_names):
    agents = []
    for name in agent_names:
        agent = Agent(
            name=name,
            description=f"{name} agent",
            system_instructions=f"You are {name}.",
        )
        db_session.add(agent)
        agents.append(agent)
    db_session.commit()

    workflow = Workflow(name="Test Workflow")
    workflow.steps = [
        WorkflowStep(agent_id=agent.id, step_order=index + 1)
        for index, agent in enumerate(agents)
    ]
    db_session.add(workflow)
    db_session.commit()
    db_session.refresh(workflow)
    return workflow


class FailingProvider(AIProvider):
    def generate(self, config: AgentConfig, context: AgentContext) -> str:
        raise RuntimeError("simulated failure")


def test_workflow_executes_steps_in_order(db_session):
    workflow = _make_workflow(db_session, ["First", "Second", "Third"])
    runner = WorkflowRunner(db_session, agent_runner=AgentRunner(DemoProvider()))

    run = runner.run(workflow, "Initial request")

    assert [execution.agent.name for execution in run.executions] == [
        "First",
        "Second",
        "Third",
    ]
    assert [execution.step_order for execution in run.executions] == [1, 2, 3]


def test_workflow_passes_output_between_agents(db_session):
    workflow = _make_workflow(db_session, ["First", "Second"])
    runner = WorkflowRunner(db_session, agent_runner=AgentRunner(DemoProvider()))

    run = runner.run(workflow, "Initial request")

    first, second = run.executions
    assert second.input == first.output


def test_workflow_run_completes_successfully(db_session):
    workflow = _make_workflow(db_session, ["First", "Second"])
    runner = WorkflowRunner(db_session, agent_runner=AgentRunner(DemoProvider()))

    run = runner.run(workflow, "Initial request")

    assert run.status == "completed"
    assert run.error is None
    assert run.completed_at is not None
    assert run.final_output == run.executions[-1].output


def test_workflow_stops_cleanly_on_failed_step(db_session):
    workflow = _make_workflow(db_session, ["First", "Second"])
    runner = WorkflowRunner(db_session, agent_runner=AgentRunner(FailingProvider()))

    run = runner.run(workflow, "Initial request")

    assert run.status == "failed"
    assert run.error == "simulated failure"
    assert len(run.executions) == 1
    assert run.executions[0].status == "failed"


def test_execution_records_store_expected_fields(db_session):
    workflow = _make_workflow(db_session, ["First"])
    runner = WorkflowRunner(db_session, agent_runner=AgentRunner(DemoProvider()))

    run = runner.run(workflow, "Initial request")
    execution = run.executions[0]

    assert execution.status == "completed"
    assert execution.input == "Initial request"
    assert execution.output is not None
    assert execution.error is None
    assert execution.started_at is not None
    assert execution.completed_at is not None
