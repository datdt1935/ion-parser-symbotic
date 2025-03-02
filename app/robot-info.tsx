"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonViewer } from "@/components/json-viewer"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface RobotInfoProps {
  data?: any
}

export function RobotInfo({ data }: RobotInfoProps) {
  // Changed initial state to true
  const [isExpanded, setIsExpanded] = useState(true)

  // Rest of the component remains the same
  const getRobotInfo = (rawData: any) => {
    if (!rawData || !Array.isArray(rawData)) return null

    // Find the first object that has metadata.botConfig
    const robotData = rawData.find((item) => item?.metadata?.botConfig)

    return robotData?.metadata?.botConfig || null
  }

  const robotInfo = getRobotInfo(data)

  if (!robotInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Robot Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No robot information found at root.metadata.botConfig</p>
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
          <CardTitle>Robot Information</CardTitle>
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
            <JsonViewer data={robotInfo} isExpanded={true} enableSearch={false} />
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

