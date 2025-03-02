"use client"

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface TopicSelectorProps {
  topics: string[]
  selectedTopic: string | null
  onTopicSelect: (topic: string) => void
}

export function TopicSelector({ topics, selectedTopic, onTopicSelect }: TopicSelectorProps) {
  if (topics.length === 0) return null

  return (
    <Select value={selectedTopic || ""} onValueChange={onTopicSelect}>
      <SelectTrigger className="w-[300px]">
        <SelectValue placeholder="Select a topic" />
      </SelectTrigger>
      <SelectContent>
        {topics.map((topic) => (
          <SelectItem key={topic} value={topic}>
            {topic}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

