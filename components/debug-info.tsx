"use client"

import { Card } from "@/components/ui/card"
import { usePlaybackScene } from "@/app/scene/playback-scene-context"

export function DebugInfo() {
  const { transform, fps } = usePlaybackScene()
  const { position, rotation, quaternion } = transform

  return (
    <Card className="p-4">
      <div className="space-y-2 text-sm">
        <h3 className="font-medium">Debug Information</h3>
        <div className="space-y-1 font-mono text-xs">
          <div className="flex justify-between">
            <span>FPS:</span>
            <span className="text-muted-foreground">{fps}</span>
          </div>
          <div>
            <div>Position:</div>
            <div className="pl-4 text-muted-foreground">
              x: {position.x.toFixed(3)}
              <br />
              y: {position.y.toFixed(3)}
              <br />
              z: {position.z.toFixed(3)}
            </div>
          </div>
          <div>
            <div>Rotation:</div>
            <div className="pl-4 text-muted-foreground">
              x: {rotation.x.toFixed(3)}
              <br />
              y: {rotation.y.toFixed(3)}
              <br />
              z: {rotation.z.toFixed(3)}
            </div>
          </div>
          <div>
            <div>Quaternion:</div>
            <div className="pl-4 text-muted-foreground">
              x: {quaternion.x.toFixed(3)}
              <br />
              y: {quaternion.y.toFixed(3)}
              <br />
              z: {quaternion.z.toFixed(3)}
              <br />
              w: {quaternion.w.toFixed(3)}
            </div>
          </div>
        </div>
      </div>
    </Card>
  )
}

