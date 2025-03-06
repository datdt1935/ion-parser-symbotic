"use client"

import { useState, useEffect } from "react"
import { useSelector } from "@/store/store"
import { ionDataSelectors } from "@/features/ion-data"
import { useModelConverter } from "@/app/hooks/use-model-converter"
import { Loader2, Eye, View } from "lucide-react"
import { PlaybackScene } from "@/app/scene/playback-scene"
import { PlaybackSceneProvider, usePlaybackScene } from "@/app/scene/playback-scene-context"
import { ControlPanel } from "./control-panel"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Update the ViewModeToggle to use tabs instead of a button
function ViewModeToggle() {
  const { viewMode, setViewMode } = usePlaybackScene()

  return (
    <div className="absolute top-4 right-4 z-10">
      <Tabs
        value={viewMode}
        onValueChange={(value) => setViewMode(value as "orbit" | "third-person")}
        className="bg-background/80 backdrop-blur-sm rounded-md"
      >
        <TabsList className="grid grid-cols-2 w-[220px]">
          <TabsTrigger value="orbit" className="flex items-center">
            <View className="h-4 w-4 mr-2" />
            Orbit View
          </TabsTrigger>
          <TabsTrigger value="third-person" className="flex items-center">
            <Eye className="h-4 w-4 mr-2" />
            Third Person
          </TabsTrigger>
        </TabsList>
      </Tabs>
    </div>
  )
}

// Component to handle model position updates based on wheel odometry data
function ModelPositionUpdater() {
  const { setPosition, setQuaternion } = usePlaybackScene()

  // Get the current wheel odometry message directly from Redux
  const currentWheelOdomMessage = useSelector(ionDataSelectors.selectCurrentWheelOdomMessage)

  // Update model position and orientation when the wheel odometry message changes
  useEffect(() => {
    if (!currentWheelOdomMessage?.data?.pose?.pose) return

    const { position, orientation } = currentWheelOdomMessage.data.pose.pose

    // Update position if available, mapping Y to Z coordinate
    if (position) {
      setPosition(
        position.x || 0,
        position.z || 0, // Use Z as Y in 3D view
        position.y || 0, // Use Y as Z in 3D view
      )
    }

    // Update orientation if available, swapping Z and Y components
    if (orientation) {
      setQuaternion(
        orientation.x || 0,
        orientation.z || 0, // Swap Z to Y
        orientation.y || 0, // Swap Y to Z
        orientation.w || 1,
      )
    }
  }, [currentWheelOdomMessage, setPosition, setQuaternion])

  // This component doesn't render anything, it just handles the position updates
  return null
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
            <ModelPositionUpdater />
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

