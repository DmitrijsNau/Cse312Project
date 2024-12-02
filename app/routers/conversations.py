from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session, joinedload

from app.core.auth import get_current_user
from app.core.conversations import (get_available_users_for_chat,
                                    get_or_create_conversation)
from app.core.db import get_db
from app.models.conversation import Conversation
from app.models.user import User

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

    formatted_conversations = []
    for conversation in conversations:
        formatted_conv = {
            "id": conversation.id,
            "recipient_username": conversation.user2.username if conversation.user1_id == current_user.id else conversation.user1.username,
            "messages": [
                {
                    "id": msg.id,
                    "content": msg.content,
                    "sender_id": msg.sender_id,
                    "sender_username": msg.sender_username,
                    "timestamp": msg.timestamp
                }
                for msg in conversation.messages
            ] if conversation.messages else []
        }
        formatted_conversations.append(formatted_conv)

    return formatted_conversations

@router.post("/create")
def create_conversation(user_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        conversation = get_or_create_conversation(db, current_user.id, user_id)
        return conversation
    except Exception as e:
        print(e, flush=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )

@router.get("/available-users")
def get_available_chat_users(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    try:
        users = get_available_users_for_chat(db, current_user.id)
        return [{"id": user.id, "username": user.username} for user in users]
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e)
        )
