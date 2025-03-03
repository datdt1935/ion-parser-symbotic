"use client"

import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import type { RootState } from "@/store/store"
import { parsePythonByteString, uint8ArrayToBase64 } from "@/app/utils/image-processing"

import { Card, CardContent } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, SkipBack, SkipForward, Eye, EyeOff, Camera } from "lucide-react"
import { JsonViewer } from "./json-viewer"

interface CompressedImage {
  header: {
    seq: number
    stamp: {
      secs?: number
      nsecs?: number
    }
    frame_id: string
  }
  format: string
  data: number[] | string
}

interface ImageMessage {
  timestamp?: number
  data?: CompressedImage
}

export function OhmniCleanViewer() {
  const dispatch = useDispatch()
  const availableImageTopic = useSelector(ionDataSelectors.selectAvailableImageTopic)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const currentMessageIndex = useSelector((state: RootState) => state.ionData.currentMessageIndex)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const totalMessages = useSelector(ionDataSelectors.selectTotalMessages)
  const playbackState = useSelector(ionDataSelectors.selectPlaybackState)

  const [playbackSpeed, setPlaybackSpeed] = useState(1)
  const [showJsonViewer, setShowJsonViewer] = useState(false)

  // Set default topic when component mounts
  useEffect(() => {
    if (availableImageTopic && selectedTopic !== availableImageTopic) {
      dispatch(ionDataActions.setSelectedTopic(availableImageTopic))
    }
  }, [availableImageTopic, selectedTopic, dispatch])

  // Image processing logic
  const [imageSrc, localError] = useMemo<[string | null, string | null]>(() => {
    if (!allMessages || !allMessages.length) {
      return [null, "No image messages available"]
    }

    const message = allMessages[currentMessageIndex] as ImageMessage
    if (!message?.data?.data) {
      return [null, "Invalid image data"]
    }

    try {
      let bytes: Uint8Array

      if (Array.isArray(message.data.data)) {
        bytes = new Uint8Array(message.data.data as number[])
      } else if (typeof message.data.data === "string") {
        bytes = parsePythonByteString(message.data.data)
      } else {
        return [null, "Unrecognized data format"]
      }

      const base64Data = uint8ArrayToBase64(bytes)
      const format = (message.data.format || "").toLowerCase()

      if (format.includes("jpeg") || format.includes("jpg")) {
        return [`data:image/jpeg;base64,${base64Data}`, null]
      } else if (format.includes("png")) {
        return [`data:image/png;base64,${base64Data}`, null]
      } else {
        return [`data:image/jpeg;base64,${base64Data}`, null]
      }
    } catch (err) {
      console.error("Error processing image data:", err)
      return [null, "Failed to process image data"]
    }
  }, [allMessages, currentMessageIndex])

  // Playback effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (playbackState.isPlaying && allMessages.length) {
      interval = setInterval(
        () => {
          const nextIndex = (currentMessageIndex + 1) % allMessages.length
          if (nextIndex !== currentMessageIndex) {
            dispatch(ionDataActions.setCurrentMessageIndex(nextIndex))
          }
        },
        1000 / (playbackState.speed * playbackSpeed),
      )
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [playbackState.isPlaying, playbackState.speed, playbackSpeed, currentMessageIndex, allMessages.length, dispatch])

  const handleSliderChange = (value: number[]) => {
    dispatch(ionDataActions.setCurrentMessageIndex(value[0]))
  }

  const togglePlayback = () => {
    dispatch(ionDataActions.setPlaybackState({ isPlaying: !playbackState.isPlaying }))
  }

  const skipBackward = () => {
    dispatch(ionDataActions.setCurrentMessageIndex(Math.max(0, currentMessageIndex - 10)))
  }

  const skipForward = () => {
    dispatch(ionDataActions.setCurrentMessageIndex(Math.min(totalMessages - 1, currentMessageIndex + 10)))
  }

  // If no image topic is available, don't render the component
  if (!availableImageTopic) {
    return null
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="py-6 relative">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Camera className="h-5 w-5 text-muted-foreground" />
              <h3 className="text-lg font-semibold">OhmniClean log</h3>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" className="px-3" onClick={() => setShowJsonViewer(!showJsonViewer)}>
                {showJsonViewer ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
                {showJsonViewer ? "Hide Data" : "Show Data"}
              </Button>
            </div>
          </div>

          {selectedTopic && allMessages ? (
            <>
              <div className="mb-6 aspect-video w-full bg-black/10 rounded-lg overflow-hidden relative">
                {localError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-red-500 bg-black/5 p-4 text-center">
                    {localError}
                  </div>
                ) : imageSrc ? (
                  <img
                    src={imageSrc || "/placeholder.svg"}
                    alt="Camera Feed"
                    className="w-full h-full object-contain"
                    onError={() => {
                      console.error("Failed to load image in <img> element.")
                    }}
                  />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground bg-black/5 p-4 text-center">
                    No image data available
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <select
                    className="text-sm border rounded px-2 py-1"
                    value={playbackSpeed}
                    onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
                  >
                    <option value="0.25">0.25x</option>
                    <option value="0.5">0.5x</option>
                    <option value="1">1x</option>
                    <option value="2">2x</option>
                    <option value="4">4x</option>
                  </select>
                </div>
                <div className="text-sm text-muted-foreground">
                  Frame {currentMessageIndex + 1} of {totalMessages}
                </div>
              </div>

              <div className="mb-6 space-y-4">
                <div className="flex items-center gap-4">
                  <Button variant="outline" size="icon" onClick={skipBackward} className="w-10 h-10">
                    <SkipBack className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon" onClick={togglePlayback} className="w-10 h-10">
                    {playbackState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </Button>
                  <Button variant="outline" size="icon" onClick={skipForward} className="w-10 h-10">
                    <SkipForward className="h-4 w-4" />
                  </Button>
                  <div className="flex-1">
                    <Slider
                      value={[currentMessageIndex]}
                      max={Math.max(0, totalMessages - 1)}
                      step={1}
                      onValueChange={handleSliderChange}
                    />
                  </div>
                </div>
              </div>

              {showJsonViewer && (
                <JsonViewer data={allMessages[currentMessageIndex] || {}} isExpanded={true} enableSearch={true} />
              )}
            </>
          ) : (
            <div className="text-center text-muted-foreground py-8">
              No image data available for {availableImageTopic}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

