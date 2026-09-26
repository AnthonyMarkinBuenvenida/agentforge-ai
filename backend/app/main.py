from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.agents.providers import get_default_provider_info
from app.config import DEMO_MODE
from app.db import SessionLocal, init_db
from app.factories.academic_research import ensure_academic_research_factory
from app.routers import agents, dashboard, runs, workflows


@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    db = SessionLocal()
    try:
        ensure_academic_research_factory(db)
    finally:
        db.close()
    yield


app = FastAPI(title="AgentForge AI", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(agents.router)
app.include_router(workflows.router)
app.include_router(runs.router)
app.include_router(dashboard.router)


@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": DEMO_MODE, **get_default_provider_info()}
