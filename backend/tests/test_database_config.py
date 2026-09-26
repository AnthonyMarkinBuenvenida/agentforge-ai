from sqlalchemy import create_engine

from app.db import connect_args_for


def test_connect_args_for_sqlite_disables_same_thread_check():
    assert connect_args_for("sqlite:///./agentforge.db") == {"check_same_thread": False}


def test_connect_args_for_postgres_is_empty():
    assert connect_args_for("postgresql://user:pass@host/dbname") == {}


def test_postgres_engine_can_be_constructed():
    """Confirms psycopg2 is installed and importable; does not open a real connection."""
    url = "postgresql://user:pass@localhost/dbname"
    engine = create_engine(url, connect_args=connect_args_for(url))
    try:
        assert engine.dialect.name == "postgresql"
    finally:
        engine.dispose()
