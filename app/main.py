import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.config import config
from app.core.db import init_db
from app.core.middleware import ContentTypeOptionsMiddleware
from app.core.rate_limiter import RateLimitMiddleware
from app.routers import auth, conversations, likes, pets, ws


# create databases on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    pass


app = FastAPI(lifespan=lifespan)
api = FastAPI(root_path="/api")
api.add_middleware(ContentTypeOptionsMiddleware)
api.add_middleware(ContentTypeOptionsMiddleware) # just realized there are two here... delete one?
app.add_middleware(RateLimitMiddleware)

# backend routes
api_router = APIRouter()
api.include_router(auth.router, prefix="/auth")
api.include_router(pets.router, prefix="/pets")
api.include_router(likes.router, prefix="/likes")
api.include_router(conversations.router, prefix="/conversations")
app.include_router(ws.router, prefix="/ws")


# Serve the static files from the public and frontend build directories
app.mount("/api", api)

# for serving user uploaded images
app.mount(config.IMAGES_PATH, StaticFiles(directory=config.UPLOAD_DIR), name="images")


# Catch-all route to serve index.html for any unmatched routes
@app.get("/{full_path:path}", include_in_schema=False)
async def catch_all(full_path: str):
    requested_path = os.path.join(config.FRONTEND_BUILD_DIR, full_path)
    if os.path.exists(requested_path) and os.path.isfile(requested_path):
        return FileResponse(requested_path)
    index_file_path = os.path.join(config.FRONTEND_BUILD_DIR, "index.html")
    return FileResponse(index_file_path)
