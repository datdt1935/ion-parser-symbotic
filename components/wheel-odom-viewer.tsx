"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { JsonViewer } from "./json-viewer"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Loader2, SkipBack, SkipForward, Eye, EyeOff } from "lucide-react"
import type { RootState } from "@/store/store"
import { usePlaybackScene } from "@/app/scene/playback-scene-context"

type ViewMode = "timeline" | "full"

interface WheelOdomMessage {
  timestamp?: number
  data?: {
    header?: {
      seq?: number
      stamp?: number
      frame_id?: string
    }
    child_frame_id?: string
    pose?: {
      pose?: {
        position?: {
          x: number
          y: number
          z: number
        }
        orientation?: {
          x: number
          y: number
          z: number
          w: number
        }
      }
    }
  }
}

export function WheelOdomViewer() {
  const { setPosition, setQuaternion } = usePlaybackScene()
  const [viewMode, setViewMode] = useState<ViewMode>("timeline")
  const [isChangingView, setIsChangingView] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(100)
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const currentMessageIndex = useSelector((state: RootState) => state.ionData.currentMessageIndex)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const totalMessages = useSelector(ionDataSelectors.selectTotalMessages)
  const playbackState = useSelector(ionDataSelectors.selectPlaybackState)
  const [showJsonViewer, setShowJsonViewer] = useState(false)

  // Set default topic to wheel_odom when component mounts or when topics change
  useEffect(() => {
    if (topicNames.includes("/tb_control/wheel_odom") && selectedTopic !== "/tb_control/wheel_odom") {
      dispatch(ionDataActions.setSelectedTopic("/tb_control/wheel_odom"))
    }
  }, [topicNames, selectedTopic, dispatch])

  // Update 3D model position and rotation when playing back messages
  useEffect(() => {
    if (!allMessages[currentMessageIndex]) return

    const message = allMessages[currentMessageIndex] as WheelOdomMessage
    if (message.data?.pose?.pose) {
      const { position, orientation } = message.data.pose.pose

      // Update position if available, mapping Y to Z coordinate
      if (position) {
        setPosition(
          position.x || 0,
          position.z || 0, // Use Z as Y in 3D view
          position.y || 0, // Use Y as Z in 3D view
        )
      }

      // Update orientation if available, swapping Z and Y components
      if (orientation) {
        setQuaternion(
          orientation.x || 0,
          orientation.z || 0, // Swap Z to Y
          orientation.y || 0, // Swap Y to Z
          orientation.w || 1,
        )
      }
    }
  }, [currentMessageIndex, allMessages, setPosition, setQuaternion])

  // Also update the getCurrentTransform function to show the correct mapping:
  const getCurrentTransform = () => {
    const message = allMessages[currentMessageIndex] as WheelOdomMessage
    if (!message?.data?.pose?.pose) return null

    const { position, orientation } = message.data.pose.pose
    return {
      position: position
        ? {
            x: position.x.toFixed(3),
            y: position.z.toFixed(3), // Display Z as Y
            z: position.y.toFixed(3), // Display Y as Z
          }
        : null,
      orientation: orientation
        ? {
            x: orientation.x.toFixed(3),
            y: orientation.z.toFixed(3), // Display Z as Y
            z: orientation.y.toFixed(3), // Display Y as Z
            w: orientation.w.toFixed(3),
          }
        : null,
      timestamp: message.timestamp,
      frameId: message.data.header?.frame_id,
      childFrameId: message.data.child_frame_id,
    }
  }

  // Stop playback when switching to full view
  useEffect(() => {
    if (viewMode === "full" && playbackState.isPlaying) {
      dispatch(ionDataActions.setPlaybackState({ isPlaying: false }))
    }
  }, [viewMode, playbackState.isPlaying, dispatch])

  const handleSliderChange = (value: number[]) => {
    dispatch(ionDataActions.setCurrentMessageIndex(value[0]))
  }

  const togglePlayback = () => {
    dispatch(ionDataActions.setPlaybackState({ isPlaying: !playbackState.isPlaying }))
  }

  const toggleViewMode = () => {
    setIsChangingView(true)
    setViewMode((current) => (current === "timeline" ? "full" : "timeline"))
    // Add a small delay to show loading state
    setTimeout(() => {
      setIsChangingView(false)
    }, 300)
  }

  const skipBackward = () => {
    dispatch(ionDataActions.setCurrentMessageIndex(Math.max(0, currentMessageIndex - 10)))
  }

  const skipForward = () => {
    dispatch(ionDataActions.setCurrentMessageIndex(Math.min(totalMessages - 1, currentMessageIndex + 10)))
  }

  // Playback effect
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (playbackState.isPlaying && allMessages.length && viewMode === "timeline") {
      interval = setInterval(
        () => {
          dispatch(ionDataActions.setCurrentMessageIndex((currentMessageIndex + 1) % allMessages.length))
        },
        1000 / (playbackState.speed * playbackSpeed),
      )
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [
    playbackState.isPlaying,
    playbackState.speed,
    playbackSpeed,
    currentMessageIndex,
    allMessages.length,
    dispatch,
    viewMode,
  ])

  if (!selectedTopic || selectedTopic !== "/tb_control/wheel_odom") {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-muted-foreground text-center">No wheel odometry data found in the log file</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardContent className="py-6 relative">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Recorded Log</h3>
          <div className="flex items-center gap-2">
            {/*   <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === "timeline" ? "bg-muted" : ""}`}
              onClick={() => setViewMode("timeline")}
              disabled={isChangingView}
            >
              {isChangingView && viewMode === "full" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Clock className="h-4 w-4 mr-2" />
              )}
              Timeline
            </Button>
      <Button
              variant="ghost"
              size="sm"
              className={`px-3 ${viewMode === "full" ? "bg-muted" : ""}`}
              onClick={() => setViewMode("full")}
              disabled={isChangingView}
            >
              {isChangingView && viewMode === "timeline" ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <FileJson className="h-4 w-4 mr-2" />
              )}
              Raw Data
            </Button>  */}
            <Button variant="ghost" size="sm" className="px-3" onClick={() => setShowJsonViewer(!showJsonViewer)}>
              {showJsonViewer ? <Eye className="h-4 w-4 mr-2" /> : <EyeOff className="h-4 w-4 mr-2" />}
              {showJsonViewer ? "Hide Data" : "Show Data"}
            </Button>
          </div>
        </div>

        {isChangingView && (
          <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        )}

        {viewMode === "timeline" ? (
          <>
            <div className="mb-4 p-4 bg-muted/50 rounded-lg">
              <h4 className="text-sm font-medium mb-2">Current Transform</h4>
              {getCurrentTransform() ? (
                <div className="text-xs font-mono space-y-1">
                  <div>
                    Frame: {getCurrentTransform()?.frameId} → {getCurrentTransform()?.childFrameId}
                  </div>
                  {getCurrentTransform()?.position && (
                    <div>
                      Position: ( x: {getCurrentTransform()?.position.x}, y: {getCurrentTransform()?.position.y}, z:{" "}
                      {getCurrentTransform()?.position.z})
                    </div>
                  )}
                  {getCurrentTransform()?.orientation && (
                    <div>
                      Orientation: ( x: {getCurrentTransform()?.orientation.x}, y:{" "}
                      {getCurrentTransform()?.orientation.z}, z: {getCurrentTransform()?.orientation.y}, w:{" "}
                      {getCurrentTransform()?.orientation.w})
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-xs text-muted-foreground">No transform data available</div>
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
                  <option value="6">6x</option>
                  <option value="10">10x</option>
                  <option value="15">15x</option>
                  <option value="20">20x</option>
                  <option value="40">40x</option>
                  <option value="60">60x</option>
                  <option value="100">100x</option>
                </select>
              </div>
              <div className="text-sm text-muted-foreground">
                Message {currentMessageIndex + 1} of {totalMessages}
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
          <div className="space-y-4">
            <div className="flex items-center justify-end">
              <div className="text-sm text-muted-foreground">Total Messages: {totalMessages}</div>
            </div>

            {showJsonViewer && <JsonViewer data={allMessages} isExpanded={false} enableSearch={true} />}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

