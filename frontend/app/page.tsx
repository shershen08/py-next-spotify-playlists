'use client'

import { useEffect, useState } from 'react'

interface Track {
  id: string
  name: string
  artist: string
  album: string
  duration_ms: number
  image_url?: string
}

export default function Home() {
  const [tracks, setTracks] = useState<Track[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [userId] = useState('user_123') // Hardcoded for demo
  const [playlistId] = useState(42) // Hardcoded for demo

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}api/playlists/${playlistId}/tracks`)
        const data = await response.json()
        setTracks(data)
      } catch (error) {
        console.error('Error fetching tracks:', error)
      }
    }

    fetchTracks()
  }, [])

  // Setup WebSocket connection
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    const wsUrl = apiUrl.replace(/^http/, 'ws')
    const websocket = new WebSocket(`${wsUrl}/ws`)

    websocket.onopen = () => {
      console.log('WebSocket connected')
      setConnectionStatus('connected')
    }

    websocket.onclose = () => {
      console.log('WebSocket disconnected')
      setConnectionStatus('disconnected')
    }

    websocket.onerror = (error) => {
      console.error('WebSocket error:', error)
      setConnectionStatus('disconnected')
    }

    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      console.log('Received from server:', message)
    }

    setWs(websocket)

    return () => {
      websocket.close()
    }
  }, [])

  // Send playback state to backend
  const handleTrackClick = (track: Track, index: number) => {
    setCurrentTrack(track.id)

    if (ws && ws.readyState === WebSocket.OPEN) {
      const playbackState = {
        user_id: userId,
        playlist_id: playlistId,
        track_id: track.id,
        position_ms: 0, // Starting from beginning
      }

      console.log('Sending playback state:', playbackState)
      ws.send(JSON.stringify(playbackState))
    } else {
      console.error('WebSocket is not connected')
    }
  }

  // Format duration from ms to mm:ss
  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000)
    const seconds = Math.floor((ms % 60000) / 1000)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  return (
    <main className="min-h-screen p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2">My Playlist</h1>
          <p className="text-spotify-lightgrey">
            {tracks.length} songs
          </p>
          <div className="mt-2 flex items-center gap-2">
            <div className={`w-3 h-3 rounded-full ${connectionStatus === 'connected' ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-spotify-lightgrey">
              WebSocket {connectionStatus}
            </span>
          </div>
        </div>

        {/* Playlist Table */}
        <div className="bg-spotify-darkgrey rounded-lg p-4">
          <div className="grid grid-cols-[50px_1fr_1fr_100px] gap-4 pb-4 border-b border-spotify-grey text-spotify-lightgrey text-sm">
            <div className="text-center">#</div>
            <div>TITLE</div>
            <div>ALBUM</div>
            <div className="text-center">DURATION</div>
          </div>

          {tracks.length === 0 ? (
            <div className="text-center py-8 text-spotify-lightgrey">
              Loading tracks...
            </div>
          ) : (
            <div className="space-y-2">
              {tracks.map((track, index) => (
                <div
                  key={track.id}
                  onClick={() => handleTrackClick(track, index)}
                  className={`grid grid-cols-[50px_1fr_1fr_100px] gap-4 p-3 rounded hover:bg-spotify-grey cursor-pointer transition-colors ${
                    currentTrack === track.id ? 'bg-spotify-grey' : ''
                  }`}
                >
                  <div className="text-center text-spotify-lightgrey flex items-center justify-center">
                    {currentTrack === track.id ? (
                      <span className="text-spotify-green">▶</span>
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </div>
                  <div>
                    <div className={`font-medium ${currentTrack === track.id ? 'text-spotify-green' : ''}`}>
                      {track.name}
                    </div>
                    <div className="text-sm text-spotify-lightgrey">
                      {track.artist}
                    </div>
                  </div>
                  <div className="text-spotify-lightgrey flex items-center">
                    {track.album}
                  </div>
                  <div className="text-spotify-lightgrey text-center flex items-center justify-center">
                    {formatDuration(track.duration_ms)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-spotify-darkgrey rounded-lg text-sm text-spotify-lightgrey">
          <p className="font-semibold mb-2">Instructions:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Click on any track to simulate playback</li>
            <li>The WebSocket will send track ID and position to the backend</li>
            <li>Backend saves the state to Redis with user ID and playlist info</li>
            <li>Check the browser console for WebSocket messages</li>
          </ul>
        </div>
      </div>
    </main>
  )
}
