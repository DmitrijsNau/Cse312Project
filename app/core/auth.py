from datetime import datetime, timedelta
import secrets
from typing import Optional
from fastapi import Cookie, Depends, HTTPException, Response, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User

# TODO: we might want to change this to hours or smth
TOKEN_EXPIRY = 1


def generate_token() -> str:
    return secrets.token_urlsafe(32)


def set_auth_token(db: Session, user: User) -> str:
    token = generate_token()

    user.auth_token = User.hash_token(token)
    user.token_created_at = datetime.now()

    try:
        db.commit()
        return token
    except:
        db.rollback()
        raise HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="Could not set auth token")


def get_user_by_token(db: Session, token: str) -> Optional[User]:
    if not token:
        return None

    users = db.query(User).filter(User.token_created_at > datetime.now() - timedelta(days=TOKEN_EXPIRY)).all()

    for user in users:
        if user.auth_token and User.verify_token(token, user.auth_token):
            return user

    return None


def get_current_user(auth_token: Optional[str] = Cookie(None, alias="auth_token"), db: Session = Depends(get_db)) -> User:
    if not auth_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = get_user_by_token(db, auth_token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid auth token")

    return user


def clear_auth_token(db: Session, user: User):
    user.auth_token = None
    user.token_created_at = None
    db.commit()
