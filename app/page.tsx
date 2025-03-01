"use client"

import type React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Upload, Loader2 } from "lucide-react"
import { SessionInfo } from "./session-info"
import { RobotInfo } from "./robot-info"
import { IonParser } from "./ion-parser"
import { JsonViewer } from "@/components/json-viewer"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"

export default function IonLogViewer() {
  const dispatch = useDispatch()
  const ionData = useSelector(ionDataSelectors.selectIonData)
  const isLoading = useSelector(ionDataSelectors.selectIsLoading)
  const error = useSelector(ionDataSelectors.selectError)

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) {
      dispatch(ionDataActions.setError({ error: "No file selected" }))
      return
    }

    dispatch(ionDataActions.pushLoading())
    dispatch(ionDataActions.setError({ error: "" }))

    try {
      if (file.size === 0) {
        throw new Error("The selected file is empty")
      }

      const buffer = await file.arrayBuffer()

      if (buffer.byteLength === 0) {
        throw new Error("File content is empty")
      }

      const parsedData = await IonParser.parse(buffer)

      if (!parsedData.raw.length) {
        throw new Error("No valid data found in the file")
      }

      dispatch(ionDataActions.setData({ data: parsedData }))
    } catch (err) {
      console.error("File processing error:", err)
      dispatch(
        ionDataActions.setError({
          error: err instanceof Error ? err.message : "Failed to process the file",
        }),
      )
    } finally {
      dispatch(ionDataActions.popLoading())
    }
  }

  return (
    <div className="container mx-auto p-4 space-y-4">
      <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-lg border-gray-300 dark:border-gray-700">
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <Button variant="outline" className="mb-2" disabled={isLoading}>
          <label className="cursor-pointer">
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Parsing ION File...
              </>
            ) : (
              "Upload ION Log File"
            )}
            <input type="file" className="hidden" accept=".ion" onChange={handleFileUpload} disabled={isLoading} />
          </label>
        </Button>
        <p className="text-sm text-gray-500">Upload your ION log file to view the parsed data</p>
        {error && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-md">{error}</div>
        )}
      </div>

      {ionData && ionData.raw.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4">
          <SessionInfo data={ionData.raw} />
          <RobotInfo data={ionData.raw} />

          {/* Raw Data Preview */}
          <Card className="md:col-span-2">
            <CardHeader>
              <CardTitle>Raw ION Data Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <JsonViewer data={ionData.raw} />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

