from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import get_current_staff

router = APIRouter(prefix="/gifts", tags=["gifts"])


@router.post("", response_model=schemas.GiftOut, status_code=201)
def create_gift(data: schemas.GiftCreate, db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    g = models.Gift(**data.model_dump())
    db.add(g)
    db.commit()
    db.refresh(g)
    return g


@router.get("", response_model=List[schemas.GiftOut])
def list_gifts(db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    return db.query(models.Gift).order_by(models.Gift.created_at.desc()).all()


@router.put("/{gift_id}", response_model=schemas.GiftOut)
def update_gift(gift_id: str, data: schemas.GiftUpdate, db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    g = db.query(models.Gift).filter(models.Gift.id == gift_id).first()
    if not g:
        raise HTTPException(404, "Gift not found")
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(g, field, value)
    db.commit()
    db.refresh(g)
    return g


@router.delete("/{gift_id}", status_code=204)
def delete_gift(gift_id: str, db: Session = Depends(get_db), _: models.Staff = Depends(get_current_staff)):
    g = db.query(models.Gift).filter(models.Gift.id == gift_id).first()
    if not g:
        raise HTTPException(404, "Gift not found")
    db.delete(g)
    db.commit()
