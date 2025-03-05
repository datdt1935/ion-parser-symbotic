"use client"

import { useEffect, useState, useMemo } from "react"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import { parsePythonByteString, uint8ArrayToBase64 } from "@/app/utils/image-processing"

import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, Camera } from "lucide-react"
import { JsonViewer } from "./json-viewer"
import { PlaybackControls } from "./playback-controls"

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
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const playback = useSelector(ionDataSelectors.selectPlayback)
  const currentMessageIndex = useSelector(ionDataSelectors.selectCurrentMessageIndexByTime)
  const [showJsonViewer, setShowJsonViewer] = useState(false)

  // Set default topic when component mounts
  useEffect(() => {
    if (availableImageTopic && selectedTopic !== availableImageTopic) {
      dispatch(ionDataActions.setSelectedTopic(availableImageTopic))
    }
  }, [availableImageTopic, selectedTopic, dispatch])

  // Update playback time at regular intervals
  useEffect(() => {
    if (!playback.isPlaying) return

    const intervalId = setInterval(() => {
      dispatch(ionDataActions.updatePlaybackTime())
    }, 16) // ~60fps

    return () => clearInterval(intervalId)
  }, [playback.isPlaying, dispatch])

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

              <div className="mb-6">
                <PlaybackControls />
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

