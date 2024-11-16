import os
import uuid
import shutil

from fastapi import UploadFile
from sqlalchemy.orm import Session, joinedload
from typing import Optional
from app.models.pet import Pet, PetResponse
from app.models.response import Response
from app.core.config import config


def get_pet(db: Session, pet_id: int) -> Optional[Pet]:
    return db.query(Pet).filter(Pet.id == pet_id).first()


def read_all_pets(db: Session):
    pets = db.query(Pet).options(joinedload(Pet.owner)).all()
    pet_list_response = []
    for pet in pets:
        pet_list_response.append(
            PetResponse(
                name=pet.name,
                bio=pet.bio,
                breed=pet.breed,
                id=pet.id,
                owner_username=pet.owner.username,
                like_count=pet.get_like_count(),
                likes=pet.likes,
                image=pet.image_url,
            )
        )
    return Response(data=pet_list_response, err=False, status_code=200)


def create_pet(db: Session, pet_data: dict, owner_id: int, image: UploadFile) -> Response:
    image_filename = uuid.uuid4().hex
    image_path = config.FRONTEND_BUILD_DIR + f"{image_filename}.{image.content_type.split('/')[1]}"
    with open(image_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    pet_data["image_url"] = image_path
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
            owner_username=db_pet.owner.username,
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
