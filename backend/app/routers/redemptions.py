from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_staff

router = APIRouter(tags=["redemptions"])


@router.post("/redeem", response_model=schemas.RedemptionOut, status_code=201)
def redeem_gift(
    data: schemas.RedemptionCreate,
    db: Session = Depends(get_db),
    staff: models.Staff = Depends(get_current_staff),
):
    # Atomic row-level locks
    customer = db.query(models.Customer).filter(models.Customer.id == data.customer_id).with_for_update().first()
    if not customer:
        raise HTTPException(404, "Customer not found")

    gift = db.query(models.Gift).filter(models.Gift.id == data.gift_id).with_for_update().first()
    if not gift:
        raise HTTPException(404, "Gift not found")

    if gift.stock <= 0:
        raise HTTPException(400, "Gift is out of stock")

    if customer.total_points < gift.points_required:
        raise HTTPException(400, "Insufficient points for this gift")

    # Deduct points & stock atomically
    customer.total_points -= gift.points_required
    gift.stock -= 1

    redemption = models.Redemption(
        customer_id=customer.id,
        gift_id=gift.id,
        staff_id=staff.id,
        points_used=gift.points_required,
    )
    db.add(redemption)

    # Always record a transaction
    tx = models.PointTransaction(
        customer_id=customer.id,
        staff_id=staff.id,
        type="redeem",
        amount=-gift.points_required,
        description=f"Redeemed: {gift.name}",
    )
    db.add(tx)

    db.commit()
    db.refresh(redemption)
    return redemption


@router.get("/redemptions", response_model=List[schemas.RedemptionOut])
def list_redemptions(db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    return db.query(models.Redemption).order_by(models.Redemption.created_at.desc()).all()
