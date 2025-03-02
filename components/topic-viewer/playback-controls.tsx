"use client"

import { Button } from "@/components/ui/button"
import { Play, Pause, FastForward, Rewind } from "lucide-react"

interface PlaybackControlsProps {
  isPlaying: boolean
  playbackSpeed: number
  onPlayPause: () => void
  onSpeedChange: (faster: boolean) => void
}

export function PlaybackControls({ isPlaying, playbackSpeed, onPlayPause, onSpeedChange }: PlaybackControlsProps) {
  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={() => onSpeedChange(false)} disabled={playbackSpeed <= 0.25}>
        <Rewind className="h-4 w-4" />
      </Button>
      <Button variant="outline" size="icon" onClick={onPlayPause}>
        {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
      </Button>
      <Button variant="outline" size="icon" onClick={() => onSpeedChange(true)} disabled={playbackSpeed >= 4}>
        <FastForward className="h-4 w-4" />
      </Button>
      <span className="text-sm text-muted-foreground ml-2">{playbackSpeed}x</span>
    </div>
  )
}

