import uuid
from datetime import datetime
from sqlalchemy import Column, String, Integer, Text, DateTime, ForeignKey, Enum
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from .database import Base


def new_uuid():
    return str(uuid.uuid4())


class Staff(Base):
    __tablename__ = "staff"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    username      = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role          = Column(Enum("admin", "staff", name="staff_role"), default="staff")
    created_at    = Column(DateTime, default=datetime.utcnow)

    transactions  = relationship("PointTransaction", back_populates="staff")
    redemptions   = relationship("Redemption", back_populates="staff")


class Customer(Base):
    __tablename__ = "customers"

    id            = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    full_name     = Column(String(200), nullable=False)
    phone_number  = Column(String(30), unique=True, nullable=False, index=True)
    email         = Column(String(200), nullable=True)
    total_points  = Column(Integer, default=0, nullable=False)
    created_at    = Column(DateTime, default=datetime.utcnow)

    transactions  = relationship("PointTransaction", back_populates="customer", cascade="all, delete-orphan")
    redemptions   = relationship("Redemption", back_populates="customer", cascade="all, delete-orphan")


class PointTransaction(Base):
    __tablename__ = "point_transactions"

    id          = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    customer_id = Column(UUID(as_uuid=False), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    staff_id    = Column(UUID(as_uuid=False), ForeignKey("staff.id"), nullable=False)
    type        = Column(Enum("earn", "redeem", "manual_adjust", name="transaction_type"), nullable=False)
    amount      = Column(Integer, nullable=False)
    description = Column(Text, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    customer    = relationship("Customer", back_populates="transactions")
    staff       = relationship("Staff", back_populates="transactions")


class Gift(Base):
    __tablename__ = "gifts"

    id              = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    name            = Column(String(200), nullable=False)
    description     = Column(Text, nullable=True)
    points_required = Column(Integer, nullable=False)
    stock           = Column(Integer, default=0, nullable=False)
    created_at      = Column(DateTime, default=datetime.utcnow)

    redemptions     = relationship("Redemption", back_populates="gift")


class Redemption(Base):
    __tablename__ = "redemptions"

    id          = Column(UUID(as_uuid=False), primary_key=True, default=new_uuid)
    customer_id = Column(UUID(as_uuid=False), ForeignKey("customers.id", ondelete="CASCADE"), nullable=False)
    gift_id     = Column(UUID(as_uuid=False), ForeignKey("gifts.id"), nullable=False)
    staff_id    = Column(UUID(as_uuid=False), ForeignKey("staff.id"), nullable=False)
    points_used = Column(Integer, nullable=False)
    created_at  = Column(DateTime, default=datetime.utcnow)

    customer    = relationship("Customer", back_populates="redemptions")
    gift        = relationship("Gift", back_populates="redemptions")
    staff       = relationship("Staff", back_populates="redemptions")
