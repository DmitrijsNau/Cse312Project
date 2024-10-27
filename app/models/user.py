from app.models.base import Base
from sqlalchemy import Column, Integer, String, DateTime
from sqlalchemy.orm import relationship
from passlib.context import CryptContext
from pydantic import BaseModel

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, autoincrement=True)
    name = Column(String, nullable=False)
    username = Column(String, nullable=False, unique=True)
    hashed_password = Column(String, nullable=False)
    auth_token = Column(String, nullable=True)
    token_created_at = Column(DateTime, nullable=True)

    pets = relationship("Pet", back_populates="owner", cascade="all, delete-orphan")

    @staticmethod
    def verify_password(plain_password, hashed_password):
        return pwd_context.verify(plain_password, hashed_password)

    @staticmethod
    def get_password_hash(password):
        return pwd_context.hash(password)

    @staticmethod
    def hash_token(token: str) -> str:
        return pwd_context.hash(token)

    @staticmethod
    def verify_token(plain_token: str, hashed_token: str) -> bool:
        return pwd_context.verify(plain_token, hashed_token)


class UserCreate(BaseModel):
    name: str
    username: str
    password: str
