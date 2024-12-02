import json

from fastapi import APIRouter, Cookie, Depends, WebSocket, WebSocketDisconnect
from sqlalchemy.orm import Session

from app.core.auth import get_user_by_token
from app.core.db import get_db
from app.core.messages import save_message
from app.core.ws import manager
from app.models.conversation import Conversation

router = APIRouter()

@router.websocket("/chat/{conversation_id}")
async def websocket_chat_endpoint(
    websocket: WebSocket,
    conversation_id: int,
    db: Session = Depends(get_db),
    auth_token: str = Cookie(None, alias="auth_token")
):
    # Verify auth token
    if not auth_token:
        await websocket.close(code=1008, reason="Not authenticated")
        return
        
    user = get_user_by_token(db, auth_token)
    if not user:
        await websocket.close(code=1008, reason="Invalid authentication token")
        return

    # Verify user is part of the conversation
    conversation = db.query(Conversation).get(conversation_id)
    if not conversation or (user.id != conversation.user1_id and user.id != conversation.user2_id):
        await websocket.close(code=4403, reason="Not authorized for this conversation")
        return

    await manager.connect(websocket, conversation_id, user.id)
    try:
        while True:
            data = await websocket.receive_text()
            message_data = json.loads(data)
            
            if "content" in message_data and message_data["content"].strip():
                # Save message to database
                message = save_message(conversation_id, message_data["content"], db, user)
                
                if message:
                    # Create the response with all necessary data
                    response_data = {
                        "content": message.content,
                        "sender_id": message.sender_id,
                        "sender_username": user.username,
                        "timestamp": message.timestamp.isoformat(),
                        "id": message.id
                    }
                    
                    # Send to the sender's websocket
                    await websocket.send_text(json.dumps(response_data))
                    
                    # Broadcast to other participants
                    await manager.broadcast(json.dumps(response_data), conversation_id)
                    
    except WebSocketDisconnect:
        manager.disconnect(websocket, conversation_id)

@router.websocket("/pets")
async def websocket_pet_feed(
    websocket: WebSocket,
    db: Session = Depends(get_db),
    auth_token: str = Cookie(None, alias="auth_token")
):
    # Verify auth token before accepting connection
    if not auth_token:
        await websocket.close(code=1008, reason="Not authenticated")
        return
        
    user = get_user_by_token(db, auth_token)
    if not user:
        await websocket.close(code=1008, reason="Invalid authentication token")
        return

    await manager.connect_to_pet_feed(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect_from_pet_feed(websocket)
