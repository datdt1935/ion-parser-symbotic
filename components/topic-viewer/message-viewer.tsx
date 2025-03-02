"use client"

import { Card, CardContent } from "@/components/ui/card"
import { JsonViewer } from "@/components/json-viewer"
import { formatDateTime, formatDateTimeDisplay } from "@/lib/utils/date"
import type { TopicMessage } from "@/features/ion-data/types"

interface MessageViewerProps {
  message: TopicMessage | null
  selectedTopic: string | null
}

export function MessageViewer({ message, selectedTopic }: MessageViewerProps) {
  if (!selectedTopic) return null

  if (!message) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">No message found at current timestamp</p>
        </CardContent>
      </Card>
    )
  }

  const timestamp = formatDateTime(message.timestamp)

  return (
    <Card>
      <CardContent className="py-6">
        <div className="flex flex-col gap-2 mb-4">
          <div className="flex items-center justify-between">
            <div>
              <span className="text-sm font-medium">Message Type: </span>
              <span className="text-sm text-muted-foreground">{message.topicType}</span>
            </div>
            <span className="text-sm font-medium">Timestamp: <b>{timestamp}</b></span>
          </div>
          <div className="text-sm text-muted-foreground text-right font-mono">{formatDateTimeDisplay(timestamp)}</div>
        </div>
        <JsonViewer data={message.messages} />
      </CardContent>
    </Card>
  )
}

