"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonViewer } from "@/components/json-viewer"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SessionInfoProps {
  data?: any
}

export function SessionInfo({ data }: SessionInfoProps) {
  // Changed initial state to true
  const [isExpanded, setIsExpanded] = useState(true)

  // Rest of the component remains the same
  const getSessionInfo = (rawData: any) => {
    if (!rawData || !Array.isArray(rawData)) return null

    // Find the first object that has metadata.sessionInfo
    const sessionData = rawData.find((item) => item?.metadata?.sessionInfo)

    return sessionData?.metadata?.sessionInfo || null
  }

  const sessionInfo = getSessionInfo(data)

  if (!sessionInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No session information found at root.metadata.sessionInfo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle>Session Information</CardTitle>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "transform rotate-180",
            )}
          />
        </div>
      </CardHeader>
      <div className={cn("grid transition-all duration-200", isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <CardContent>
            <JsonViewer data={sessionInfo} isExpanded={true} enableSearch={false} />
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

