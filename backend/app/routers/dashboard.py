from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.db import get_db
from app.db_models import Agent, Workflow, WorkflowRun
from app.schemas import DashboardStats

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=DashboardStats)
def get_stats(db: Session = Depends(get_db)):
    return DashboardStats(
        total_agents=db.query(Agent).count(),
        total_workflows=db.query(Workflow).count(),
        total_runs=db.query(WorkflowRun).count(),
        completed_runs=db.query(WorkflowRun).filter(WorkflowRun.status == "completed").count(),
        failed_runs=db.query(WorkflowRun).filter(WorkflowRun.status == "failed").count(),
    )
