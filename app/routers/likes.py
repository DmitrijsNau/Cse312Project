from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.core.db import get_db
from app.core.auth import get_current_user
from app.core.pet import get_pet, toggle_like
from app.models.user import User



router = APIRouter(
    tags=["likes"]
)




#function to like or unlike
@router.post("/{pet_id}")
async def change_status(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    

    result = toggle_like(db, pet_id, current_user.id)
    
    if result is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet - Not Found"
        )
    
    action = "unliked" if current_user.id in get_pet(db, pet_id).likes else "liked"


    return {"message": f"Pet {action} "}



#function to get like count on a pet
@router.get("/{pet_id}/count")
async def pet_like_count(
    pet_id: int,
    db: Session = Depends(get_db)
):
    

    pet = get_pet(db, pet_id)
    if not pet:


        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet - Not Found"
        )
    

    return {"likes_count": pet.get_like_count()}


#function to check if liked already
@router.get("/{pet_id}/liked")
async def like_check(
    pet_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    

    pet = get_pet(db, pet_id)
    if not pet:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Pet - Not   Found"
        )
    
    
    return {"liked": current_user.id in pet.likes}