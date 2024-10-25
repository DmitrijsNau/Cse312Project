from typing import Union
from fastapi.staticfiles import StaticFiles
import os
from fastapi import FastAPI, APIRouter
from app.routers import auth

app = FastAPI()
router = APIRouter()

public_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "public")
frontend_build_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "build")
print(frontend_build_dir)
static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
app.include_router(auth.router, prefix="/auth")
app.mount("/public", StaticFiles(directory=public_dir), name="public")
app.mount("/", StaticFiles(directory=frontend_build_dir, html=True), name="frontend")


@app.get("/api")
def read_root():
    return {"Hello": "World"}
