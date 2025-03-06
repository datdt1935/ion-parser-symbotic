"use client"

import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface InfoRowProps {
  label: string
  value: any
  className?: string
  displayAsRow?: boolean
}

function InfoRow({ label, value, className = "", displayAsRow = false }: InfoRowProps) {
  const [isExpanded, setIsExpanded] = useState(false)

  // Format the label to be more readable when not in row display mode
  const formattedLabel = displayAsRow
    ? label
    : label
        .replace(/_/g, " ")
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ")

  // Helper function to determine value color based on type
  const getValueColor = (val: any) => {
    if (typeof val === "boolean") {
      return val ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
    }
    if (typeof val === "number") {
      return "text-blue-600 dark:text-blue-400"
    }
    if (typeof val === "string" && val.startsWith("/dev")) {
      return "text-purple-600 dark:text-purple-400"
    }
    return "text-gray-900 dark:text-gray-100"
  }

  // Render different types of values appropriately
  const renderValue = () => {
    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">-</span>
    }

    if (typeof value === "boolean") {
      return <span className={getValueColor(value)}>{value.toString()}</span>
    }

    if (typeof value === "string" || typeof value === "number") {
      return <span className={getValueColor(value)}>{value.toString()}</span>
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span className="text-muted-foreground">Empty array</span>
      }

      return (
        <div>
          <div
            className="flex items-center cursor-pointer text-blue-600 hover:underline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            Array ({value.length} items)
          </div>

          {isExpanded && (
            <div className="pl-4 mt-2 border-l-2 border-gray-200">
              {value.slice(0, 3).map((item: any, index: number) => (
                <div key={index} className="mb-2">
                  <div className="text-xs text-muted-foreground">Item {index}:</div>
                  <div className="text-sm">
                    {typeof item === "object" ? JSON.stringify(item, null, 2) : item.toString()}
                  </div>
                </div>
              ))}
              {value.length > 3 && (
                <div className="text-xs text-muted-foreground">...and {value.length - 3} more items</div>
              )}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object") {
      return (
        <div>
          <div
            className="flex items-center cursor-pointer text-blue-600 hover:underline"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronDown className="h-3 w-3 mr-1" /> : <ChevronRight className="h-3 w-3 mr-1" />}
            Object ({Object.keys(value).length} properties)
          </div>

          {isExpanded && (
            <div className="pl-4 mt-2 border-l-2 border-gray-200">
              <pre className="text-xs overflow-auto max-h-32">{JSON.stringify(value, null, 2)}</pre>
            </div>
          )}
        </div>
      )
    }

    return <span>{String(value)}</span>
  }

  if (displayAsRow) {
    return (
      <div
        className={cn(
          "flex items-center justify-between py-1.5 px-3 font-mono text-sm",
          "hover:bg-gray-50 dark:hover:bg-gray-800/50",
          "even:bg-gray-50/50 dark:even:bg-gray-800/25",
          className,
        )}
      >
        <div className="text-gray-600 dark:text-gray-400">{formattedLabel}</div>
        <div className="text-right">{renderValue()}</div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div className="text-sm text-muted-foreground">{formattedLabel}</div>
      <div className="text-sm font-medium break-all">{renderValue()}</div>
    </div>
  )
}

interface ObjectInfoViewerProps {
  data: Record<string, any>
  priorityFields?: string[]
  excludedFields?: string[]
  className?: string
  displayAsRow?: boolean
}

export function ObjectInfoViewer({
  data,
  priorityFields = [],
  excludedFields = [],
  className = "",
  displayAsRow = false,
}: ObjectInfoViewerProps) {
  const getFieldEntries = () => {
    const entries = Object.entries(data).filter(([key]) => !excludedFields.includes(key))

    return entries.sort(([keyA], [keyB]) => {
      const isPriorityA = priorityFields.includes(keyA)
      const isPriorityB = priorityFields.includes(keyB)

      if (isPriorityA && !isPriorityB) return -1
      if (!isPriorityA && isPriorityB) return 1

      return keyA.localeCompare(keyB)
    })
  }

  const fieldEntries = getFieldEntries()

  return (
    <div
      className={cn(
        displayAsRow ? "border rounded-md divide-y divide-gray-100 dark:divide-gray-800" : "gap-x-4 gap-y-6 grid",
        !displayAsRow && (fieldEntries.length > 0 ? "grid-cols-2" : "grid-cols-1"),
        className,
      )}
    >
      {fieldEntries.length > 0 ? (
        <>
          {fieldEntries.map(([key, value]) => (
            <InfoRow key={key} label={key} value={value} displayAsRow={displayAsRow} />
          ))}
        </>
      ) : (
        <div className="text-center text-muted-foreground py-4">No information available</div>
      )}
    </div>
  )
}

