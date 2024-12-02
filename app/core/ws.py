import json
from typing import List

from fastapi import WebSocket



class ConnectionManager:
    def __init__(self):
        self.active_connections: dict[int, list[tuple[WebSocket, int]]] = {}
        self.pet_feed_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket, conversation_id: int, user_id: int):
        await websocket.accept()
        if conversation_id not in self.active_connections:
            self.active_connections[conversation_id] = []
        self.active_connections[conversation_id].append((websocket, user_id))

    async def connect_to_pet_feed(self, websocket: WebSocket):
        await websocket.accept()
        self.pet_feed_connections.append(websocket)

    def disconnect(self, websocket: WebSocket, conversation_id: int):
        self.active_connections[conversation_id] = [
            (ws, uid) for ws, uid in self.active_connections[conversation_id] if ws != websocket
        ]
        if not self.active_connections[conversation_id]:
            del self.active_connections[conversation_id]

    def disconnect_from_pet_feed(self, websocket: WebSocket):
        if websocket in self.pet_feed_connections:
            self.pet_feed_connections.remove(websocket)

    async def broadcast(self, message: str, conversation_id: int):
        message_data = json.loads(message)
        sender_id = message_data.get("sender_id")
        
        if conversation_id in self.active_connections:
            for ws, uid in self.active_connections[conversation_id]:
                if uid != sender_id:
                    try:
                        await ws.send_text(message)
                    except:
                        # Handle any websocket errors
                        print(f"Error sending message to user {uid}")

    async def broadcast_new_pet(self, pet_data: dict):
        """Broadcast new pet data to all connected clients"""
        if not self.pet_feed_connections:
            return
            
        message = json.dumps({"type": "new_pet", "data": pet_data})
        disconnected = []
        
        for websocket in self.pet_feed_connections:
            try:
                await websocket.send_text(message)
            except:
                disconnected.append(websocket)
                
        # Clean up disconnected clients
        for ws in disconnected:
            self.disconnect_from_pet_feed(ws)

manager = ConnectionManager()
