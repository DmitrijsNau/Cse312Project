from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from app.core.auth import get_current_user
from app.core.user import User
from app.core.db import get_db
from app.models.pet import Pet
from app.core.pet import get_pet, create_pet, toggle_like
from app.models.pet import PetCreate, PetResponse
from app.models.response import Response

router = APIRouter(tags=["pets"])


@router.post("/create", response_model=Response)
async def create_new_pet(pet: PetCreate, db: Session = Depends(get_db), author: User = Depends(get_current_user)):
    try:
        response = create_pet(db, pet.model_dump(), author.id)
        return JSONResponse(content=response.model_dump(), status_code=response.status_code)
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/get-pet-by-id", response_model=PetResponse)
async def read_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = get_pet(db, pet_id)
    if pet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.get("/get-all", response_model=Response)
async def get_all_pets(db: Session = Depends(get_db)):
    pets = db.query(Pet).all()
    pet_list_response = []
    for pet in pets:
        pet_list_response.append(
            PetResponse(
                name=pet.name,
                bio=pet.bio,
                breed=pet.breed,
                id=pet.id,
                owner_id=pet.owner_id,
                like_count=pet.get_like_count(),
                likes=pet.likes,
            )
        )
    return Response(data=pet_list_response, err=False, status_code=200)
