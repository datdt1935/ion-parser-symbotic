"use client"

import { Card, CardContent } from "@/components/ui/card"
import { TopicSelector } from "./topic-selector"
import { PlaybackControls } from "./playback-controls"
import { TimelineSlider } from "./timeline-slider"
import { MessageViewer } from "./message-viewer"
import { usePlayback } from "./use-playback"

export function TopicViewer() {
  const {
    topicNames,
    selectedTopic,
    isPlaying,
    currentTime,
    startTime,
    endTime,
    playbackSpeed,
    currentMessage,
    progress,
    handleTopicSelect,
    handlePlayPause,
    handleSeek,
    handleSpeedChange,
  } = usePlayback()

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
            <TopicSelector topics={topicNames} selectedTopic={selectedTopic} onTopicSelect={handleTopicSelect} />
            <PlaybackControls
              isPlaying={isPlaying}
              playbackSpeed={playbackSpeed}
              onPlayPause={handlePlayPause}
              onSpeedChange={handleSpeedChange}
            />
          </div>

          <TimelineSlider
            currentTime={currentTime}
            startTime={startTime}
            endTime={endTime}
            progress={progress}
            onSeek={handleSeek}
          />
        </CardContent>
      </Card>

      <MessageViewer message={currentMessage} selectedTopic={selectedTopic} />
    </div>
  )
}

