"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, RotateCcw, RotateCw, Eye, EyeOff,Keyboard,KeyboardOff } from "lucide-react"
import { usePlaybackScene } from "@/app/scene/playback-scene-context"

interface ControlPanelProps {
  isVisible: boolean
  onToggleVisibility: () => void
}

const MOVEMENT_SPEED = 0.1
const ROTATION_SPEED = 0.1

export function ControlPanel({ isVisible, onToggleVisibility }: ControlPanelProps) {
  const { transform, moveForward, moveBackward, moveLeft, moveRight, rotateLeft, rotateRight } = usePlaybackScene()

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      switch (e.key.toLowerCase()) {
        case "w":
          moveForward(MOVEMENT_SPEED)
          break
        case "s":
          moveBackward(MOVEMENT_SPEED)
          break
        case "a":
          moveLeft(MOVEMENT_SPEED)
          break
        case "d":
          moveRight(MOVEMENT_SPEED)
          break
        case "q":
          rotateLeft(ROTATION_SPEED)
          break
        case "e":
          rotateRight(ROTATION_SPEED)
          break
      }
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [moveForward, moveBackward, moveLeft, moveRight, rotateLeft, rotateRight])

  if (!isVisible) {
    return (
      <Button variant="outline" size="icon" className="absolute bottom-4 right-4 z-10" onClick={onToggleVisibility}>
        <Keyboard className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card className="absolute bottom-4 right-4 p-4 w-64 space-y-4 bg-background/95 backdrop-blur z-10">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium">Controls</h3>
        <Button variant="ghost" size="icon" onClick={onToggleVisibility}>
          <KeyboardOff className="h-4 w-4" />
        </Button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="grid grid-cols-2 gap-2">
          <div>Position:</div>
          <div>
            X: {transform.position.x.toFixed(2)}
            Y: {transform.position.y.toFixed(2)}
            Z: {transform.position.z.toFixed(2)}
          </div>
          <div>Rotation:</div>
          <div>
            X: {transform.rotation.x.toFixed(2)}
            Y: {transform.rotation.y.toFixed(2)}
            Z: {transform.rotation.z.toFixed(2)}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        <div />
        <Button variant="outline" size="icon" onClick={() => moveForward(MOVEMENT_SPEED)}>
          <ChevronUp className="h-4 w-4" />
        </Button>
        <div />
        <Button variant="outline" size="icon" onClick={() => moveLeft(MOVEMENT_SPEED)}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => moveBackward(MOVEMENT_SPEED)}>
          <ChevronDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => moveRight(MOVEMENT_SPEED)}>
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex justify-center gap-2">
        <Button variant="outline" size="icon" onClick={() => rotateLeft(ROTATION_SPEED)}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" onClick={() => rotateRight(ROTATION_SPEED)}>
          <RotateCw className="h-4 w-4" />
        </Button>
      </div>

      <div className="text-xs text-muted-foreground">
        <div>Keyboard Controls:</div>
        <div>W,A,S,D - Move</div>
        <div>Q,E - Rotate</div>
      </div>
    </Card>
  )
}

