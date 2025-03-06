"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { JsonViewer } from "./json-viewer"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data" // Import from index
import { Button } from "@/components/ui/button"
import { Clock, FileJson, Loader2 } from "lucide-react"
import { PlaybackControls } from "./playback-controls"

type ViewMode = "timeline" | "full"

export function RosoutAggViewer() {
  const [viewMode, setViewMode] = useState<ViewMode>("timeline")
  const [isChangingView, setIsChangingView] = useState(false)
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const totalMessages = useSelector(ionDataSelectors.selectTotalMessages)
  const playback = useSelector(ionDataSelectors.selectPlayback)
  const currentMessageIndex = useSelector(ionDataSelectors.selectCurrentMessageIndexByTime)

  // Set default topic to rosout_agg when component mounts or when topics change
  useEffect(() => {
    if (topicNames.includes("/rosout_agg") && !selectedTopic) {
      dispatch(ionDataActions.setSelectedTopic("/rosout_agg"))
    }
  }, [topicNames, selectedTopic, dispatch])

  // Stop playback when switching to full view
  useEffect(() => {
    if (viewMode === "full" && playback.isPlaying) {
      dispatch(ionDataActions.pausePlayback())
    }
  }, [viewMode, playback.isPlaying, dispatch])

  // Update playback time at regular intervals
  useEffect(() => {
    if (!playback.isPlaying) return

    const intervalId = setInterval(() => {
      dispatch(ionDataActions.updatePlaybackTime())
    }, 16) // ~60fps

    return () => clearInterval(intervalId)
  }, [playback.isPlaying, dispatch])

  const toggleViewMode = () => {
    setIsChangingView(true)
    setViewMode((current) => (current === "timeline" ? "full" : "timeline"))
    // Add a small delay to show loading state
    setTimeout(() => {
      setIsChangingView(false)
    }, 300)
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
                <div className="mb-6">
                  <PlaybackControls />
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

