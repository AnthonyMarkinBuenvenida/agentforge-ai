from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.db_models import Agent, Workflow, WorkflowStep
from app.schemas import WorkflowCreate, WorkflowOut, WorkflowStepIn, WorkflowUpdate

router = APIRouter(prefix="/api/workflows", tags=["workflows"])


def _validate_agent_ids(steps: list[WorkflowStepIn], db: Session) -> None:
    for step in steps:
        if db.get(Agent, step.agent_id) is None:
            raise HTTPException(
                status_code=400,
                detail=f"Agent {step.agent_id} does not exist",
            )


@router.get("", response_model=list[WorkflowOut])
def list_workflows(db: Session = Depends(get_db)):
    return db.query(Workflow).order_by(Workflow.id).all()


@router.post("", response_model=WorkflowOut, status_code=201)
def create_workflow(payload: WorkflowCreate, db: Session = Depends(get_db)):
    _validate_agent_ids(payload.steps, db)
    workflow = Workflow(name=payload.name, description=payload.description)
    workflow.steps = [
        WorkflowStep(agent_id=step.agent_id, step_order=step.step_order)
        for step in payload.steps
    ]
    db.add(workflow)
    db.commit()
    db.refresh(workflow)
    return workflow


@router.get("/{workflow_id}", response_model=WorkflowOut)
def get_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.get(Workflow, workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    return workflow


@router.put("/{workflow_id}", response_model=WorkflowOut)
def update_workflow(workflow_id: int, payload: WorkflowUpdate, db: Session = Depends(get_db)):
    workflow = db.get(Workflow, workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    _validate_agent_ids(payload.steps, db)
    workflow.name = payload.name
    workflow.description = payload.description
    workflow.updated_at = datetime.now(timezone.utc)
    workflow.steps = [
        WorkflowStep(agent_id=step.agent_id, step_order=step.step_order)
        for step in payload.steps
    ]
    db.commit()
    db.refresh(workflow)
    return workflow


@router.delete("/{workflow_id}", status_code=204)
def delete_workflow(workflow_id: int, db: Session = Depends(get_db)):
    workflow = db.get(Workflow, workflow_id)
    if workflow is None:
        raise HTTPException(status_code=404, detail="Workflow not found")
    db.delete(workflow)
    db.commit()
    return None
