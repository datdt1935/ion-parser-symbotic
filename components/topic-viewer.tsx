"use client"

import { useEffect, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, FastForward, Rewind } from "lucide-react"
import { JsonViewer } from "./json-viewer"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import { formatDateTime, formatDateTimeDisplay } from "@/lib/utils/date"

export function TopicViewer() {
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const { isPlaying, currentTime, startTime, endTime, playbackSpeed } = useSelector(
    ionDataSelectors.selectPlaybackState,
  )
  const timeRange = useSelector(ionDataSelectors.selectTimeRange)
  const currentMessage = useSelector(ionDataSelectors.selectCurrentTopicMessage)

  const playbackRef = useRef<number>()

  // Initialize time range when topics are loaded
  useEffect(() => {
    if (timeRange.endTime > timeRange.startTime) {
      dispatch(ionDataActions.setTimeRange(timeRange))
      dispatch(ionDataActions.setCurrentTime(timeRange.startTime))
    }
  }, [timeRange, dispatch])

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = window.setInterval(() => {
        dispatch(
          ionDataActions.setCurrentTime((current) => {
            const nextTime = current + 1000 * playbackSpeed
            if (nextTime >= endTime) {
              dispatch(ionDataActions.setPlaybackState(false))
              return endTime
            }
            return nextTime
          }),
        )
      }, 1000)
    } else if (playbackRef.current) {
      clearInterval(playbackRef.current)
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
    }
  }, [isPlaying, endTime, playbackSpeed, dispatch])

  const handleTopicSelect = (topic: string) => {
    dispatch(ionDataActions.setSelectedTopic(topic))
  }

  const handlePlayPause = () => {
    dispatch(ionDataActions.setPlaybackState(!isPlaying))
  }

  const handleSeek = (value: number[]) => {
    dispatch(ionDataActions.setCurrentTime(value[0]))
  }

  const handleSpeedChange = (faster: boolean) => {
    const newSpeed = faster ? playbackSpeed * 2 : playbackSpeed / 2
    dispatch(ionDataActions.setPlaybackSpeed(Math.max(0.25, Math.min(4, newSpeed))))
  }

  if (topicNames.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-muted-foreground text-center">No topics found in the log file</p>
        </CardContent>
      </Card>
    )
  }

  const progress = ((currentTime - startTime) / (endTime - startTime)) * 100

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-6">
          <div className="flex items-center gap-4">
            <Select value={selectedTopic || ""} onValueChange={handleTopicSelect}>
              <SelectTrigger className="w-[300px]">
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topicNames.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedTopic && (
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSpeedChange(false)}
                  disabled={playbackSpeed <= 0.25}
                >
                  <Rewind className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handlePlayPause}>
                  {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => handleSpeedChange(true)}
                  disabled={playbackSpeed >= 4}
                >
                  <FastForward className="h-4 w-4" />
                </Button>
                <span className="text-sm text-muted-foreground ml-2">{playbackSpeed}x</span>
              </div>
            )}
          </div>

          {selectedTopic && (
            <div className="py-4">
              <div className="relative">
                <Slider value={[currentTime]} min={startTime} max={endTime} step={1} onValueChange={handleSeek} />
                <div
                  className="absolute bottom-0 left-0 h-1 bg-primary/20 rounded-full transition-all duration-150"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="flex justify-between text-sm text-muted-foreground mt-1">
                <span>{formatTime(currentTime - startTime)}</span>
                <span>{formatTime(endTime - startTime)}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedTopic && currentMessage ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-medium">Message Type: </span>
                <span className="text-sm text-muted-foreground">{currentMessage.topicType}</span>
              </div>
              <div className="flex flex-col items-end">
                <span className="text-sm font-medium">Timestamp:</span>
                <span className="text-sm text-muted-foreground font-mono">
                  {formatDateTimeDisplay(formatDateTime(currentMessage.timestamp))}
                </span>
              </div>
            </div>
            <JsonViewer data={currentMessage.messages} />
          </CardContent>
        </Card>
      ) : selectedTopic ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">No message found at current timestamp</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

function formatTime(ms: number): string {
  const seconds = Math.floor(ms / 1000)
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`
}

