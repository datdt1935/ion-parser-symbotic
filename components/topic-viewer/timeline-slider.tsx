"use client"

import { Slider } from "@/components/ui/slider"
import { formatDuration } from "@/lib/utils/date"

interface TimelineSliderProps {
  currentTime: number
  startTime: number
  endTime: number
  progress: number
  onSeek: (value: number[]) => void
}

export function TimelineSlider({ currentTime, startTime, endTime, progress, onSeek }: TimelineSliderProps) {
  return (
    <div className="py-4">
      <div className="relative">
        <Slider value={[currentTime]} min={startTime} max={endTime} step={1} onValueChange={onSeek} />
        <div
          className="absolute bottom-0 left-0 h-1 bg-primary/20 rounded-full transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex justify-between text-sm text-muted-foreground mt-1">
        <span>{formatDuration(currentTime - startTime)}</span>
        <span>{formatDuration(endTime - startTime)}</span>
      </div>
    </div>
  )
}

