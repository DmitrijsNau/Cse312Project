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
public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
frontend_build_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "build")
app.mount("/public", StaticFiles(directory=public_dir), name="public")
app.mount("/", StaticFiles(directory=frontend_build_dir, html=True), name="frontend")
app.include_router(auth.router, prefix="/auth")
app.include_router(pets.router, prefix="/pets")
app.include_router(likes.router, prefix="/likes")


@app.get("/api")
def read_root():
    return {"Hello": "World"}
