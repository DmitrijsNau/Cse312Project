from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session, joinedload

from app.core.db import get_db
from app.models.user import User
from app.models.conversation import Conversation
from app.models.message import Message
from app.core.auth import get_current_user

router = APIRouter()


@router.get("/get-all")
def get_user_conversations(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    conversations = (
        db.query(Conversation)
        .options(
            joinedload(Conversation.messages),
            joinedload(Conversation.user1),
            joinedload(Conversation.user2),
        )
        .filter((Conversation.user1_id == current_user.id) | (Conversation.user2_id == current_user.id))
        .all()
    )

    # Prepare the conversations with 'other_user' field
    for conversation in conversations:
        conversation.recipient_username = (
            conversation.user2.username if conversation.user1_id == current_user.id else conversation.user1.username
        )
    del conversation.user1
    del conversation.user2
    return conversations


@router.post("/create")
def create_conversation(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    # check if conversation already exists
    conversation = (
        db.query(Conversation)
        .filter(
            ((Conversation.user1_id == current_user.id) & (Conversation.user2_id == user_id))
            | ((Conversation.user1_id == user_id) & (Conversation.user2_id == current_user.id))
        )
        .first()
    )
    if conversation:
        return conversation
    conversation = Conversation(user1_id=current_user.id, user2_id=user_id)
    db.add(conversation)
    db.commit()
    return conversation
