"use client"

import { useEffect, useState } from "react"
import { useSelector } from "@/store/store"
import { ionDataSelectors } from "@/features/ion-data"

interface Transform {
  translation?: {
    x: number
    y: number
    z: number
  }
  rotation?: {
    x: number
    y: number
    z: number
    w: number
  }
}

interface TfStaticData {
  transforms?: Array<{
    transform?: Transform
  }>
}

export function useTfStatic() {
  const [transform, setTransform] = useState<Transform | null>(null)
  const topicNames = useSelector(ionDataSelectors.selectTopicNames)
  const allMessages = useSelector(ionDataSelectors.selectCurrentTopicAllMessages)
  const selectedTopic = useSelector(ionDataSelectors.selectSelectedTopic)

  useEffect(() => {
    // Check if tf_static topic exists and is selected
    if (topicNames.includes("/tf_static") && selectedTopic === "/tf_static" && allMessages?.length > 0) {
      // Get the first message
      const message = allMessages[0] as { data?: TfStaticData }

      if (message?.data?.transforms?.[0]?.transform) {
        setTransform(message.data.transforms[0].transform)
      }
    }
  }, [topicNames, selectedTopic, allMessages])

  return transform
}

