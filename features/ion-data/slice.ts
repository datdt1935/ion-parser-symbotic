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
  playback: {
    isPlaying: boolean
    speed: number // messages per second
  }
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
    speed: 1, // Default speed: 1 message per second
  },
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

// Base selectors
const selectIonData = (state: RootState) => state.ionData.data
const selectRawData = (state: RootState) => state.ionData.data?.raw
const selectIsLoading = (state: RootState) => state.ionData.isLoading > 0
const selectError = (state: RootState) => state.ionData.error
const selectFilters = (state: RootState) => state.ionData.filters
const selectSelectedTopic = (state: RootState) => state.ionData.selectedTopic

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

// Add playback selectors
const selectPlaybackState = (state: RootState) => state.ionData.playback

const selectRosoutMessages = createSelector(selectTopics, (topics) => {
  const rosoutTopic = topics.find((t) => t.topicName === "/rosout_agg")
  if (!rosoutTopic) return []
  return rosoutTopic.messages || []
})

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
    },
    setError(state, action: PayloadAction<SetErrorPayload>) {
      state.error = action.payload.error
    },
    setFilters(state, action: PayloadAction<Partial<typeof initialState.filters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearData(state) {
      return initialState
    },
    setSelectedTopic(state, action: PayloadAction<string | null>) {
      state.selectedTopic = action.payload
      state.currentMessageIndex = 0 // Reset index when changing topics
    },
    setCurrentMessageIndex(state, action: PayloadAction<number>) {
      state.currentMessageIndex = action.payload
    },
    setPlaybackState(state, action: PayloadAction<{ isPlaying: boolean }>) {
      state.playback.isPlaying = action.payload.isPlaying
    },
    setPlaybackSpeed(state, action: PayloadAction<number>) {
      state.playback.speed = action.payload
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
  selectPlaybackState,
  selectRosoutMessages,
}

export const ionDataActions = ionDataSlice.actions
export const ionDataReducer = ionDataSlice.reducer

