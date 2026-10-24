import os
from pathlib import Path

BASE_DIR = Path(__file__).resolve().parent.parent
DB_PATH = BASE_DIR / "civic_pulse.db"
UPLOADS_DIR = BASE_DIR / "uploads"
UPLOADS_DIR.mkdir(parents=True, exist_ok=True)

# Google GenAI / Gemini API Key (Optional: system works in dual mode)
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

# Municipal Corporation Details
MUNICIPAL_NAME = "Ahmedabad Municipal Corporation (AMC)"
MUNICIPAL_CODE = "AMC"
PORTAL_NAME = "CivicPulse AI - AMC Municipal Grievance Redressal System"

# Social Media Handles for Public Advocacy
OFFICIAL_TWITTER_HANDLE = "AmdavadAMC"
OFFICIAL_MAYOR_HANDLE = "MayorAmdavad"
OFFICIAL_COMMISSIONER_HANDLE = "AMCGujarat"
