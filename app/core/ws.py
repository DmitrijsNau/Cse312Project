import json

from fastapi import WebSocket
from sqlalchemy.orm import Session


from app.core.messages import save_message
from app.models.user import User


class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[tuple[WebSocket, int]]] = {}

    async def connect(self, websocket: WebSocket, conversation_id: int, user_id: int):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append((websocket, user_id))

    def disconnect(self, websocket: WebSocket, conversation_id: int):
        self.active_connections[conversation_id] = [
            (ws, uid) for ws, uid in self.active_connections[conversation_id] if ws != websocket
        ]
        if not self.active_connections[conversation_id]:
            del self.active_connections[conversation_id]

    async def broadcast(self, message: str, conversation_id: int, db: Session, current_user: User):
        print(f"Broadcasting message: {message} to conversation {conversation_id}")
        message_data = json.loads(message)
        content = message_data.get("content")
        if content:
            save_message(conversation_id, content, db, current_user)
            for ws, uid in self.active_connections.get(conversation_id, []):
                if uid != current_user.id:
                    await ws.send_text(message)
        else:
            print("No content in message")
