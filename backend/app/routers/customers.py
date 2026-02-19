from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_staff

router = APIRouter(prefix="/customers", tags=["customers"])


@router.post("", response_model=schemas.CustomerOut, status_code=201)
def create_customer(
    data: schemas.CustomerCreate,
    db: Session = Depends(get_db),
    _: models.Staff = Depends(get_current_staff),
):
    existing = db.query(models.Customer).filter(models.Customer.phone_number == data.phone_number).first()
    if existing:
        raise HTTPException(400, "Phone number already registered")
    c = models.Customer(**data.model_dump())
    db.add(c)
    db.commit()
    db.refresh(c)
    return c


@router.get("", response_model=List[schemas.CustomerOut])
def list_customers(
    search: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: models.Staff = Depends(get_current_staff),
):
    q = db.query(models.Customer)
    if search:
        q = q.filter(
            models.Customer.full_name.ilike(f"%{search}%") |
            models.Customer.phone_number.ilike(f"%{search}%")
        )
    return q.order_by(models.Customer.created_at.desc()).all()


@router.get("/{customer_id}", response_model=schemas.CustomerOut)
def get_customer(customer_id: str, db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    c = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Customer not found")
    return c


@router.put("/{customer_id}", response_model=schemas.CustomerOut)
def update_customer(
    customer_id: str,
    data: schemas.CustomerUpdate,
    db: Session = Depends(get_db),
    _: models.Staff = Depends(get_current_staff),
):
    c = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Customer not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(c, field, value)
    db.commit()
    db.refresh(c)
    return c


@router.delete("/{customer_id}", status_code=204)
def delete_customer(customer_id: str, db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    c = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Customer not found")
    db.delete(c)
    db.commit()


@router.post("/{customer_id}/add-points", response_model=schemas.CustomerOut)
def add_points(
    customer_id: str,
    data: schemas.PointsRequest,
    db: Session = Depends(get_db),
    staff: models.Staff = Depends(get_current_staff),
):
    c = db.query(models.Customer).filter(models.Customer.id == customer_id).with_for_update().first()
    if not c:
        raise HTTPException(404, "Customer not found")
    if data.amount <= 0:
        raise HTTPException(400, "Amount must be positive")
    c.total_points += data.amount
    tx = models.PointTransaction(
        customer_id=customer_id,
        staff_id=staff.id,
        type="earn",
        amount=data.amount,
        description=data.description,
    )
    db.add(tx)
    db.commit()
    db.refresh(c)
    return c


@router.post("/{customer_id}/deduct-points", response_model=schemas.CustomerOut)
def deduct_points(
    customer_id: str,
    data: schemas.PointsRequest,
    db: Session = Depends(get_db),
    staff: models.Staff = Depends(get_current_staff),
):
    c = db.query(models.Customer).filter(models.Customer.id == customer_id).with_for_update().first()
    if not c:
        raise HTTPException(404, "Customer not found")
    if data.amount <= 0:
        raise HTTPException(400, "Amount must be positive")
    if c.total_points < data.amount:
        raise HTTPException(400, "Insufficient points")
    c.total_points -= data.amount
    tx = models.PointTransaction(
        customer_id=customer_id,
        staff_id=staff.id,
        type="manual_adjust",
        amount=-data.amount,
        description=data.description,
    )
    db.add(tx)
    db.commit()
    db.refresh(c)
    return c


@router.get("/{customer_id}/transactions", response_model=List[schemas.TransactionOut])
def get_transactions(customer_id: str, db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    c = db.query(models.Customer).filter(models.Customer.id == customer_id).first()
    if not c:
        raise HTTPException(404, "Customer not found")
    return db.query(models.PointTransaction).filter(
        models.PointTransaction.customer_id == customer_id
    ).order_by(models.PointTransaction.created_at.desc()).all()
