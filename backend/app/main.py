from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from .database import engine, Base
from .routers import auth, customers, gifts, redemptions, dashboard

# Create tables (used in dev; in production use Alembic)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="LoyaltyHub API",
    description="Internal Staff Loyalty Management System",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
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
