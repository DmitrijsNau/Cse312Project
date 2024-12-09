from datetime import datetime
from typing import Optional

from fastapi import (APIRouter, BackgroundTasks, Cookie, Depends, File, Form,
                     HTTPException, UploadFile, status)
from fastapi.responses import JSONResponse
from sqlalchemy.orm import Session, joinedload

from app.core.auth import get_current_user
from app.core.db import get_db
from app.core.pet import (create_pet, delete_pet, get_pet, publish_pet,
                          read_all_pets)
from app.core.ws import manager
from app.models.pet import Pet, PetResponse
from app.models.response import Response
from app.models.user import User

router = APIRouter(tags=["pets"])


@router.post("/create", response_model=Response)
async def create_new_pet(
    background_tasks: BackgroundTasks,
    name: str = Form(...),
    bio: str = Form(None),
    breed: str = Form(...),
    image: Optional[UploadFile] = File(None),
    release_date: Optional[datetime] = Form(None),
    db: Session = Depends(get_db),
    author: User = Depends(get_current_user),
):
    try:
        is_public = release_date is None or release_date <= datetime.now()

        pet_data = {
            "name": name,
            "bio": bio,
            "breed": breed,
            "is_public": is_public,
            "release_date": release_date if not is_public else None,
        }

        response = create_pet(db, pet_data, author.id, image)

        if not response.err and response.data:
            if not is_public:
                background_tasks.add_task(publish_pet, response.data.id, db)
            else:
                await manager.broadcast_new_pet(response.data.dict())

        return JSONResponse(content=response.model_dump(), status_code=response.status_code)

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail="An error occurred while processing the image"
        )


@router.get("/my-pets", response_model=Response)
async def get_my_pets(db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
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
                    image_url=pet.image_url,
                    is_public=pet.is_public,
                )
            )
        return Response(data=pet_list_response, err=False, status_code=200)
    except Exception as e:
        return Response(message=str(e), err=True, status_code=500)


@router.get("/by-id")
def read_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = get_pet(db, pet_id)
    if pet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


# fetch all pets that are not owned by the current user
@router.get("/get-all", response_model=Response)
def get_all_pets(db: Session = Depends(get_db), user_auth_token: str = Cookie(None, alias="auth_token")):
    try:
        response = read_all_pets(db, user_auth_token)
        return JSONResponse(content=response.model_dump(), status_code=response.status_code)
    except Exception as e:
        print(e)


@router.delete("/{pet_id}", response_model=Response)
async def delete_pet_endpoint(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    try:
        result = delete_pet(db, pet_id, current_user.id)
        if result:
            return Response(message="Pet deleted successfully", err=False, status_code=200)
        else:
            return Response(message="Pet not found or you don't have permission to delete it", err=True, status_code=404)
    except Exception as e:
        return Response(message=str(e), err=True, status_code=500)


@router.get("/{pet_id}/matches", response_model=Response)
async def get_pet_matches(pet_id: int, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    pet = get_pet(db, pet_id)
    if not pet or pet.owner_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found or unauthorized")

    matched_users = db.query(User).filter(User.id.in_(pet.likes)).all()
    return Response(data=[{"id": user.id, "username": user.username} for user in matched_users], err=False, status_code=200)


# fetch all pets belonging to a user
@router.get("/by-user")
def get_user_pets(user_id: int, db: Session = Depends(get_db)):
    user_pets = db.query(Pet).filter(Pet.owner_id == user_id).options(joinedload(Pet.owner)).all()
    pets = []
    for pet in user_pets:
        pets.append(
            {
                "name": pet.name,
                "bio": pet.bio,
                "breed": pet.breed,
                "id": pet.id,
                "like_count": pet.get_like_count(),
                "likes": pet.likes,
                "image_url": pet.image_url,
                "owner_username": pet.owner.username,
            }
        )
    print(pets)
    return Response(data=pets, err=False, status_code=200)
