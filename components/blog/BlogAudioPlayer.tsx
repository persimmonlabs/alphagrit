'use client'

import { useEffect, useState, useRef, useCallback } from 'react'
import { Play, Pause, Volume2, VolumeX, Music, X } from 'lucide-react'

interface BlogAudioPlayerProps {
  audioUrl: string
  title?: string
  artist?: string
  autoPlayAttempt?: boolean
}

export function BlogAudioPlayer({
  audioUrl,
  title = 'Background Music',
  artist,
  autoPlayAttempt = false
}: BlogAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [playing, setPlaying] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)
  const [volume, setVolume] = useState(0.5)
  const [muted, setMuted] = useState(false)
  const [showPlayer, setShowPlayer] = useState(true)
  const [minimized, setMinimized] = useState(false)
  const autoplayAttempted = useRef(false)

  // Initialize audio element
  useEffect(() => {
    const audio = new Audio(audioUrl)
    audio.preload = 'metadata'
    audio.volume = volume
    audioRef.current = audio

    const handleLoadedMetadata = () => {
      setDuration(audio.duration)
      setLoading(false)
    }

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime)
    }

    const handleEnded = () => {
      setPlaying(false)
      setCurrentTime(0)
    }

    const handleError = () => {
      setError(true)
      setLoading(false)
    }

    const handlePlay = () => setPlaying(true)
    const handlePause = () => setPlaying(false)

    audio.addEventListener('loadedmetadata', handleLoadedMetadata)
    audio.addEventListener('timeupdate', handleTimeUpdate)
    audio.addEventListener('ended', handleEnded)
    audio.addEventListener('error', handleError)
    audio.addEventListener('play', handlePlay)
    audio.addEventListener('pause', handlePause)

    return () => {
      audio.pause()
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata)
      audio.removeEventListener('timeupdate', handleTimeUpdate)
      audio.removeEventListener('ended', handleEnded)
      audio.removeEventListener('error', handleError)
      audio.removeEventListener('play', handlePlay)
      audio.removeEventListener('pause', handlePause)
    }
  }, [audioUrl])

  // Sync volume changes
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = muted ? 0 : volume
    }
  }, [volume, muted])

  // Attempt autoplay after mount
  useEffect(() => {
    if (autoPlayAttempt && !autoplayAttempted.current && audioRef.current && !loading) {
      autoplayAttempted.current = true

      // Small delay to allow component to render
      const timer = setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.play()
            .then(() => {
              console.log('Autoplay succeeded')
            })
            .catch((err) => {
              console.log('Autoplay blocked by browser:', err.message)
              // Graceful fallback - player remains visible with play button
            })
        }
      }, 500)

      return () => clearTimeout(timer)
    }
  }, [autoPlayAttempt, loading])

  const togglePlayPause = useCallback(() => {
    if (!audioRef.current) return

    if (playing) {
      audioRef.current.pause()
    } else {
      audioRef.current.play().catch(console.error)
    }
  }, [playing])

  const handleSeek = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    if (!audioRef.current) return
    const time = parseFloat(e.target.value)
    audioRef.current.currentTime = time
    setCurrentTime(time)
  }, [])

  const handleVolumeChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseInt(e.target.value) / 100
    setVolume(newVolume)
    setMuted(false)
  }, [])

  const formatTime = (seconds: number) => {
    if (!isFinite(seconds)) return '0:00'
    const mins = Math.floor(seconds / 60)
    const secs = Math.floor(seconds % 60)
    return `${mins}:${secs.toString().padStart(2, '0')}`
  }

  const progressPercent = duration ? (currentTime / duration) * 100 : 0

  // Don't render if error or no URL
  if (error || !audioUrl) {
    return null
  }

  // Hidden state - show nothing
  if (!showPlayer) {
    return (
      <button
        onClick={() => setShowPlayer(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-orange-500 text-white shadow-lg hover:bg-orange-600 transition-all hover:scale-105 flex items-center justify-center"
        aria-label="Show audio player"
      >
        <Music className="w-6 h-6" />
      </button>
    )
  }

  // Minimized state - small floating button
  if (minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-lg transition-all hover:scale-105 flex items-center justify-center ${
          playing
            ? 'bg-orange-500 text-white animate-pulse'
            : 'bg-neutral-800 text-white hover:bg-neutral-700'
        }`}
        aria-label="Expand audio player"
      >
        {playing ? <Pause className="w-6 h-6" /> : <Play className="w-6 h-6 ml-0.5" />}
      </button>
    )
  }

  // Full player
  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 max-w-[calc(100vw-3rem)]">
      <div className="bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl p-4">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Music className="w-4 h-4 text-orange-500 flex-shrink-0" />
              <p className="text-sm font-medium text-foreground truncate">
                {title}
              </p>
            </div>
            {artist && (
              <p className="text-xs text-muted-foreground truncate pl-6">{artist}</p>
            )}
          </div>
          <div className="flex items-center gap-1 ml-2">
            <button
              onClick={() => setMinimized(true)}
              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              aria-label="Minimize"
              title="Minimize"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </button>
            <button
              onClick={() => setShowPlayer(false)}
              className="text-muted-foreground hover:text-foreground p-1 rounded transition-colors"
              aria-label="Close"
              title="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-3">
          <input
            type="range"
            min="0"
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-1.5 bg-neutral-800 rounded-full appearance-none cursor-pointer"
            style={{
              background: `linear-gradient(to right, #f97316 0%, #f97316 ${progressPercent}%, #262626 ${progressPercent}%, #262626 100%)`
            }}
            disabled={loading}
          />
          <div className="flex justify-between text-xs text-muted-foreground mt-1">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-4">
          {/* Play/Pause */}
          <button
            onClick={togglePlayPause}
            disabled={loading}
            className="w-10 h-10 rounded-full bg-orange-500 text-white hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-colors flex-shrink-0"
            aria-label={playing ? 'Pause' : 'Play'}
          >
            {loading ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : playing ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </button>

          {/* Volume Control */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <button
              onClick={() => setMuted(!muted)}
              className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
              aria-label={muted ? 'Unmute' : 'Mute'}
            >
              {muted || volume === 0 ? (
                <VolumeX className="w-4 h-4" />
              ) : (
                <Volume2 className="w-4 h-4" />
              )}
            </button>
            <input
              type="range"
              min="0"
              max="100"
              value={muted ? 0 : volume * 100}
              onChange={handleVolumeChange}
              className="flex-1 h-1 bg-neutral-800 rounded-full appearance-none cursor-pointer min-w-0"
              style={{
                background: `linear-gradient(to right, #f97316 0%, #f97316 ${muted ? 0 : volume * 100}%, #262626 ${muted ? 0 : volume * 100}%, #262626 100%)`
              }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}
