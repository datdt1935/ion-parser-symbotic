import { createSlice, type PayloadAction, createSelector } from "@reduxjs/toolkit"
import type { ParsedIonData } from "@/app/types"
import type { RootState } from "@/store/reducer"
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
  // New timestamp-based playback state
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

// Base selectors
const selectIonData = (state: RootState) => state.ionData.data
const selectRawData = (state: RootState) => state.ionData.data?.raw
const selectIsLoading = (state: RootState) => state.ionData.isLoading > 0
const selectError = (state: RootState) => state.ionData.error
const selectFilters = (state: RootState) => state.ionData.filters
const selectSelectedTopic = (state: RootState) => state.ionData.selectedTopic
const selectAvailableImageTopic = (state: RootState) => state.ionData.availableImageTopic
const selectPlayback = (state: RootState) => state.ionData.playback

// Derived selectors
const selectTopics = createSelector(selectRawData, (raw) => (raw ? extractTopics(raw) : []))

const selectTopicNames = createSelector(selectTopics, (topics) => [...new Set(topics.map((t) => t.topicName))])

const selectCurrentTopicMessage = createSelector([selectTopics, selectSelectedTopic], (topics, selectedTopic) => {
  if (!selectedTopic) return null

  const topicMessages = topics.filter((t) => t.topicName === selectedTopic)
  if (!topicMessages.length) return null

  return topicMessages[0]
})

const selectCurrentTopicAllMessages = createSelector(
  [selectCurrentTopicMessage],
  (currentTopic) => currentTopic?.messages || [],
)

const selectTotalMessages = createSelector([selectCurrentTopicAllMessages], (messages) => messages.length)

// New selector to get log duration in milliseconds
const selectLogDuration = createSelector([selectPlayback], (playback) => {
  if (playback.logStartTime === null || playback.logEndTime === null) return 0
  return playback.logEndTime - playback.logStartTime
})

// New selector to find the message index based on current playback time
const selectCurrentMessageIndexByTime = createSelector(
  [selectCurrentTopicAllMessages, selectPlayback],
  (messages, playback) => {
    if (!messages.length || playback.logStartTime === null) return 0

    // Find the message with timestamp closest to current playback time
    const targetTime = playback.logStartTime + playback.currentTime

    // Binary search would be more efficient for large logs
    let closestIndex = 0
    let closestDiff = Number.MAX_SAFE_INTEGER

    messages.forEach((msg, index) => {
      if (msg.timestamp) {
        const diff = Math.abs(msg.timestamp - targetTime)
        if (diff < closestDiff) {
          closestDiff = diff
          closestIndex = index
        }
      }
    })

    return closestIndex
  },
)

const selectRosoutMessages = createSelector(selectTopics, (topics) => {
  const rosoutTopic = topics.find((t) => t.topicName === "/rosout_agg")
  if (!rosoutTopic) return []
  return rosoutTopic.messages || []
})

const selectSessionInfo = createSelector(
  (state: RootState) => state.ionData.data?.raw,
  (raw) => {
    if (!raw) return null
    const sessionData = raw.find((item) => item?.metadata?.sessionInfo)
    return sessionData?.metadata?.sessionInfo || null
  },
)

const selectBotConfig = createSelector(
  (state: RootState) => state.ionData.data?.raw,
  (raw) => {
    if (!raw) return null
    const botConfigData = raw.find((item) => item?.metadata?.botConfig)
    return botConfigData?.metadata?.botConfig || null
  },
)

// Make sure the selectBotModelInfo selector is properly defined
const selectBotModelInfo = createSelector(
  (state: RootState) => state.ionData.data?.raw,
  (raw) => {
    if (!raw) return null
    const botModelData = raw.find((item) => item?.metadata?.botModel)
    return botModelData?.metadata?.botModel || null
  },
)

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
    // Updated playback actions
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

// Export selectors
export const ionDataSelectors = {
  selectIonData,
  selectIsLoading,
  selectError,
  selectFilters,
  selectTopics,
  selectTopicNames,
  selectCurrentTopicMessage,
  selectCurrentTopicAllMessages,
  selectTotalMessages,
  selectSelectedTopic,
  selectPlayback,
  selectRosoutMessages,
  selectBotModelInfo,
  selectAvailableImageTopic,
  selectLogDuration,
  selectCurrentMessageIndexByTime,
  selectSessionInfo,
  selectBotConfig,
  // Add the missing selectBotInfo selector
  selectBotInfo: createSelector(
    (state: RootState) => state.ionData.data?.raw,
    (raw) => {
      if (!raw) return null
      const botInfoData = raw.find((item) => item?.metadata?.botInfo)
      return botInfoData?.metadata?.botInfo || null
    },
  ),
}

export const ionDataActions = ionDataSlice.actions
export const ionDataReducer = ionDataSlice.reducer

