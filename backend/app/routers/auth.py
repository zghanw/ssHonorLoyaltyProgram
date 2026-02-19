from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from ..database import get_db
from .. import models, schemas
from ..auth import verify_password, create_access_token, get_current_staff

router = APIRouter(prefix="/auth", tags=["auth"])


@router.post("/login", response_model=schemas.Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    staff = db.query(models.Staff).filter(models.Staff.username == form_data.username).first()
    if not staff or not verify_password(form_data.password, staff.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
        )
    token = create_access_token({"sub": staff.username, "role": staff.role})
    return {"access_token": token, "token_type": "bearer"}


@router.get("/me", response_model=schemas.StaffOut)
def me(current_staff: models.Staff = Depends(get_current_staff)):
    return current_staff
