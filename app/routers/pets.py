from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.responses import JSONResponse

from app.core.auth import get_current_user
from app.models.user import User
from app.core.db import get_db
from app.models.pet import Pet
from app.core.pet import get_pet, create_pet, toggle_like, read_all_pets
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
