"use client"

import { useRef, useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useSelector } from "@/store/store"
import { ionDataSelectors } from "@/features/ion-data/slice"
import { useModelConverter } from "@/app/hooks/use-model-converter"
import { Loader2 } from "lucide-react"
import { PlaybackScene, type PlaybackSceneHandle, type SceneStats } from "@/app/scene/playback-scene"
import { ControlPanel } from "./control-panel"

export function Playback3DViewer() {
  const sceneRef = useRef<PlaybackSceneHandle>(null)
  const [sceneStats, setSceneStats] = useState<SceneStats | null>(null)
  const botModelInfo = useSelector(ionDataSelectors.selectBotModelInfo)
  const { objContent, isConverting, error } = useModelConverter(botModelInfo)

  // Handle keyboard controls
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!sceneRef.current) return

      switch (event.key.toLowerCase()) {
        case "w":
          sceneRef.current.moveForward()
          break
        case "s":
          sceneRef.current.moveBackward()
          break
        case "a":
          sceneRef.current.moveLeft()
          break
        case "d":
          sceneRef.current.moveRight()
          break
        case "q":
          sceneRef.current.rotateLeft()
          break
        case "e":
          sceneRef.current.rotateRight()
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [])

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
    <div className="space-y-4">
      <Card>
        <CardContent className="pt-6">
          <div className="aspect-[16/9] w-full border rounded-lg overflow-hidden bg-muted relative">
            {isConverting ? (
              <div className="w-full h-full flex items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <PlaybackScene
                  ref={sceneRef}
                  model={{ objContent, isConverting }}
                  className="w-full h-full"
                  onStatsUpdate={setSceneStats}
                />
                <ControlPanel sceneRef={sceneRef} />
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Debug Information Card */}
      <Card>
        <CardHeader>
          <CardTitle>Debug Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2 font-mono text-sm">
            <div>
              <span className="text-muted-foreground">Position: </span>
              <span>
                X: {sceneStats?.position.x.toFixed(2) ?? "N/A"}, Y: {sceneStats?.position.y.toFixed(2) ?? "N/A"}, Z:{" "}
                {sceneStats?.position.z.toFixed(2) ?? "N/A"}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">Rotation: </span>
              <span>
                X: {(sceneStats?.rotation.x * (180 / Math.PI)).toFixed(2) ?? "N/A"}°, Y:{" "}
                {(sceneStats?.rotation.y * (180 / Math.PI)).toFixed(2) ?? "N/A"}°, Z:{" "}
                {(sceneStats?.rotation.z * (180 / Math.PI)).toFixed(2) ?? "N/A"}°
              </span>
            </div>
            <div>
              <span className="text-muted-foreground">FPS: </span>
              <span>{sceneStats?.fps ?? "N/A"}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

