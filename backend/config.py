from pathlib import Path
import os

# Base paths
BASE_DIR = Path(__file__).parent
DATA_DIR = BASE_DIR.parent / "data"
DDINTER_PATH = DATA_DIR / "ddinter.csv"
AUDIT_CHAIN_PATH = DATA_DIR / "audit_chain.json"

# Create data dir if not exists
DATA_DIR.mkdir(exist_ok=True)

# API Keys
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY", "")
GEMINI_API_KEY = "AIzaSyDYIyq9w1eUhvDfGltnagzCBNqF9jT-wis"  # User's Gemini API key

# Graph ML
EMBEDDING_DIM = 64
WALK_LENGTH = 30
NUM_WALKS = 200
WORKERS = 4
