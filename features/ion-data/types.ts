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
  playback: {
    selectedTopic: string | null
    isPlaying: boolean
    currentTime: number
    startTime: number
    endTime: number
    playbackSpeed: number
  }
}

export interface SetDataPayload {
  data: ParsedIonData
}

export interface SetErrorPayload {
  error: string
}

