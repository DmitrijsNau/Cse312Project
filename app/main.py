import os
from contextlib import asynccontextmanager

from fastapi import APIRouter, FastAPI, WebSocket, WebSocketDisconnect
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles

from app.core.ws import ConnectionManager
from app.core.config import config
from app.core.db import init_db
from app.core.middleware import ContentTypeOptionsMiddleware
from app.routers import auth, likes, pets, conversations


# create databases on startup
@asynccontextmanager
async def lifespan(app: FastAPI):
    init_db()
    yield
    pass


app = FastAPI(lifespan=lifespan)
api = FastAPI(root_path="/api")
api.add_middleware(ContentTypeOptionsMiddleware)
app.add_middleware(ContentTypeOptionsMiddleware)
# backend routes
api_router = APIRouter()
api.include_router(auth.router, prefix="/auth")
api.include_router(pets.router, prefix="/pets")
api.include_router(likes.router, prefix="/likes")
api.include_router(conversations.router, prefix="/conversations")

manager = ConnectionManager()


@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket, conversationId: int):
    await manager.connect(websocket, conversationId)
    try:
        while True:
            data = await websocket.receive_text()
            await manager.broadcast(data, conversationId)
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversationId)


print(config.UPLOAD_DIR, flush=True)
# serve the stuff
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
