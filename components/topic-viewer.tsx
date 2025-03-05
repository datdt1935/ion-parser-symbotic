"use client"

import { Button } from "@/components/ui/button"

import { useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JsonViewer } from "./json-viewer"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import { PlaybackControls } from "./playback-controls"

export function TopicViewer() {
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const currentMessage = useSelector(ionDataSelectors.selectCurrentTopicMessage)
  const currentMessageIndex = useSelector(ionDataSelectors.selectCurrentMessageIndexByTime)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const playback = useSelector(ionDataSelectors.selectPlayback)

  const handleTopicSelect = (topic: string) => {
    dispatch(ionDataActions.setSelectedTopic(topic))
  }

  // Update playback time at regular intervals
  useEffect(() => {
    if (!playback.isPlaying) return

    const intervalId = setInterval(() => {
      dispatch(ionDataActions.updatePlaybackTime())
    }, 16) // ~60fps

    return () => clearInterval(intervalId)
  }, [playback.isPlaying, dispatch])

  const handleTfStaticView = () => {
    if (topicNames.includes("/tf_static")) {
      dispatch(ionDataActions.setSelectedTopic("/tf_static"))
    }
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
            {topicNames.includes("/tf_static") && selectedTopic !== "/tf_static" && (
              <Button variant="outline" onClick={handleTfStaticView}>
                View TF Static
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {selectedTopic && allMessages ? (
        <Card>
          <CardContent className="py-6">
            <div className="mb-4">
              <div>
                <span className="text-sm font-medium">Message Type: </span>
                <span className="text-sm text-muted-foreground">{currentMessage?.topicType}</span>
              </div>
            </div>

            <div className="mb-6">
              <PlaybackControls showSkipButtons={false} />
            </div>

            <JsonViewer data={allMessages[currentMessageIndex] || {}} isExpanded={true} enableSearch={false} />
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

