from fastapi import APIRouter, Depends
from sqlalchemy import func
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_staff

router = APIRouter(prefix="/dashboard", tags=["dashboard"])


@router.get("/stats", response_model=schemas.DashboardStats)
def get_stats(db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    total_customers = db.query(func.count(models.Customer.id)).scalar()

    total_points_issued = db.query(func.sum(models.PointTransaction.amount)).filter(
        models.PointTransaction.type == "earn"
    ).scalar() or 0

    total_redemptions = db.query(func.count(models.Redemption.id)).scalar()

    active_gifts = db.query(func.count(models.Gift.id)).filter(models.Gift.stock > 0).scalar()

    return schemas.DashboardStats(
        total_customers=total_customers,
        total_points_issued=total_points_issued,
        total_redemptions=total_redemptions,
        active_gifts=active_gifts,
    )
