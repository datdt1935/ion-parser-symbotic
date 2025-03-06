"use client"

import { useState } from "react"
import { useSelector } from "@/store/store"
import { ionDataSelectors } from "@/features/ion-data"
import { useModelConverter } from "@/app/hooks/use-model-converter"
import { Loader2, Eye, View } from "lucide-react"
import { PlaybackScene } from "@/app/scene/playback-scene"
import { PlaybackSceneProvider, usePlaybackScene } from "@/app/scene/playback-scene-context"
import { ControlPanel } from "./control-panel"
import { Button } from "@/components/ui/button"

// Update the ViewModeToggle button text to reflect the new default state
function ViewModeToggle() {
  const { viewMode, setViewMode } = usePlaybackScene()

  return (
    <Button
      variant="outline"
      size="sm"
      className="absolute top-4 right-4 z-10"
      onClick={() => {
        setViewMode(viewMode === "orbit" ? "third-person" : "orbit")
      }}
    >
      {viewMode === "orbit" ? (
        <>
          <Eye className="h-4 w-4 mr-2" />
          Third Person
        </>
      ) : (
        <>
          <View className="h-4 w-4 mr-2" />
          Orbit View
        </>
      )}
    </Button>
  )
}

export function Playback3DViewer() {
  const [isControlsVisible, setIsControlsVisible] = useState(false)

  // Use a safer approach to get the botModelInfo
  const botModelInfo = useSelector((state) => {
    const info = ionDataSelectors.selectBotModelInfo(state)
    return info || null
  })

  // Only call useModelConverter if botModelInfo is not null
  const { objContent, isConverting, error } = useModelConverter(botModelInfo)

  if (!botModelInfo) {
    return (
      <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-muted-foreground">
          <p>No 3D model data found</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="aspect-video w-full bg-muted rounded-lg flex items-center justify-center">
        <div className="text-center text-destructive p-4">
          <p>Failed to load 3D model: {error.message}</p>
        </div>
      </div>
    )
  }

  return (
    <PlaybackSceneProvider>
      <div className="aspect-video w-full border rounded-lg overflow-hidden bg-muted relative">
        {isConverting ? (
          <div className="w-full h-full flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <>
            <ViewModeToggle />
            <PlaybackScene model={{ objContent, isConverting }} className="w-full h-full" />
            <ControlPanel
              isVisible={isControlsVisible}
              onToggleVisibility={() => setIsControlsVisible(!isControlsVisible)}
            />
          </>
        )}
      </div>
    </PlaybackSceneProvider>
  )
}

