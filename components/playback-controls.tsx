"use client"

import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data" // Import from index
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward } from "lucide-react"

interface PlaybackControlsProps {
  showSkipButtons?: boolean
  showSpeedSelector?: boolean
  compact?: boolean
  className?: string
}

export function PlaybackControls({
  showSkipButtons = true,
  showSpeedSelector = true,
  compact = false,
  className = "",
}: PlaybackControlsProps) {
  const dispatch = useDispatch()
  const playback = useSelector(ionDataSelectors.selectPlayback)
  const logDuration = useSelector(ionDataSelectors.selectLogDuration)
  const currentMessageIndex = useSelector(ionDataSelectors.selectCurrentMessageIndexByTime)
  const totalMessages = useSelector(ionDataSelectors.selectTotalMessages)

  // Use a ref to track if we're currently handling a slider change
  // This prevents the infinite update loop
  const isChangingRef = useRef(false)

  // Calculate playback progress percentage
  const playbackProgress = logDuration > 0 ? (playback.currentTime / logDuration) * 100 : 0

  // Update playback time at regular intervals
  useEffect(() => {
    if (!playback.isPlaying) return

    const intervalId = setInterval(() => {
      dispatch(ionDataActions.updatePlaybackTime())
    }, 16) // ~60fps

    return () => clearInterval(intervalId)
  }, [playback.isPlaying, dispatch])

  const handleSliderChange = (value: number[]) => {
    if (isChangingRef.current) return

    isChangingRef.current = true
    dispatch(ionDataActions.seekPlayback(value[0] / 100))

    // Reset the flag after a short delay to allow the state to settle
    setTimeout(() => {
      isChangingRef.current = false
    }, 50)
  }

  const togglePlayback = () => {
    if (playback.isPlaying) {
      dispatch(ionDataActions.pausePlayback())
    } else {
      dispatch(ionDataActions.startPlayback())
    }
  }

  const skipBackward = () => {
    // Skip backward by 5% of the log duration
    const newProgress = Math.max(0, playback.currentTime / logDuration - 0.05)
    dispatch(ionDataActions.seekPlayback(newProgress))
  }

  const skipForward = () => {
    // Skip forward by 5% of the log duration
    const newProgress = Math.min(1, playback.currentTime / logDuration + 0.05)
    dispatch(ionDataActions.seekPlayback(newProgress))
  }

  // Format time as MM:SS.mmm
  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    const milliseconds = Math.floor(ms % 1000)
    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
  }

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        {showSpeedSelector && (
          <div className="flex items-center gap-2">
            <select
              className="text-sm border rounded px-2 py-1"
              value={playback.speed}
              onChange={(e) => dispatch(ionDataActions.setPlaybackSpeed(Number(e.target.value)))}
            >
              <option value="0.5">0.5x</option>
              <option value="1">1x</option>
              <option value="2">2x</option>
              <option value="5">5x</option>
              <option value="10">10x</option>
            </select>
          </div>
        )}
        <div className="text-sm text-muted-foreground ml-auto flex gap-4">
          <span>
            {formatTime(playback.currentTime)} / {formatTime(logDuration)}
          </span>
          {!compact && totalMessages > 0 && (
            <span>
              Message {currentMessageIndex + 1} of {totalMessages}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-4">
        {showSkipButtons && (
          <Button variant="outline" size="icon" onClick={skipBackward} className="w-10 h-10">
            <SkipBack className="h-4 w-4" />
          </Button>
        )}
        <Button variant="outline" size="icon" onClick={togglePlayback} className="w-10 h-10">
          {playback.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
        </Button>
        {showSkipButtons && (
          <Button variant="outline" size="icon" onClick={skipForward} className="w-10 h-10">
            <SkipForward className="h-4 w-4" />
          </Button>
        )}
        <div className="flex-1">
          <Slider value={[playbackProgress]} max={100} step={0.1} onValueChange={handleSliderChange} />
        </div>
      </div>
    </div>
  )
}

