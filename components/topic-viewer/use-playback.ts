"use client"

import { useEffect, useRef } from "react"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"

export function usePlayback() {
  const dispatch = useDispatch()
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)
  const { isPlaying, currentTime, startTime, endTime, playbackSpeed } = useSelector(
    ionDataSelectors.selectPlaybackState,
  )
  const timeRange = useSelector(ionDataSelectors.selectTimeRange)
  const currentMessage = useSelector(ionDataSelectors.selectCurrentTopicMessage)

  const playbackRef = useRef<number>()

  // Initialize time range when topics are loaded
  useEffect(() => {
    if (timeRange.endTime > timeRange.startTime) {
      dispatch(ionDataActions.setTimeRange(timeRange))
      dispatch(ionDataActions.setCurrentTime(timeRange.startTime))
    }
  }, [timeRange, dispatch])

  // Handle playback
  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = window.setInterval(() => {
        dispatch(
          ionDataActions.setCurrentTime((current) => {
            const nextTime = current + 1000 * playbackSpeed
            if (nextTime >= endTime) {
              dispatch(ionDataActions.setPlaybackState(false))
              return endTime
            }
            return nextTime
          }),
        )
      }, 1000)
    } else if (playbackRef.current) {
      clearInterval(playbackRef.current)
    }

    return () => {
      if (playbackRef.current) {
        clearInterval(playbackRef.current)
      }
    }
  }, [isPlaying, endTime, playbackSpeed, dispatch])

  const handleTopicSelect = (topic: string) => {
    dispatch(ionDataActions.setSelectedTopic(topic))
  }

  const handlePlayPause = () => {
    dispatch(ionDataActions.setPlaybackState(!isPlaying))
  }

  const handleSeek = (value: number[]) => {
    dispatch(ionDataActions.setCurrentTime(value[0]))
  }

  const handleSpeedChange = (faster: boolean) => {
    const newSpeed = faster ? playbackSpeed * 2 : playbackSpeed / 2
    dispatch(ionDataActions.setPlaybackSpeed(Math.max(0.25, Math.min(4, newSpeed))))
  }

  const progress = ((currentTime - startTime) / (endTime - startTime)) * 100

  return {
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
  }
}

