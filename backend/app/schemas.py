from datetime import datetime
from typing import Optional

from pydantic import BaseModel, ConfigDict, Field

# --- Agents ---------------------------------------------------------------


class AgentBase(BaseModel):
    name: str
    description: str = ""
    system_instructions: str
    model: str = "claude-sonnet-5"


class AgentCreate(AgentBase):
    pass


class AgentUpdate(AgentBase):
    pass


class AgentOut(AgentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)


# --- Workflows --------------------------------------------------------------


class WorkflowStepIn(BaseModel):
    agent_id: int
    step_order: int


class WorkflowStepOut(BaseModel):
    id: int
    agent_id: int
    step_order: int

    model_config = ConfigDict(from_attributes=True)


class WorkflowBase(BaseModel):
    name: str
    description: str = ""
    steps: list[WorkflowStepIn] = Field(default_factory=list)


class WorkflowCreate(WorkflowBase):
    pass


class WorkflowUpdate(WorkflowBase):
    pass


class WorkflowOut(BaseModel):
    id: int
    name: str
    description: str
    created_at: datetime
    updated_at: datetime
    steps: list[WorkflowStepOut]

    model_config = ConfigDict(from_attributes=True)


# --- Runs ---------------------------------------------------------------


class AgentExecutionOut(BaseModel):
    id: int
    workflow_run_id: int
    agent_id: int
    step_order: int
    input: str
    output: Optional[str]
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    error: Optional[str]

    model_config = ConfigDict(from_attributes=True)


class WorkflowRunOut(BaseModel):
    id: int
    workflow_id: int
    input: str
    status: str
    started_at: Optional[datetime]
    completed_at: Optional[datetime]
    final_output: Optional[str]
    error: Optional[str]
    executions: list[AgentExecutionOut] = Field(default_factory=list)

    model_config = ConfigDict(from_attributes=True)


# --- Dashboard --------------------------------------------------------------


class DashboardStats(BaseModel):
    total_agents: int
    total_workflows: int
    total_runs: int
    completed_runs: int
    failed_runs: int
