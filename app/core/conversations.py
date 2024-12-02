from fastapi import HTTPException, status
from sqlalchemy.orm import Session

from app.models.conversation import Conversation
from app.models.pet import Pet
from app.models.user import User


def check_mutual_likes(db: Session, user1_id: int, user2_id: int) -> bool:
    user1_pets = db.query(Pet).filter(Pet.owner_id == user1_id).all()
    user2_pets = db.query(Pet).filter(Pet.owner_id == user2_id).all()
    
    user1_has_likes = any(user2_id in pet.likes for pet in user1_pets)
    user2_has_likes = any(user1_id in pet.likes for pet in user2_pets)
    
    # must be mutually liked1
    return user1_has_likes and user2_has_likes

def get_or_create_conversation(db: Session, user1_id: int, user2_id: int) -> Conversation:
    conversation = (
        db.query(Conversation)
        .filter(
            ((Conversation.user1_id == user1_id) & (Conversation.user2_id == user2_id))
            | ((Conversation.user1_id == user2_id) & (Conversation.user2_id == user1_id))
        )
        .first()
    )
    
    if conversation:
        return conversation
        
    if not check_mutual_likes(db, user1_id, user2_id):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Cannot start conversation without mutual pet likes"
        )
    
    # creates new conversation if necessary
    conversation = Conversation(user1_id=user1_id, user2_id=user2_id)
    db.add(conversation)
    db.commit()
    db.refresh(conversation)
    return conversation

def get_available_users_for_chat(db: Session, current_user_id: int) -> list[User]:
    all_users = db.query(User).filter(User.id != current_user_id).all()
    
    # filter users based on mutual likes, ideally this would be done in database but... oh well.
    available_users = [
        user for user in all_users 
        if check_mutual_likes(db, current_user_id, user.id)
    ]
    
    return available_users
