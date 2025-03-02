"use client"

import { useState, useEffect } from "react"
import { convertToOBJ } from "../utils/model-converter"

interface ModelData {
  name?: string
  data?: string
  [key: string]: any
}

interface UseModelConverterResult {
  objContent: string | null
  isConverting: boolean
  error: Error | null
  convertAndDownload: () => Promise<void>
}

export function useModelConverter(modelData: ModelData | null): UseModelConverterResult {
  const [objContent, setObjContent] = useState<string | null>(null)
  const [isConverting, setIsConverting] = useState(false)
  const [error, setError] = useState<Error | null>(null)

  // Convert model data when it changes
  useEffect(() => {
    if (!modelData?.data) {
      setObjContent(null)
      setError(null)
      return
    }

    setIsConverting(true)
    setError(null)

    convertToOBJ(modelData.data)
      .then((content) => {
        setObjContent(content)
      })
      .catch((err) => {
        console.error("Conversion error:", err)
        setError(err instanceof Error ? err : new Error("Failed to convert model"))
        setObjContent(null)
      })
      .finally(() => {
        setIsConverting(false)
      })
  }, [modelData?.data])

  const convertAndDownload = async () => {
    if (!modelData?.data) {
      throw new Error("No model data available")
    }

    // Use cached content if available
    const content = objContent || (await convertToOBJ(modelData.data))

    // Create blob and download
    const blob = new Blob([content], { type: "text/plain" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `${modelData.name || "robot"}-model.obj`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)

    // Cache the content if not already cached
    if (!objContent) {
      setObjContent(content)
    }
  }

  return {
    objContent,
    isConverting,
    error,
    convertAndDownload,
  }
}

