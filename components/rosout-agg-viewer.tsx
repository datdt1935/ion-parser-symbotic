"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { JsonViewer } from "./json-viewer"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Play, Pause, Clock, FileJson, Loader2 } from "lucide-react"
import type { RootState } from "@/store/store"

type ViewMode = "timeline" | "full"

export function RosoutAggViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>("full")
  const [isChangingView, setIsChangingView] = useState(false)
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const currentMessage = useSelector(ionDataSelectors.selectCurrentTopicMessage)
  const currentMessageIndex = useSelector((state: RootState) => state.ionData.currentMessageIndex)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const totalMessages = useSelector(ionDataSelectors.selectTotalMessages)
  const playbackState = useSelector(ionDataSelectors.selectPlaybackState)

  // Set default topic to rosout_agg when component mounts or when topics change
  useEffect(() => {
    if (topicNames.includes("/rosout_agg") && !selectedTopic) {
      dispatch(ionDataActions.setSelectedTopic("/rosout_agg"))
    }
  }, [topicNames, selectedTopic, dispatch])

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

  // Playback effect
  useEffect(() => {
    if (!playbackState.isPlaying || !allMessages.length || viewMode === "full") return

    const interval = setInterval(() => {
      dispatch(ionDataActions.setCurrentMessageIndex((currentMessageIndex + 1) % allMessages.length))
    }, 1000 / playbackState.speed)

    return () => clearInterval(interval)
  }, [playbackState.isPlaying, playbackState.speed, currentMessageIndex, allMessages.length, dispatch, viewMode])

  if (topicNames.length === 0) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-muted-foreground text-center">No topics found in the log file</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-end gap-2">
        <Button
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
        </Button>
      </div>

      {selectedTopic && allMessages ? (
        <Card>
          <CardContent className="py-6 relative">
            {isChangingView && (
              <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}
            {viewMode === "timeline" ? (
              <>
                <div className="flex items-center justify-end mb-4">
                  <div className="text-sm text-muted-foreground">
                    Message {currentMessageIndex + 1} of {totalMessages}
                  </div>
                </div>

                <div className="mb-6 space-y-4">
                  <div className="flex items-center gap-4">
                    <Button variant="outline" size="icon" onClick={togglePlayback} className="w-10 h-10">
                      {playbackState.isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
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

                <JsonViewer data={allMessages[currentMessageIndex] || {}} isExpanded={true} enableSearch={true} />
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-end">
                  <div className="text-sm text-muted-foreground">Total Messages: {totalMessages}</div>
                </div>

                <JsonViewer data={allMessages} isExpanded={false} enableSearch={true} />
              </div>
            )}
          </CardContent>
        </Card>
      ) : selectedTopic ? (
        <Card>
          <CardContent className="py-6">
            <p className="text-center text-muted-foreground">No messages found for this topic</p>
          </CardContent>
        </Card>
      ) : null}
    </div>
  )
}

