from fastapi import FastAPI, WebSocket, WebSocketDisconnect, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from dataclasses import dataclass, asdict
from typing import List, Optional
from upstash_redis import Redis
import json
import logging
import random
from db import Track, MOCK_TRACKS

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(title="Spotify playlists Backend")

# CORS middleware for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Redis client for state persistence
redis_client: Optional[Redis] = None


@app.on_event("startup")
async def startup_event():
    global redis_client
    try:
        redis_client = Redis.from_env()
        logger.info("Connected to Upstash Redis")
    except Exception as e:
        logger.warning(f"Could not connect to Redis: {e}. Using in-memory fallback.")
        redis_client = None


@app.on_event("shutdown")
async def shutdown_event():
    # Upstash Redis doesn't require explicit closing
    pass


# Models
@dataclass
class PlaybackState:
    user_id: str
    playlist_id: str
    track_id: str
    position_ms: int


def get_random_tracks(min_tracks: int = 5, max_tracks: int = 10) -> List[Track]:
    """Return a random subset of tracks in random order
    
    Args:
        min_tracks: Minimum number of tracks to return (default: 5)
        max_tracks: Maximum number of tracks to return (default: 10)
    
    Returns:
        List of Track objects in random order
    """
    num_tracks = random.randint(min_tracks, max_tracks)
    selected_tracks = random.sample(MOCK_TRACKS, min(num_tracks, len(MOCK_TRACKS)))
    random.shuffle(selected_tracks)
    return selected_tracks


# API Endpoints
@app.get("/")
async def root():
    return {"message": "Spotify Emulation Backend API"}


@app.get("/api/playlists/{playlist_id}/tracks", response_model=List[Track])
async def get_playlist_tracks(playlist_id: str):
    """Get tracks in a playlist (mocked data)"""
    if not playlist_id or not playlist_id.strip():
        raise HTTPException(
            status_code=400,
            detail="playlist_id parameter is required and cannot be empty"
        )
    try:
        int(playlist_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="playlist_id must be a number"
        )
    logger.info(f"Fetching tracks for playlist: {playlist_id}")
    return MOCK_TRACKS


@app.get("/api/playlists/{playlist_id}/tracks/random", response_model=List[Track])
async def get_random_playlist_tracks(playlist_id: str):
    """Get a random subset of tracks (5-10) in random order"""
    if not playlist_id or not playlist_id.strip():
        raise HTTPException(
            status_code=400,
            detail="playlist_id parameter is required and cannot be empty"
        )
    try:
        int(playlist_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="playlist_id must be a number"
        )
    logger.info(f"Fetching random tracks for playlist: {playlist_id}")
    return get_random_tracks()


# WebSocket endpoint
@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    logger.info("WebSocket connection established")
    
    try:
        while True:
            # Receive playback state from frontend
            data = await websocket.receive_json()
            logger.info(f"Received playback state: {data}")
            
            # Validate and parse the playback state
            try:
                playback_state = PlaybackState(**data)
                
                # Save to Redis
                if redis_client:
                    key = f"playback:{playback_state.user_id}"
                    value = json.dumps({
                        "playlist_id": playback_state.playlist_id,
                        "track_id": playback_state.track_id,
                        "position_ms": playback_state.position_ms
                    })
                    redis_client.set(key, value)
                    logger.info(f"Saved playback state to Redis for user: {playback_state.user_id}")
                else:
                    logger.warning("Redis not available, state not persisted")
                
                # Send acknowledgment back to client
                await websocket.send_json({
                    "status": "success",
                    "message": "Playback state saved",
                    "data": asdict(playback_state)
                })
                
            except Exception as e:
                logger.error(f"Error processing playback state: {e}")
                await websocket.send_json({
                    "status": "error",
                    "message": str(e)
                })
                
    except WebSocketDisconnect:
        logger.info("WebSocket connection closed")
    except Exception as e:
        logger.error(f"WebSocket error: {e}")


@app.get("/api/playback/{user_id}")
async def get_playback_state(user_id: str):
    """Get the current playback state for a user"""
    if not user_id or not user_id.strip():
        raise HTTPException(
            status_code=400,
            detail="user_id parameter is required and cannot be empty"
        )
    try:
        int(user_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="user_id must be a number"
        )
    if redis_client:
        key = f"playback:{user_id}"
        data = redis_client.get(key)
        if data:
            return json.loads(data)
    return {"message": "No playback state found"}
