"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { useSelector } from "@/store/store"
import { ionDataSelectors } from "@/features/ion-data/slice"
import { useModelConverter } from "@/app/hooks/use-model-converter"
import { Loader2, EyeIcon as Eye3d, View } from "lucide-react" // Add Eye3d and View icons
import { PlaybackScene } from "@/app/scene/playback-scene"
import { PlaybackSceneProvider, usePlaybackScene } from "@/app/scene/playback-scene-context"
import { ControlPanel } from "./control-panel"
import { TransformForm } from "./transform-form"
import { DebugInfo } from "./debug-info"
import { WheelOdomViewer } from "./wheel-odom-viewer"
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
          <Eye3d className="h-4 w-4 mr-2" />
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
  const botModelInfo = useSelector(ionDataSelectors.selectBotModelInfo)
  const { objContent, isConverting, error } = useModelConverter(botModelInfo)

  if (!botModelInfo) {
    return (
      <Card>
        <CardContent className="py-6">
          <p className="text-center text-muted-foreground">No 3D model data found in the log file</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="py-6">
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">
            Failed to load 3D model: {error.message}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <PlaybackSceneProvider>
      <div className="space-y-4">
        <WheelOdomViewer />
        <Card>
          <CardContent className="pt-6">
            <div className="aspect-[16/9] w-full border rounded-lg overflow-hidden bg-muted relative">
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
          </CardContent>
        </Card>

        <div className="grid md:grid-cols-2 gap-4">
          <TransformForm />
          <DebugInfo />
        </div>
      </div>
    </PlaybackSceneProvider>
  )
}

