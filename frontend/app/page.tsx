'use client'

import { useEffect, useState, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'

interface Track {
  id: string
  name: string
  artist: string
  album: string
  duration_ms: number
  image_url?: string
}

function PlaylistContent() {
  const searchParams = useSearchParams()
  const playlistIdParam = searchParams.get('playlistId')
  const playlistId = playlistIdParam ? parseInt(playlistIdParam, 10) : 42

  const [tracks, setTracks] = useState<Track[]>([])
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected' | 'connecting'>('disconnected')
  const [currentTrack, setCurrentTrack] = useState<string | null>(null)
  const [currentTrackData, setCurrentTrackData] = useState<Track | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [positionMs, setPositionMs] = useState(0)
  const [userId] = useState('user_123') 

  // Fetch tracks from API
  useEffect(() => {
    const fetchTracks = async () => {
      try {
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/playlists/${playlistId}/tracks`)
        const data = await response.json()
        setTracks(data)
      } catch (error) {
        console.error('Error fetching tracks:', error)
      }
    }

    fetchTracks()
  }, [playlistId])

  // Fetch and restore playback state
  const fetchPlaybackState = useCallback(async () => {
    if (!tracks.length || connectionStatus !== 'connected') return

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL
      const response = await fetch(`${apiUrl}/api/playback/${userId}`)
      const data = await response.json()

      // Check if playback state exists (not the "No playback state found" message)
      if (data.track_id && data.position_ms !== undefined) {
        // Find the track in the tracks array
        const track = tracks.find((t) => t.id === data.track_id)
        
        if (track) {
          // Only restore if it's from the same playlist
          if (data.playlist_id === playlistId) {

            console.log('Restoring playback state:', { track: track.name, position: data.position_ms })
            setCurrentTrack(track.id)
            setCurrentTrackData(track)
            setPositionMs(data.position_ms)
            // Don't auto-play, let user resume manually
            setIsPlaying(false)
            console.log('Restored playback state:', { track: track.name, position: data.position_ms })
          }
        }
      }
    } catch (error) {
      console.error('Error fetching playback state:', error)
    }
  }, [tracks, connectionStatus, userId, playlistId])

  // Restore playback state when tracks are loaded and websocket is connected
  useEffect(() => {
    fetchPlaybackState()
  }, [fetchPlaybackState])

  // Setup WebSocket connection
  useEffect(() => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL
    if (!apiUrl) {
      console.error('API URL is not set')
      return
    }
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
  const sendPlaybackState = useCallback((trackId: string, position: number) => {
    if (ws && ws.readyState === WebSocket.OPEN) {
      const playbackState = {
        user_id: userId,
        playlist_id: playlistId,
        track_id: trackId,
        position_ms: position,
      }

      console.log('Sending playback state:', playbackState)
      ws.send(JSON.stringify(playbackState))
    } else {
      console.error('WebSocket is not connected')
    }
  }, [ws, userId, playlistId])

  // Increment position when playing
  useEffect(() => {
    if (!isPlaying || !currentTrackData) return

    const interval = setInterval(() => {
      setPositionMs((prev) => {
        const newPosition = prev + 1000
        // Stop if we've reached the end of the track
        if (newPosition >= currentTrackData.duration_ms) {
          setIsPlaying(false)
          return currentTrackData.duration_ms
        }
        return newPosition
      })
    }, 1000)

    return () => clearInterval(interval)
  }, [isPlaying, currentTrackData])

  // Heartbeat: send position every 5 seconds when playing
  useEffect(() => {
    if (!isPlaying || !currentTrack) return

    const heartbeatInterval = setInterval(() => {
      setPositionMs((currentPosition) => {
        sendPlaybackState(currentTrack, currentPosition)
        return currentPosition
      })
    }, 5000)

    return () => clearInterval(heartbeatInterval)
  }, [isPlaying, currentTrack, sendPlaybackState])

  // Handle track click
  const handleTrackClick = (track: Track, index: number) => {
    setCurrentTrack(track.id)
    setCurrentTrackData(track)
    setPositionMs(0)
    setIsPlaying(true)
    sendPlaybackState(track.id, 0)
  }

  // Handle play/pause
  const handlePlayPause = () => {
    if (!currentTrack) return

    if (isPlaying) {
      setIsPlaying(false)
    } else {
      setIsPlaying(true)
    }
    sendPlaybackState(currentTrack, positionMs)
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

        {/* Player */}
        {currentTrackData && (
          <div className="mb-8 bg-spotify-darkgrey rounded-lg p-4">
            <div className="flex items-center gap-4">
              <button
                onClick={handlePlayPause}
                className="w-12 h-12 rounded-full bg-spotify-green hover:bg-spotify-green/80 flex items-center justify-center transition-colors"
                aria-label={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? (
                  <span className="text-black text-xl">⏸</span>
                ) : (
                  <span className="text-black text-xl ml-1">▶</span>
                )}
              </button>
              <div className="flex-1">
                <div className="font-medium text-white">{currentTrackData.name}</div>
                <div className="text-sm text-spotify-lightgrey">{currentTrackData.artist}</div>
                <div className="mt-2 flex items-center gap-2 text-xs text-spotify-lightgrey">
                  <span>{formatDuration(positionMs)}</span>
                  <span>/</span>
                  <span>{formatDuration(currentTrackData.duration_ms)}</span>
                </div>
              </div>
            </div>
          </div>
        )}

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

export default function Home() {
  return (
    <Suspense fallback={
      <main className="min-h-screen p-8">
        <div className="max-w-6xl mx-auto">
          <div className="text-center py-8 text-spotify-lightgrey">
            Loading...
          </div>
        </div>
      </main>
    }>
      <PlaylistContent />
    </Suspense>
  )
}
