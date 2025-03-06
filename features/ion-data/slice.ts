import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { ParsedIonData } from "@/app/types"
import type { TopicMessage } from "./types"

// Types
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
  // Timestamp-based playback state
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

interface SetDataPayload {
  data: ParsedIonData
}

interface SetErrorPayload {
  error: string
}

// Initial State
export const initialState: IonDataState = {
  isLoading: 0,
  data: null,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
  selectedTopic: null,
  currentMessageIndex: 0,
  playback: {
    isPlaying: false,
    speed: 1, // Default speed: 1x
    currentTime: 0,
    startTime: null,
    startOffset: 0,
    logStartTime: null,
    logEndTime: null,
  },
  availableImageTopic: null,
}

// Helper function to extract topics from raw data
const extractTopics = (rawData: any[]): TopicMessage[] => {
  const topics: TopicMessage[] = []

  rawData.forEach((item) => {
    if (item?.topics && Array.isArray(item.topics)) {
      item.topics.forEach((topic: any) => {
        if (topic.topicName && topic.topicType) {
          topics.push({
            topicName: topic.topicName,
            topicType: topic.topicType,
            timestamp: topic.timestamp || 0,
            messages: topic.messages || [],
            frequency: topic.frequency,
          })
        }
      })
    }
  })

  return topics
}

// Helper function to find log start and end times
const findLogTimeRange = (rawData: any[]): { startTime: number | null; endTime: number | null } => {
  let startTime: number | null = null
  let endTime: number | null = null

  // Flatten all messages from all topics
  const allMessages: { timestamp: number }[] = []

  rawData.forEach((item) => {
    if (item?.topics && Array.isArray(item.topics)) {
      item.topics.forEach((topic: any) => {
        if (Array.isArray(topic.messages)) {
          topic.messages.forEach((msg: any) => {
            if (msg.timestamp) {
              allMessages.push({ timestamp: msg.timestamp })
            }
          })
        }
      })
    }
  })

  // Sort messages by timestamp
  allMessages.sort((a, b) => a.timestamp - b.timestamp)

  if (allMessages.length > 0) {
    startTime = allMessages[0].timestamp
    endTime = allMessages[allMessages.length - 1].timestamp
  }

  return { startTime, endTime }
}

// Slice
const ionDataSlice = createSlice({
  name: "ionData",
  initialState,
  reducers: {
    popLoading(state) {
      state.isLoading -= 1
    },
    pushLoading(state) {
      state.isLoading += 1
    },
    setData(state, action: PayloadAction<SetDataPayload>) {
      state.data = action.payload.data
      state.error = null
      state.selectedTopic = null
      state.currentMessageIndex = 0

      // Initialize playback time range
      const { startTime, endTime } = findLogTimeRange(action.payload.data.raw || [])
      state.playback.logStartTime = startTime
      state.playback.logEndTime = endTime
      state.playback.currentTime = 0
      state.playback.startOffset = 0
      state.playback.startTime = null
      state.playback.isPlaying = false

      // Check for available image topic when data is loaded
      const topics = extractTopics(action.payload.data.raw || [])
      state.availableImageTopic =
        topics
          .map((t) => t.topicName)
          .find((topic) => topic.toLowerCase().includes("/image_raw/compressed_throttle")) || null
    },
    setError(state, action: PayloadAction<SetErrorPayload>) {
      state.error = action.payload.error
    },
    setFilters(state, action: PayloadAction<Partial<typeof initialState.filters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearData(state) {
      return {
        ...initialState,
        availableImageTopic: null,
      }
    },
    setSelectedTopic(state, action: PayloadAction<string | null>) {
      state.selectedTopic = action.payload
      state.currentMessageIndex = 0 // Reset index when changing topics
    },
    setCurrentMessageIndex(state, action: PayloadAction<number>) {
      state.currentMessageIndex = action.payload
    },
    // Playback actions
    startPlayback(state) {
      state.playback.isPlaying = true
      state.playback.startTime = Date.now()
    },
    pausePlayback(state) {
      if (state.playback.isPlaying) {
        state.playback.isPlaying = false
        // Save current position as offset for next play
        if (state.playback.startTime !== null) {
          const elapsed = (Date.now() - state.playback.startTime) * state.playback.speed
          state.playback.startOffset = state.playback.startOffset + elapsed
        }
        state.playback.startTime = null
      }
    },
    setPlaybackSpeed(state, action: PayloadAction<number>) {
      // When changing speed during playback, we need to adjust the offset and restart
      if (state.playback.isPlaying && state.playback.startTime !== null) {
        const elapsed = (Date.now() - state.playback.startTime) * state.playback.speed
        state.playback.startOffset = state.playback.startOffset + elapsed
        state.playback.startTime = Date.now()
      }
      state.playback.speed = action.payload
    },
    updatePlaybackTime(state) {
      if (state.playback.isPlaying && state.playback.startTime !== null) {
        const elapsed = (Date.now() - state.playback.startTime) * state.playback.speed
        state.playback.currentTime = state.playback.startOffset + elapsed

        // Loop playback if we reach the end
        if (
          state.playback.logEndTime !== null &&
          state.playback.logStartTime !== null &&
          state.playback.currentTime > state.playback.logEndTime - state.playback.logStartTime
        ) {
          state.playback.startOffset = 0
          state.playback.startTime = Date.now()
          state.playback.currentTime = 0
        }
      }
    },
    seekPlayback(state, action: PayloadAction<number>) {
      // Seek to a specific percentage of the log duration
      if (state.playback.logStartTime !== null && state.playback.logEndTime !== null) {
        const duration = state.playback.logEndTime - state.playback.logStartTime
        state.playback.currentTime = duration * action.payload
        state.playback.startOffset = state.playback.currentTime

        if (state.playback.isPlaying) {
          state.playback.startTime = Date.now()
        }
      }
    },
  },
})

export const ionDataActions = ionDataSlice.actions
export const ionDataReducer = ionDataSlice.reducer

