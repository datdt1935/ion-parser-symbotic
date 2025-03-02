"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { JsonViewer } from "./json-viewer"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import { Slider } from "@/components/ui/slider"
import type { RootState } from "@/store/store"

export function TopicViewer() {
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const currentMessage = useSelector(ionDataSelectors.selectCurrentTopicMessage)
  const currentMessageIndex = useSelector((state: RootState) => state.ionData.currentMessageIndex)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const totalMessages = useSelector(ionDataSelectors.selectTotalMessages)

  const handleTopicSelect = (topic: string) => {
    dispatch(ionDataActions.setSelectedTopic(topic))
  }

  const handleSliderChange = (value: number[]) => {
    dispatch(ionDataActions.setCurrentMessageIndex(value[0]))
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
          </div>
        </CardContent>
      </Card>

      {selectedTopic && allMessages ? (
        <Card>
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <span className="text-sm font-medium">Message Type: </span>
                <span className="text-sm text-muted-foreground">{currentMessage?.topicType}</span>
              </div>
              <div className="text-sm text-muted-foreground">
                Message {currentMessageIndex + 1} of {totalMessages}
              </div>
            </div>

            <div className="mb-6">
              <Slider
                value={[currentMessageIndex]}
                max={Math.max(0, totalMessages - 1)}
                step={1}
                onValueChange={handleSliderChange}
                className="my-4"
              />
            </div>

            <JsonViewer
              data={allMessages[currentMessageIndex] || {}}
              isExpanded={true}
              enableSearch={false} // Enable search for topic messages
            />
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

