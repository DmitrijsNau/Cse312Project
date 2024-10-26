from contextlib import asynccontextmanager
from typing import Union
from fastapi.staticfiles import StaticFiles
import os
from fastapi import FastAPI, APIRouter
from app.routers import auth, pets, likes
from app.core.db import init_db

# create databases on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    pass

app = FastAPI(lifespan=lifespan)
router = APIRouter()

app.include_router(auth.router, prefix="/auth")
app.include_router(pets.router, prefix="/pets")
app.include_router(likes.router, prefix="/likes") 


static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
app.mount("/static", StaticFiles(directory=static_dir), name="static")

@app.get("/")
def read_root():
    return {"Hello": "World"}
