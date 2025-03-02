"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonViewer } from "@/components/json-viewer"
import { ChevronDown, Download, Loader2, CuboidIcon as Cube, FileJson } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { OBJViewer } from "./components/obj-viewer"
import { useModelConverter } from "./hooks/use-model-converter"

interface BotModelInfoProps {
  data?: any
}

type ViewMode = "json" | "3d"

export function BotModelInfo({ data }: BotModelInfoProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [viewMode, setViewMode] = useState<ViewMode>("json")
  const { toast } = useToast()

  // Extract bot model info from the specified path
  const getBotModelInfo = (rawData: any) => {
    if (!rawData || !Array.isArray(rawData)) return null

    // Find the first object that has metadata.botModel
    const botModelData = rawData.find((item) => item?.metadata?.botModel)

    return botModelData?.metadata?.botModel || null
  }

  const botModelInfo = getBotModelInfo(data)
  const { objContent, isConverting, error, convertAndDownload } = useModelConverter(botModelInfo)

  const handleViewMode = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const handleDownload = async () => {
    if (!botModelInfo?.data) {
      toast({
        title: "Error",
        description: "No 3D model data available to download",
        variant: "destructive",
      })
      return
    }

    try {
      await convertAndDownload()
      toast({
        title: "Success",
        description: "3D model downloaded successfully",
      })
    } catch (error) {
      console.error("Download error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to download 3D model",
        variant: "destructive",
      })
    }
  }

  if (!botModelInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>3D Model Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No 3D model information found at root.metadata.botModel</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 cursor-pointer select-none hover:bg-muted/50 transition-colors">
        <div className="flex-1" onClick={() => setIsExpanded(!isExpanded)}>
          <div className="flex items-center justify-between">
            <CardTitle>3D Model Information</CardTitle>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-muted-foreground transition-transform duration-200",
                isExpanded && "transform rotate-180",
              )}
            />
          </div>
        </div>
        <div className="flex items-center gap-2 ml-4">
          {botModelInfo?.data && (
            <>
              <div className="flex items-center rounded-md border border-input bg-background">
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("px-3 rounded-none rounded-l-md", viewMode === "json" && "bg-muted")}
                  onClick={() => handleViewMode("json")}
                >
                  <FileJson className="h-4 w-4 mr-2" />
                  Data
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className={cn("px-3 rounded-none rounded-r-md", viewMode === "3d" && "bg-muted")}
                  onClick={() => handleViewMode("3d")}
                  disabled={isConverting}
                >
                  {isConverting ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Cube className="h-4 w-4 mr-2" />}
                  3D View
                </Button>
              </div>
              <Button variant="outline" size="sm" onClick={handleDownload} disabled={isConverting}>
                {isConverting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Converting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Download OBJ
                  </>
                )}
              </Button>
            </>
          )}
        </div>
      </CardHeader>
      <div className={cn("grid transition-all duration-200", isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]")}>
        <div className="overflow-hidden">
          <CardContent>
            {error && <div className="mb-4 p-4 bg-destructive/10 text-destructive rounded-md">{error.message}</div>}
            {viewMode === "json" ? (
              <JsonViewer data={botModelInfo} isExpanded={true} enableSearch={false} />
            ) : (
              <div className="aspect-video w-full border rounded-lg overflow-hidden bg-muted">
                <OBJViewer model={{ objContent, isConverting }} className="w-full h-full" />
              </div>
            )}
          </CardContent>
        </div>
      </div>
    </Card>
  )
}

