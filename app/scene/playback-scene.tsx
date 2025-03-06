"use client"

import { useEffect, useRef } from "react"
import { usePlaybackScene } from "./playback-scene-context"
import { cn } from "@/lib/utils"

interface Model3D {
  objContent: string | null
  isConverting: boolean
}

interface PlaybackSceneProps {
  model: Model3D
  className?: string
}

export function PlaybackScene({ model, className }: PlaybackSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { initScene, loadModel, viewMode } = usePlaybackScene()

  // Initialize scene when container is ready
  useEffect(() => {
    if (!containerRef.current) return
    initScene(containerRef.current)
  }, [initScene])

  // Load model when content changes
  useEffect(() => {
    if (!model.objContent) return
    loadModel(model.objContent)
  }, [model.objContent, loadModel])

  // Add class to indicate view mode
  const sceneClassName = cn(className, viewMode === "third-person" && "cursor-none pointer-events-none")

  if (model.isConverting) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <p className="text-muted-foreground">Loading 3D model...</p>
      </div>
    )
  }

  if (!model.objContent) {
    return (
      <div className={`${className} flex items-center justify-center bg-muted`}>
        <p className="text-muted-foreground">No 3D model available</p>
      </div>
    )
  }

  return <div ref={containerRef} className={sceneClassName} />
}

