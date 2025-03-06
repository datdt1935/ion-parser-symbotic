"use client"

import { useEffect, useMemo } from "react"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data" // Import from index
import { parsePythonByteString, uint8ArrayToBase64 } from "@/app/utils/image-processing"
import { Camera } from "lucide-react"

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

export function CameraFeedViewer() {
  const dispatch = useDispatch()
  const cameraImageMessages = useSelector(ionDataSelectors.selectCameraImageMessages)
  const playback = useSelector(ionDataSelectors.selectPlayback)
  const currentMessageIndex = useSelector((state) => {
    // Find the message index based on current playback time
    if (!cameraImageMessages.length || playback.logStartTime === null) return 0

    // Find the message with timestamp closest to current playback time
    const targetTime = playback.logStartTime + playback.currentTime

    // Binary search would be more efficient for large logs
    let closestIndex = 0
    let closestDiff = Number.MAX_SAFE_INTEGER

    cameraImageMessages.forEach((msg, index) => {
      if (msg.timestamp) {
        const diff = Math.abs(msg.timestamp - targetTime)
        if (diff < closestDiff) {
          closestDiff = diff
          closestIndex = index
        }
      }
    })

    return closestIndex
  })

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
    if (!cameraImageMessages || !cameraImageMessages.length) {
      return [null, "No image messages available"]
    }

    const message = cameraImageMessages[currentMessageIndex] as ImageMessage
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
  }, [cameraImageMessages, currentMessageIndex])

  // If no camera images are available, show placeholder
  if (!cameraImageMessages.length) {
    return (
      <div className="aspect-video w-full bg-black/10 rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <Camera className="h-8 w-8 mx-auto mb-2" />
          <p>No camera feed available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="aspect-video w-full bg-black/10 rounded-lg overflow-hidden relative">
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
  )
}

