from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.message import Message
from app.models.user import User


def save_message(conversation_id: int, content: str, db: Session, current_user: User):
    print("Saving message")
    conversation = db.query(Conversation).filter(Conversation.id == conversation_id).first()
    if not conversation:
        # create a conversation
        print("Creating conversation")
        conversation = Conversation(user1_id=current_user.id, user2_id=conversation_id)
        db.add(conversation)
        db.commit()
        return
    if conversation.user1_id != current_user.id and conversation.user2_id != current_user.id:
        print("User not in conversation")
        return
    print("Saving message")
    message = Message(conversation_id=conversation_id, sender_id=current_user.id, content=content, sender_username=current_user.username)
    db.add(message)
    db.commit()
    return message
