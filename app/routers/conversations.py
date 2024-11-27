from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/")
def get_user_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = (
        db.query(Conversation)
        .filter((Conversation.user1_id == current_user.id) | (Conversation.user2_id == current_user.id))
        .all()
    )
    return conversations
