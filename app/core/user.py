from sqlalchemy.orm import Session
from app.models.user import User


def get_user(db: Session, user_id: int):
    return db.query(User).filter(User.id == user_id).first()


def get_user_by_email(db: Session, email: str):
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, name: str, email: str, password: str):
    if get_user_by_email(db, email):
        return None  # user's email already exists
    hashed_password = User.get_password_hash(password)
    db_user = User(name=name, email=email, hashed_password=hashed_password)
    try:
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user
    except Exception as e:
        db.rollback()
        return None


def authenticate_user(db: Session, email: str, password: str):
    user = get_user_by_email(db, email)
    if not user:
        return False
    if not User.verify_password(password, user.hashed_password):
        return False
    return user
