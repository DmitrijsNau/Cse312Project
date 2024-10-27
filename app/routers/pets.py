from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.auth import get_current_user
from app.core.user import User
from app.core.db import get_db
from app.models.pet import Pet
from app.core.pet import get_pet, create_pet, toggle_like
from app.models.pet import PetCreate, PetResponse

router = APIRouter(tags=["pets"])


@router.post("/create", response_model=PetResponse)
async def create_new_pet(pet: PetCreate, db: Session = Depends(get_db), author: User = Depends(get_current_user)):
    try:
        db_pet = create_pet(db, pet.model_dump(), author.id)
        return db_pet
    except Exception as e:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(e))


@router.get("/get-pet-by-id", response_model=PetResponse)
async def read_pet(pet_id: int, db: Session = Depends(get_db)):
    pet = get_pet(db, pet_id)
    if pet is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Pet not found")
    return pet


@router.get("/get_all", response_model=list[PetResponse])
async def get_all_pets(db: Session = Depends(get_db)):
    pets = db.query(Pet).all()
    return pets
