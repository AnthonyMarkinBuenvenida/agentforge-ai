from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.db import get_db
from app.db_models import WorkflowRun
from app.schemas import WorkflowRunOut

router = APIRouter(prefix="/api/runs", tags=["runs"])


@router.get("", response_model=list[WorkflowRunOut])
def list_runs(db: Session = Depends(get_db)):
    return db.query(WorkflowRun).order_by(WorkflowRun.id.desc()).all()


@router.get("/{run_id}", response_model=WorkflowRunOut)
def get_run(run_id: int, db: Session = Depends(get_db)):
    run = db.get(WorkflowRun, run_id)
    if run is None:
        raise HTTPException(status_code=404, detail="Run not found")
    return run
