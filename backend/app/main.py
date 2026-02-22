from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

from .database import engine, Base
from .routers import auth, customers, gifts, redemptions, dashboard

# Create tables (used in dev; in production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LoyaltyHub API",
    description="Internal Staff Loyalty Management System",
    version="1.0.0",
)

import os

allowed_origins = os.getenv("ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173").split(",")

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth.router)
app.include_router(customers.router)
app.include_router(gifts.router)
app.include_router(redemptions.router)
app.include_router(dashboard.router)


@app.get("/health")
def health():
    return {"status": "ok"}

# Serve frontend static files
dist_path = os.path.join(os.path.dirname(__file__), "..", "..", "dist")
if os.path.exists(dist_path):
    # API routes are already handled above. 
    # Mount static files for assets, but we need to handle SPA routing for others.
    app.mount("/assets", StaticFiles(directory=os.path.join(dist_path, "assets")), name="static")
    
    @app.get("/{full_path:path}")
    async def serve_spa(request: Request, full_path: str):
        # If it's an API route that's not found, let it 404
        if full_path.startswith("api/"):
            return {"detail": "Not Found"}, 404
        return FileResponse(os.path.join(dist_path, "index.html"))
