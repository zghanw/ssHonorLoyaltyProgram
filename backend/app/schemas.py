from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel, EmailStr


# ─── Auth ───────────────────────────────────────────────
class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"


# ─── Staff ──────────────────────────────────────────────
class StaffCreate(BaseModel):
    username: str
    password: str
    role: str = "staff"


class StaffOut(BaseModel):
    id: str
    username: str
    role: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Customer ───────────────────────────────────────────
class CustomerCreate(BaseModel):
    full_name: str
    phone_number: str
    email: Optional[str] = None


class CustomerUpdate(BaseModel):
    full_name: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None


class CustomerOut(BaseModel):
    id: str
    full_name: str
    phone_number: str
    email: Optional[str]
    total_points: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Points ─────────────────────────────────────────────
class PointsRequest(BaseModel):
    amount: int
    description: str


# ─── Gift ───────────────────────────────────────────────
class GiftCreate(BaseModel):
    name: str
    description: Optional[str] = None
    points_required: int
    stock: int


class GiftUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    points_required: Optional[int] = None
    stock: Optional[int] = None


class GiftOut(BaseModel):
    id: str
    name: str
    description: Optional[str]
    points_required: int
    stock: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Redemption ─────────────────────────────────────────
class RedemptionCreate(BaseModel):
    customer_id: str
    gift_id: str


class RedemptionOut(BaseModel):
    id: str
    customer_id: str
    gift_id: str
    staff_id: str
    points_used: int
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Transaction ────────────────────────────────────────
class TransactionOut(BaseModel):
    id: str
    customer_id: str
    staff_id: str
    type: str
    amount: int
    description: str
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Dashboard ──────────────────────────────────────────
class DashboardStats(BaseModel):
    total_customers: int
    total_points_issued: int
    total_redemptions: int
    active_gifts: int
