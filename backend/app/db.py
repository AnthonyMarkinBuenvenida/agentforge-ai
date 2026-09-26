from sqlalchemy import create_engine
from sqlalchemy.orm import DeclarativeBase, sessionmaker

from app.config import DATABASE_URL


def connect_args_for(database_url: str) -> dict:
    """SQLite needs same-thread checking disabled for FastAPI's threaded request handling; other databases (e.g. Postgres) need no special connect args."""
    return {"check_same_thread": False} if database_url.startswith("sqlite") else {}


engine = create_engine(DATABASE_URL, connect_args=connect_args_for(DATABASE_URL))
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


class Base(DeclarativeBase):
    pass


def init_db() -> None:
    from app import db_models  # noqa: F401  (registers tables on Base.metadata)

    Base.metadata.create_all(bind=engine)


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
