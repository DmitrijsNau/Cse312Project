from fastapi import APIRouter, Depends, HTTPException, status, Response
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.user import authenticate_user, create_user
from app.core.auth import set_auth_token, get_current_user, clear_auth_token
from app.models.user import UserCreate, User

router = APIRouter(tags=["auth"])


@router.post("/register")
def register(user: UserCreate, db: Session = Depends(get_db)):
    db_user = create_user(db, user.username, user.password)
    if db_user is None:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="username already registered")
    return {"message": "User created successfully", "user_id": db_user.id}


@router.post("/login")
def login(response: Response, username: str, password: str, db: Session = Depends(get_db)):
    user = authenticate_user(db, username, password)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Incorrect username or password")

    token = set_auth_token(db, user)

    # Set cookie with token
    response.set_cookie(key="auth_token", value=token, httponly=True, max_age=60 * 60 * 24)  # AO 2 Security - 1 day expiry

    return {"message": "Successfully logged in"}


@router.post("/logout")
def logout(response: Response, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # clear token in db
    clear_auth_token(db, current_user)

    # clears token in cookeis
    response.delete_cookie(key="auth_token")

    return {"message": "Successfully logged out"}


@router.get("/status")
def check_auth_status(current_user: User = Depends(get_current_user)):
    return {"authenticated": True, "username": current_user.username}
