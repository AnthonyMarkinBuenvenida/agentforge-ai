import os

from dotenv import load_dotenv

load_dotenv()

ANTHROPIC_API_KEY = os.getenv("ANTHROPIC_API_KEY", "")
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")
DEMO_MODE = ANTHROPIC_API_KEY == "" and GEMINI_API_KEY == ""
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./agentforge.db")
