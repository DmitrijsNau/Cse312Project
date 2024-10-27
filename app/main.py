import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, APIRouter, Request

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from app.routers import auth, pets, likes
from app.core.db import init_db

# create databases on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    pass

app = FastAPI()
api = FastAPI(root_path="/api")

# backend routes
api_router = APIRouter()
api.include_router(auth.router, prefix="/auth")
api.include_router(pets.router, prefix="/pets")
api.include_router(likes.router, prefix="/likes")

@app.get("/api")
def read_root():
    return {"Hello": "World"}

# static stuff
frontend_build_dir = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "ui", "build")

# serve the stuff
# Serve the static files from the public and frontend build directories
app.mount("/api", api)

# Catch-all route to serve index.html for any unmatched routes
@app.get("/{full_path:path}", include_in_schema=False)
async def catch_all(full_path: str):
    requested_path = os.path.join(frontend_build_dir, full_path)
    if os.path.exists(requested_path) and os.path.isfile(requested_path):
        return FileResponse(requested_path)
    index_file_path = os.path.join(frontend_build_dir, "index.html")
    return FileResponse(index_file_path)
