from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import PORTAL_NAME, MUNICIPAL_NAME
from app.database.seed_data import seed_database
from app.routes.agent_routes import router as agent_router
from app.routes.complaints import router as complaints_router
from app.routes.admin import router as admin_router

app = FastAPI(
    title=PORTAL_NAME,
    description="Enterprise Autonomous AI Agent for Civic Grievance Triage, Municipal Routing, and Public Accountability.",
    version="1.0.0"
)

# Enable CORS for frontend applications
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Startup lifecycle: seed database with AMC zones, wards, departments, and seed complaints
@app.on_event("startup")
def on_startup():
    seed_database()
    print(f"[CIVICPULSE] {PORTAL_NAME} initialized for {MUNICIPAL_NAME}.")

# Include API Routers
app.include_router(agent_router)
app.include_router(complaints_router)
app.include_router(admin_router)

@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "service": PORTAL_NAME,
        "municipality": MUNICIPAL_NAME,
        "timestamp": "2026-10-24"
    }

# Mount Frontend static build if present (Unified Single-Port Deployment)
import os
from pathlib import Path
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

frontend_dist = Path(__file__).resolve().parent.parent.parent / "frontend" / "dist"
if frontend_dist.exists():
    assets_dir = frontend_dist / "assets"
    if assets_dir.exists():
        app.mount("/assets", StaticFiles(directory=str(assets_dir)), name="assets")

    @app.get("/{full_path:path}")
    async def serve_react_frontend(full_path: str):
        # Don't intercept API routes or docs
        if full_path.startswith("api") or full_path.startswith("docs") or full_path.startswith("openapi.json"):
            return None
        file_path = frontend_dist / full_path
        if file_path.is_file():
            return FileResponse(file_path)
        return FileResponse(frontend_dist / "index.html")

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)

