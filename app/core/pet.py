import imghdr
import os
import uuid
from typing import Optional

from fastapi import HTTPException, UploadFile, status, Cookie
from sqlalchemy.orm import Session, joinedload

from app.core.config import config
from app.models.pet import Pet, PetResponse
from app.models.response import Response
from app.core.auth import get_user_by_token

ALLOWED_IMAGE_TYPES = {"jpeg", "png", "gif"}  # TODO: maybe move this to config


def validate_image(file_content: bytes) -> str:
    image_type = imghdr.what(None, file_content)  # This will give us the file signature

    if not image_type or image_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Invalid image format. Allowed formats: {', '.join(ALLOWED_IMAGE_TYPES)}",
        )

    return image_type


def save_pet_image(image_file, filename: str) -> str:
    content = image_file.file.read()

    image_type = validate_image(content)

    image_file.file.seek(0)

    image_filename = f"{filename}.{image_type}"
    image_path = os.path.join(config.UPLOAD_DIR, image_filename)

    with open(image_path, "wb") as buffer:
        buffer.write(content)

    return f"{config.IMAGES_PATH}/{image_filename}"


def get_pet(db: Session, pet_id: int) -> Optional[Pet]:
    return db.query(Pet).filter(Pet.id == pet_id).first()


def read_all_pets(db: Session, user_auth_token: str):
    if not user_auth_token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    user = get_user_by_token(db, user_auth_token)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid authentication token")

    pets = db.query(Pet).options(joinedload(Pet.owner)).all()
    pet_list_response = []
    for pet in pets:
        if pet.owner_id != user.id:
            pet_list_response.append(
                PetResponse(
                    name=pet.name,
                    bio=pet.bio,
                    breed=pet.breed,
                    id=pet.id,
                    owner_username=pet.owner.username,
                    like_count=pet.get_like_count(),
                    likes=pet.likes,
                    image_url=pet.image_url,
                )
            )
    return Response(data=pet_list_response, err=False, status_code=200)


def create_pet(db: Session, pet_data: dict, owner_id: int, image: UploadFile = None) -> Response:
    filename = uuid.uuid4().hex

    if image:
        image_url = save_pet_image(image, filename)
        pet_data["image_url"] = image_url
    else:
        pet_data["image_url"] = None

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
            image_url=db_pet.image_url,
        )
        return Response(message="Successfully created new pet", data=pet_response, err=False, status_code=201)
    except Exception as e:
        db.rollback()
        return Response(message=str(e), err=True, status_code=500)


def delete_pet(db: Session, pet_id: int, owner_id: int) -> bool:
    try:
        pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == owner_id).first()

        if not pet:
            return False

        if pet.image_url and os.path.exists(pet.image_url):
            try:
                os.remove(pet.image_url)
            except OSError as e:
                print(f"Error deleting pet image file: {e}")

        db.delete(pet)
        db.commit()

        return True

    except Exception as e:
        db.rollback()
        print(f"Error deleting pet: {e}")
        return False


# def delete_pet(db: Session, pet_id: int, owner_id: int) -> bool:
#     pet = db.query(Pet).filter(Pet.id == pet_id, Pet.owner_id == owner_id).first()
#     if pet:
#         db.delete(pet)
#         db.commit()
#         return True
#     return False


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
