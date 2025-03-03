"use client"

import type React from "react"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { usePlaybackScene } from "@/app/scene/playback-scene-context"

export function TransformForm() {
  const { setPosition, setRotation, setQuaternion } = usePlaybackScene()
  const [position, setPositionState] = useState({ x: 0, y: 0, z: 0 })
  const [rotation, setRotationState] = useState({ x: 0, y: 0, z: 0 })
  const [quaternion, setQuaternionState] = useState({ x: 0, y: 0, z: 0, w: 1 })

  const handlePositionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setPosition(position.x, position.y, position.z)
  }

  const handleRotationSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setRotation(rotation.x, rotation.y, rotation.z)
  }

  const handleQuaternionSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setQuaternion(quaternion.x, quaternion.y, quaternion.z, quaternion.w)
  }

  return (
    <Card className="p-4">
      <Tabs defaultValue="position">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="position">Position</TabsTrigger>
          <TabsTrigger value="rotation">Rotation</TabsTrigger>
          <TabsTrigger value="quaternion">Quaternion</TabsTrigger>
        </TabsList>

        <TabsContent value="position">
          <form onSubmit={handlePositionSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="position-x">X</Label>
                <Input
                  id="position-x"
                  type="number"
                  step="0.1"
                  value={position.x}
                  onChange={(e) => setPositionState({ ...position, x: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position-y">Y</Label>
                <Input
                  id="position-y"
                  type="number"
                  step="0.1"
                  value={position.y}
                  onChange={(e) => setPositionState({ ...position, y: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position-z">Z</Label>
                <Input
                  id="position-z"
                  type="number"
                  step="0.1"
                  value={position.z}
                  onChange={(e) => setPositionState({ ...position, z: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Update Position
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="rotation">
          <form onSubmit={handleRotationSubmit} className="space-y-4">
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="rotation-x">X</Label>
                <Input
                  id="rotation-x"
                  type="number"
                  step="0.1"
                  value={rotation.x}
                  onChange={(e) => setRotationState({ ...rotation, x: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rotation-y">Y</Label>
                <Input
                  id="rotation-y"
                  type="number"
                  step="0.1"
                  value={rotation.y}
                  onChange={(e) => setRotationState({ ...rotation, y: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rotation-z">Z</Label>
                <Input
                  id="rotation-z"
                  type="number"
                  step="0.1"
                  value={rotation.z}
                  onChange={(e) => setRotationState({ ...rotation, z: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Update Rotation
            </Button>
          </form>
        </TabsContent>

        <TabsContent value="quaternion">
          <form onSubmit={handleQuaternionSubmit} className="space-y-4">
            <div className="grid grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quaternion-x">X</Label>
                <Input
                  id="quaternion-x"
                  type="number"
                  step="0.1"
                  value={quaternion.x}
                  onChange={(e) => setQuaternionState({ ...quaternion, x: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quaternion-y">Y</Label>
                <Input
                  id="quaternion-y"
                  type="number"
                  step="0.1"
                  value={quaternion.y}
                  onChange={(e) => setQuaternionState({ ...quaternion, y: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quaternion-z">Z</Label>
                <Input
                  id="quaternion-z"
                  type="number"
                  step="0.1"
                  value={quaternion.z}
                  onChange={(e) => setQuaternionState({ ...quaternion, z: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quaternion-w">W</Label>
                <Input
                  id="quaternion-w"
                  type="number"
                  step="0.1"
                  value={quaternion.w}
                  onChange={(e) => setQuaternionState({ ...quaternion, w: Number.parseFloat(e.target.value) || 0 })}
                />
              </div>
            </div>
            <Button type="submit" className="w-full">
              Update Quaternion
            </Button>
          </form>
        </TabsContent>
      </Tabs>
    </Card>
  )
}

