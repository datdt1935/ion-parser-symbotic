"use client"

import { PlaybackControls } from "@/components/playback-controls"
import { Playback3DViewer } from "@/components/playback-3d-viewer"
import { CameraFeedViewer } from "@/components/camera-feed-viewer"
import { MonitorPanel } from "./monitor-panel"

export function MainContent() {
  return (
    <div className="space-y-4">
      {/* Playback Controls */}
      <div className="mb-4 rounded-lg border bg-card p-4">
        <PlaybackControls showSkipButtons={true} showSpeedSelector={true} />
      </div>

      {/* Camera Feed */}
      <div className="rounded-lg border bg-card">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">Camera Feed</h2>
          <CameraFeedViewer />
        </div>
      </div>

      {/* 3D Visualization */}
      <div className="rounded-lg border bg-card">
        <div className="p-4">
          <h2 className="text-lg font-semibold mb-4">3D Visualization</h2>
          <div className="aspect-video">
            <Playback3DViewer />
          </div>
        </div>
      </div>

      {/* Monitor Panel (formerly Log Viewer) */}
      <MonitorPanel />
    </div>
  )
}

