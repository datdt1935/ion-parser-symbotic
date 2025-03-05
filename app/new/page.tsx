"use client"

import { useCallback } from "react"
import { useDropzone } from "react-dropzone"
import { Cloud, Loader2 } from "lucide-react"
import { useDispatch, useSelector } from "@/store/store"
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice"
import { IonParser } from "../ion-parser"
import { cn } from "@/lib/utils"
import { Sidebar } from "./components/sidebar"
import { MainContent } from "./components/main-content"

export default function NewIonLogViewer() {
  const dispatch = useDispatch()
  const ionData = useSelector(ionDataSelectors.selectIonData)
  const isLoading = useSelector(ionDataSelectors.selectIsLoading)
  const error = useSelector(ionDataSelectors.selectError)

  const onDrop = useCallback(
    async (acceptedFiles: File[]) => {
      const file = acceptedFiles[0]
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
    },
    [dispatch],
  )

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/ion": [".ion"],
      "application/octet-stream": [".ion"],
    },
    multiple: false,
  })

  return (
    <div className="min-h-screen bg-background">
      {!ionData && (
        <div className="container mx-auto px-4 py-8">
          <div
            {...getRootProps()}
            className={cn(
              "border-2 border-dashed rounded-lg p-12 text-center transition-colors",
              isDragActive ? "border-primary bg-primary/5" : "border-muted",
            )}
          >
            <input {...getInputProps()} />
            <div className="flex flex-col items-center gap-2">
              <Cloud className="h-12 w-12 text-muted-foreground" />
              <h3 className="text-lg font-semibold">Drag & drop an Ion file here</h3>
              <p className="text-sm text-muted-foreground">or click to select a file</p>
              {isLoading && <Loader2 className="h-6 w-6 animate-spin text-primary mt-2" />}
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="container mx-auto px-4 py-4">
          <div className="p-4 bg-destructive/10 text-destructive rounded-md">{error}</div>
        </div>
      )}

      {ionData && (
        <div className="container mx-auto p-4">
          <div className="grid grid-cols-1 md:grid-cols-[300px_1fr] gap-4">
            {/* Left Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <MainContent />
          </div>
        </div>
      )}
    </div>
  )
}

