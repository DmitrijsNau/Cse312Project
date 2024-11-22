from fastapi import (APIRouter, Depends, File, Form, HTTPException, UploadFile,
                     status)
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session

from app.core.auth import get_current_user
from app.core.db import get_db
from app.core.pet import create_pet, delete_pet, get_pet, read_all_pets
from app.models.pet import Pet, PetResponse
from app.models.response import Response
from app.models.user import User

router = APIRouter(tags=["pets"])


@router.post("/create", response_model=Response)
async def create_new_pet(
    name: str = Form(...),
    bio: str = Form(None),
    breed: str = Form(...),
    image: UploadFile = File(...),
    db: Session = Depends(get_db),
    author: User = Depends(get_current_user),
):
    allowed_file_types = ["image/png", "image/jpeg", "image/jpg"]
    if image.content_type not in allowed_file_types:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid file type. Must be .png, .jpeg, .jpg")
    try:
        pet_data = {"name": name, "bio": bio, "breed": breed}
        response = create_pet(db, pet_data, author.id, image)
        return JSONResponse(content=response.model_dump(), status_code=response.status_code)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))

@router.get("/my-pets", response_model=Response)
async def get_my_pets(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        user_pets = db.query(Pet).filter(Pet.owner_id == current_user.id).all()
        pet_list_response = []
        for pet in user_pets:
            pet_list_response.append(
                PetResponse(
                    name=pet.name,
                    bio=pet.bio,
                    breed=pet.breed,
                    id=pet.id,
                    owner_username=current_user.username,
                    like_count=pet.get_like_count(),
                    likes=pet.likes,
                    image=pet.image_url,
                )
            )
        return Response(data=pet_list_response, err=False, status_code=200)
    except Exception as e:
        return Response(message=str(e), err=True, status_code=500)


@router.get("/by-id", response_model=PetResponse)
async def read_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = get_pet(db, pet_id)
    if pet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.get("/get-all", response_model=Response)
def get_all_pets(db: Session = Depends(get_db)):
    response = read_all_pets(db)
    return JSONResponse(content=response.model_dump(), status_code=response.status_code)

@router.delete("/{pet_id}", response_model=Response)
async def delete_pet_endpoint(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    try:
        result = delete_pet(db, pet_id, current_user.id)
        if result:
            return Response(message="Pet deleted successfully", err=False, status_code=200)
        else:
            return Response(message="Pet not found or you don't have permission to delete it", err=True, status_code=404)
    except Exception as e:
        return Response(message=str(e), err=True, status_code=500)
