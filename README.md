# Spotify Emulation Project

A full-stack application emulating Spotify's web UI with real-time WebSocket communication.

## Project Structure

```
py-spotify-emulation/
├── backend/          # FastAPI backend application
│   ├── main.py
│   └── requirements.txt
├── frontend/         # Next.js frontend application
│   ├── app/
│   ├── package.json
│   └── ...
└── README.md
```

## Features

### Frontend (Next.js)
- Spotify-inspired UI with dark theme
- Displays playlist with track information
- Real-time WebSocket connection to backend
- Click on tracks to simulate playback
- Sends track ID and position to backend via WebSocket

### Backend (FastAPI)
- WebSocket endpoint for real-time communication
- REST API endpoint to fetch playlist tracks (mocked data)
- Redis integration for persisting playback state
- Stores user ID, playlist ID, track ID, and position
- CORS enabled for frontend communication

## Prerequisites

- Python 3.8+
- Node.js 18+
- Redis (optional, but recommended)

## Setup

### Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Create a virtual environment:
```bash
uv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
uv pip install -r requirements.txt
```

4. Start Redis (optional):
```bash
# Using Docker
docker run -d -p 6379:6379 redis:latest

# Or install Redis locally and run
redis-server
```

5. Start the FastAPI server:
```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The backend will be available at `http://localhost:8000`

### Frontend Setup

1. Navigate to the frontend directory:
```bash
cd frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:3000`

## Usage

1. Open your browser and navigate to `http://localhost:3000`
2. You'll see a playlist with 5 mocked tracks
3. The WebSocket connection status is shown at the top
4. Click on any track to simulate playback
5. The WebSocket will send the track information to the backend
6. Backend saves the state to Redis with user ID and playlist info
7. Check the browser console and backend logs to see the communication

## API Endpoints

### REST API

- `GET /` - Health check
- `GET /api/playlists/{playlist_id}/tracks` - Get tracks in a playlist (mocked)
- `GET /api/playback/{user_id}` - Get current playback state for a user

### WebSocket

- `ws://localhost:8000/ws` - WebSocket endpoint for real-time playback updates

**Message format sent from frontend:**
```json
{
  "user_id": "user_123",
  "playlist_id": "playlist_1",
  "track_id": "track_1",
  "position_ms": 0
}
```

**Response format from backend:**
```json
{
  "status": "success",
  "message": "Playback state saved",
  "data": {
    "user_id": "user_123",
    "playlist_id": "playlist_1",
    "track_id": "track_1",
    "position_ms": 0
  }
}
```

## Technologies

### Frontend
- Next.js 14
- React 18
- TypeScript
- Tailwind CSS
- WebSocket API

### Backend
- FastAPI
- Python 3
- Redis (async)
- WebSockets
- Pydantic

## Development

- Frontend runs on `http://localhost:3000`
- Backend runs on `http://localhost:8000`
- Redis runs on `localhost:6379` (if enabled)

## Notes

- User ID is hardcoded as `user_123` for demo purposes
- Playlist ID is hardcoded as `playlist_1`
- Track data is mocked in the backend
- Redis is optional - the app will work without it, but state won't persist
- Position is set to 0ms when clicking a track (can be extended to track actual playback position)
