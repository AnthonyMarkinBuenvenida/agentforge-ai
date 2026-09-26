from datetime import datetime, timezone
from typing import Optional

from sqlalchemy.orm import Session

from app.agents.models import AgentConfig
from app.agents.providers import get_default_provider
from app.agents.runner import AgentRunner
from app.db_models import Agent, AgentExecution, Workflow, WorkflowRun, WorkflowStep
from app.factories.academic_research import RESEARCHER_NAME
from app.knowledge_base import registry as tool_registry


def _utcnow() -> datetime:
    return datetime.now(timezone.utc)


class WorkflowRunner:
    """Executes a Workflow's steps in order, passing each step's output into the next."""

    def __init__(self, db: Session, agent_runner: Optional[AgentRunner] = None) -> None:
        self.db = db
        self.agent_runner = agent_runner or AgentRunner(get_default_provider())

    def run(self, workflow: Workflow, user_input: str) -> WorkflowRun:
        run = WorkflowRun(
            workflow_id=workflow.id,
            input=user_input,
            status="running",
            started_at=_utcnow(),
        )
        self.db.add(run)
        self.db.commit()
        self.db.refresh(run)

        step_input = user_input
        for step in workflow.steps:
            agent = step.agent
            step_input = self._augment_input(agent, step_input)
            execution = self._run_step(run, step, agent, step_input)
            self.db.add(execution)
            self.db.commit()
            self.db.refresh(execution)

            if execution.status == "failed":
                run.status = "failed"
                run.error = execution.error
                run.completed_at = _utcnow()
                self.db.commit()
                self.db.refresh(run)
                return run

            step_input = execution.output

        run.status = "completed"
        run.final_output = step_input
        run.completed_at = _utcnow()
        self.db.commit()
        self.db.refresh(run)
        return run

    def _augment_input(self, agent: Agent, step_input: str) -> str:
        if agent.name == RESEARCHER_NAME:
            tool = tool_registry.get("knowledge_base_search")
            findings = tool.func(step_input)
            return f"{step_input}\n\nKnowledge base findings:\n{findings}"
        return step_input

    def _run_step(
        self, run: WorkflowRun, step: WorkflowStep, agent: Agent, step_input: str
    ) -> AgentExecution:
        config = AgentConfig(
            name=agent.name,
            description=agent.description,
            system_instructions=agent.system_instructions,
            model=agent.model,
        )
        started_at = _utcnow()
        result = self.agent_runner.run(config, step_input)
        return AgentExecution(
            workflow_run_id=run.id,
            agent_id=agent.id,
            step_order=step.step_order,
            input=step_input,
            output=result.output,
            status="completed" if result.success else "failed",
            started_at=started_at,
            completed_at=_utcnow(),
            error=result.error,
        )
