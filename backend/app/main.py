from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import DEMO_MODE

app = FastAPI(title="AgentForge AI")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/health")
def health():
    return {"status": "ok", "demo_mode": DEMO_MODE}
