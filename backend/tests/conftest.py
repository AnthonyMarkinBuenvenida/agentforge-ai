import os

TEST_DB_FILENAME = "test_agentforge.db"
os.environ["DATABASE_URL"] = f"sqlite:///{TEST_DB_FILENAME}"

import pytest  # noqa: E402
from fastapi.testclient import TestClient  # noqa: E402

from app.db import Base, SessionLocal, engine  # noqa: E402
from app.main import app  # noqa: E402

# The imports above trigger app.config's load_dotenv(), which may load real provider
# API keys from backend/.env. Strip them here (after load_dotenv has already run, so
# it can't refill them) so every test exercises DemoProvider, never a real Gemini or
# Anthropic API call, regardless of what's in a developer's local .env.
os.environ.pop("GEMINI_API_KEY", None)
os.environ.pop("ANTHROPIC_API_KEY", None)


@pytest.fixture(autouse=True)
def _fresh_database():
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture()
def db_session():
    session = SessionLocal()
    try:
        yield session
    finally:
        session.close()


@pytest.fixture()
def client():
    with TestClient(app) as test_client:
        yield test_client


def pytest_sessionfinish(session, exitstatus):
    engine.dispose()
    if os.path.exists(TEST_DB_FILENAME):
        try:
            os.remove(TEST_DB_FILENAME)
        except PermissionError:
            pass
