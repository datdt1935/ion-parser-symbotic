"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight, RotateCcw, RotateCw } from "lucide-react"
import type { PlaybackSceneHandle } from "@/app/scene/playback-scene"

interface ControlPanelProps {
  sceneRef: React.RefObject<PlaybackSceneHandle>
}

export function ControlPanel({ sceneRef }: ControlPanelProps) {
  const [position, setPosition] = useState({
    x: 0,
    y: 0,
    z: 0,
  })

  const [rotation, setRotation] = useState({
    x: 0,
    y: 0,
    z: 0,
  })

  const handlePositionChange = (axis: "x" | "y" | "z", value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setPosition((prev) => ({
      ...prev,
      [axis]: numValue,
    }))
  }

  const handleRotationChange = (axis: "x" | "y" | "z", value: string) => {
    const numValue = Number.parseFloat(value) || 0
    setRotation((prev) => ({
      ...prev,
      [axis]: numValue,
    }))
  }

  const handleSetPosition = () => {
    if (sceneRef.current) {
      sceneRef.current.setPosition(position.x, position.y, position.z)
    }
  }

  const handleSetRotation = () => {
    if (sceneRef.current) {
      sceneRef.current.setRotation(rotation.x, rotation.y, rotation.z)
    }
  }

  return (
    <Card className="absolute bottom-4 right-4 p-4 bg-background/80 backdrop-blur-sm">
      {/* Movement Controls */}
      <div className="grid grid-cols-3 gap-2">
        <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => sceneRef.current?.rotateLeft()}>
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => sceneRef.current?.moveForward()}>
          <ArrowUp className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => sceneRef.current?.rotateRight()}>
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => sceneRef.current?.moveLeft()}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => sceneRef.current?.moveBackward()}>
          <ArrowDown className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="icon" className="w-10 h-10" onClick={() => sceneRef.current?.moveRight()}>
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>

      <Separator className="my-4" />

      {/* Position Controls */}
      <div className="space-y-4">
        <div>
          <Label className="text-xs font-semibold">Position</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="space-y-1">
              <Label htmlFor="position-x" className="text-xs">
                X
              </Label>
              <Input
                id="position-x"
                type="number"
                value={position.x}
                onChange={(e) => handlePositionChange("x", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="position-y" className="text-xs">
                Y
              </Label>
              <Input
                id="position-y"
                type="number"
                value={position.y}
                onChange={(e) => handlePositionChange("y", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="position-z" className="text-xs">
                Z
              </Label>
              <Input
                id="position-z"
                type="number"
                value={position.z}
                onChange={(e) => handlePositionChange("z", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full mt-2" onClick={handleSetPosition}>
            Set Position
          </Button>
        </div>

        {/* Rotation Controls */}
        <div>
          <Label className="text-xs font-semibold">Rotation (degrees)</Label>
          <div className="grid grid-cols-3 gap-2 mt-2">
            <div className="space-y-1">
              <Label htmlFor="rotation-x" className="text-xs">
                X
              </Label>
              <Input
                id="rotation-x"
                type="number"
                value={rotation.x}
                onChange={(e) => handleRotationChange("x", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rotation-y" className="text-xs">
                Y
              </Label>
              <Input
                id="rotation-y"
                type="number"
                value={rotation.y}
                onChange={(e) => handleRotationChange("y", e.target.value)}
                className="h-8"
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="rotation-z" className="text-xs">
                Z
              </Label>
              <Input
                id="rotation-z"
                type="number"
                value={rotation.z}
                onChange={(e) => handleRotationChange("z", e.target.value)}
                className="h-8"
              />
            </div>
          </div>
          <Button variant="secondary" size="sm" className="w-full mt-2" onClick={handleSetRotation}>
            Set Rotation
          </Button>
        </div>
      </div>

      <div className="mt-4 text-xs text-center text-muted-foreground">Keyboard: WASD, Q/E for rotation</div>
    </Card>
  )
}

