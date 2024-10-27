from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.pet import Pet, PetResponse
from app.models.response import Response


def get_pet(db: Session, pet_id: int) -> Optional[Pet]:
    return db.query(Pet).filter(Pet.id == pet_id).first()


def get_all_pets(db: Session, skip: int = 0, limit: int = 100) -> List[Pet]:
    return db.query(Pet).offset(skip).limit(limit).all()


def create_pet(db: Session, pet_data: dict, owner_id: int) -> Response:
    db_pet = Pet(**pet_data, owner_id=owner_id)
    db.add(db_pet)
    try:
        db.commit()
        db.refresh(db_pet)
        pet_like_count = db_pet.get_like_count()
        pet_response = PetResponse(
            name=db_pet.name,
            bio=db_pet.bio,
            breed=db_pet.breed,
            id=db_pet.id,
            owner_id=db_pet.owner_id,
            like_count=pet_like_count,
            likes=db_pet.likes,
        )
        return Response(message="Successfully created new pet", data=pet_response, err=False, status_code=201)
    except Exception as e:
        db.rollback()
        return Response(message=str(e), err=True, status_code=500)


def delete_pet(db: Session, pet_id: int, owner_id: int) -> bool:
    pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == owner_id).first()
    if pet:
        db.delete(pet)
        db.commit()
        return True
    return False


def toggle_like(db: Session, pet_id: int, user_id: int) -> Optional[bool]:
    pet = get_pet(db, pet_id)
    if not pet:
        return None

    if user_id in pet.likes:
        result = pet.remove_like(user_id)
    else:
        result = pet.add_like(user_id)

    if result:
        db.commit()
    return result
