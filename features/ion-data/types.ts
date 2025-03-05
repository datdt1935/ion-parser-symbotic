import type { ParsedIonData } from "@/app/types"

export interface TopicMessage {
  topicName: string
  topicType: string
  timestamp: number
  messages: any[]
  frequency?: number
}

export interface IonDataState {
  isLoading: number
  data: ParsedIonData | null
  error: string | null
  filters: {
    page: number
    limit: number
  }
  selectedTopic: string | null
  currentMessageIndex: number
  playback: {
    isPlaying: boolean
    speed: number // playback speed multiplier
    currentTime: number // current playback time in milliseconds
    startTime: number | null // timestamp when playback started
    startOffset: number // offset from the beginning of the log
    logStartTime: number | null // timestamp of the first message
    logEndTime: number | null // timestamp of the last message
  }
  availableImageTopic: string | null
}

export interface SetDataPayload {
  data: ParsedIonData
}

export interface SetErrorPayload {
  error: string
}

