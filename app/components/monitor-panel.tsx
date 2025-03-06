"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data"
import { Search, Clock } from "lucide-react"

export function MonitorPanel() {
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const currentMessage = useSelector(ionDataSelectors.selectCurrentTopicMessage)
  const currentMessageIndex = useSelector(ionDataSelectors.selectCurrentMessageIndexByTime)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const messageLogs = useSelector(ionDataSelectors.selectRosoutMessages)

  const [searchQuery, setSearchQuery] = useState("")

  const handleTopicSelect = (topic: string) => {
    dispatch(ionDataActions.setSelectedTopic(topic))
  }

  // Filter messages based on search query
  const filteredMessages = messageLogs.filter((message) => {
    if (!searchQuery) return true
    return JSON.stringify(message).toLowerCase().includes(searchQuery.toLowerCase())
  })

  // Helper function to extract message content safely
  const getMessageContent = (message: any) => {
    if (message?.data?.msg) {
      return message.data.msg
    } else if (message?.msg) {
      return message.msg
    } else {
      return JSON.stringify(message.data || message)
    }
  }

  // Helper function to calculate relative timestamp
  const getRelativeTimestamp = (timestamp: number, messages: any[]) => {
    if (!timestamp) return "N/A"

    // Find the first timestamp in the messages array
    const firstMessage = messages.find((msg) => msg?.timestamp)
    const firstTimestamp = firstMessage?.timestamp || timestamp

    // Calculate seconds from the first message
    const secondsFromStart = (timestamp - firstTimestamp) / 1000
    return `${secondsFromStart.toFixed(2)}s`
  }

  return (
    <div className="grid grid-cols-2 gap-4 mt-4">
      {/* Left side: Topic selector and current message */}
      <Card className="p-4 flex flex-col h-full">
        <div className="mb-2">
          <label htmlFor="topic-select" className="text-sm font-medium mb-1 block">
            Select topic
          </label>
          <Select value={selectedTopic || ""} onValueChange={handleTopicSelect}>
            <SelectTrigger id="topic-select">
              <SelectValue placeholder="Select Topic" />
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

        <div className="flex flex-col flex-1 h-full">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium">Messages</h3>
            {currentMessage && allMessages[currentMessageIndex] && (
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-3.5 w-3.5 mr-1" />
                <span>{getRelativeTimestamp(allMessages[currentMessageIndex]?.timestamp, allMessages)}</span>
              </div>
            )}
          </div>
          <div className="bg-muted/50 rounded-md p-4 font-mono text-sm whitespace-pre overflow-auto h-full flex-1 max-h-[600px]">
            {currentMessage && allMessages[currentMessageIndex] ? (
              JSON.stringify(allMessages[currentMessageIndex]?.data || {}, null, 2)
            ) : (
              <span className="text-muted-foreground">No messages available</span>
            )}
          </div>
        </div>
      </Card>

      {/* Right side: Log console with search */}
      <Card className="p-4 space-y-4 h-full">
        <div>
          <h3 className="text-lg font-medium mb-4">Log Console</h3>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search logs..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>

        <div className="space-y-2 overflow-auto max-h-[600px] font-mono text-sm">
          {filteredMessages.map((message, index) => {
            const timestamp = getRelativeTimestamp(message.timestamp, filteredMessages)
            return (
              <div
                key={index}
                className={`p-2 rounded ${index === currentMessageIndex ? "bg-primary/10" : "hover:bg-muted/50"}`}
              >
                <span className="text-muted-foreground mr-2">[{timestamp}]</span>
                <span>{getMessageContent(message)}</span>
              </div>
            )
          })}
          {filteredMessages.length === 0 && (
            <div className="text-center text-muted-foreground py-4">No matching logs found</div>
          )}
        </div>
      </Card>
    </div>
  )
}

