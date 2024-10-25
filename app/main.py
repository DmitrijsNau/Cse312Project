from typing import Union
from fastapi.staticfiles import StaticFiles
import os
from fastapi import FastAPI, APIRouter
from app.routers import auth

app = FastAPI()
router = APIRouter()

static_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "static")
app.include_router(auth.router, prefix="/auth")


app.mount("/static", StaticFiles(directory=static_dir), name="static")


@app.get("/")
def read_root():
    return {"Hello": "World"}


@app.get("/items/{item_id}")
def read_item(item_id: int, q: Union[str, None] = None):
    return {"item_id": item_id, "q": q}
