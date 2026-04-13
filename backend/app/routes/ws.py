from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import logging

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/ws", tags=["websockets"])

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"New WS connection. Total: {len(self.active_connections)}")

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)
        logger.info(f"WS disconnected. Total: {len(self.active_connections)}")

    async def broadcast(self, message: dict):
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.error(f"Error broadcasting to WS: {e}")

manager = ConnectionManager()

@router.websocket("/activity/{user_id}")
async def websocket_endpoint(websocket: WebSocket, user_id: int):
    await manager.connect(websocket)
    try:
        # Send initial welcome or current status
        await websocket.send_json({"type": "info", "message": "Connected to real-time activity stream"})
        
        while True:
            # Keep connection alive and handle client messages if any
            data = await websocket.receive_text()
            # Echo or handle incoming client commands
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception as e:
        logger.error(f"WS Error for user {user_id}: {e}")
        manager.disconnect(websocket)

@router.websocket("/task/{task_id}")
async def task_websocket_endpoint(websocket: WebSocket, task_id: str):
    """Specific WS for tracking a background task."""
    await websocket.accept()
    from app.tasks.analysis import celery
    try:
        while True:
            res = celery.AsyncResult(task_id)
            if res.state == 'STARTED':
                await websocket.send_json({
                    "status": "STARTED",
                    "progress": res.info.get("progress", 0),
                    "step": res.info.get("step", "")
                })
            elif res.state == 'SUCCESS':
                await websocket.send_json({"status": "SUCCESS", "result": res.result})
                break
            elif res.state == 'FAILURE':
                await websocket.send_json({"status": "FAILURE"})
                break
            
            import asyncio
            await asyncio.sleep(1) # Poll the backend every second
    except WebSocketDisconnect:
        pass
    except Exception as e:
        logger.error(f"Task WS Error: {e}")
