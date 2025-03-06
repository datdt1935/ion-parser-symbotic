import type { RootState } from "@/store/reducer"
import { createSelector } from "@reduxjs/toolkit"
import type { TopicMessage } from "./types"

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

// Get log duration in milliseconds
const selectLogDuration = createSelector([selectPlayback], (playback) => {
  if (playback.logStartTime === null || playback.logEndTime === null) return 0
  return playback.logEndTime - playback.logStartTime
})

// Find the message index based on current playback time
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

const selectBotInfo = createSelector(
  (state: RootState) => state.ionData.data?.raw,
  (raw) => {
    if (!raw) return null
    return raw.find((item) => item?.metadata?.botInfo)?.metadata?.botInfo || null
  },
)

const selectBotModelInfo = createSelector(
  (state: RootState) => state.ionData.data?.raw,
  (raw) => {
    if (!raw) return null
    const botModelData = raw.find((item) => item?.metadata?.botModel)
    return botModelData?.metadata?.botModel || null
  },
)

export const selectors = {
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
  selectBotInfo,
}

