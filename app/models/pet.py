from typing import List, Optional

from pydantic import BaseModel
from sqlalchemy import ARRAY, Column, ForeignKey, Integer, String
from sqlalchemy.orm import relationship

from app.models.base import Base


class Pet(Base):
    __tablename__ = "pets"
    id = Column(Integer, primary_key=True, autoincrement=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    name = Column(String, nullable=False)
    bio = Column(String, nullable=True)
    breed = Column(String, nullable=True)
    likes = Column(ARRAY(Integer), server_default="{}", nullable=False)
    image_url = Column(String, nullable=True)

    owner = relationship("User", back_populates="pets")

    def get_like_count(self) -> int:
        return len(self.likes) if self.likes else 0

    def add_like(self, user_id: int) -> bool:
        if user_id not in self.likes:
            self.likes = self.likes + [user_id]
            return True
        return False

    def remove_like(self, user_id: int) -> bool:
        if user_id in self.likes:
            self.likes = [uid for uid in self.likes if uid != user_id]
            return True
        return False


class PetBase(BaseModel):
    name: str
    bio: Optional[str] = None
    breed: str
    image_url: Optional[str] = None


class PetResponse(PetBase):
    id: int
    like_count: int
    likes: List[int]
    owner_username: str

    class Config:
        from_attributes = True
