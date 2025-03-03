"use client"

import { useState, useEffect } from "react"
import { Search, Eye, EyeOff, Code, List } from 'lucide-react' // Add Code and List icons
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Add ViewMode to exports
export type ViewMode = "tree" | "raw"

interface JsonViewerProps {
  data: any
  className?: string
  isExpanded?: boolean
  enableSearch?: boolean
  // Add new props
  defaultViewMode?: ViewMode
  showViewModeToggle?: boolean
}

type FilterMode = "hide" | "display"

const MIN_FILTER_LENGTH = 4

export function JsonViewer({
  data,
  className,
  isExpanded = false,
  enableSearch = true,
  defaultViewMode = "tree",
  showViewModeToggle = true,
}: JsonViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState("")
  const [filterMode, setFilterMode] = useState<FilterMode>("hide")
  const [filteredPaths, setFilteredPaths] = useState<Set<string>>(new Set())
  const [matchedPaths, setMatchedPaths] = useState<Set<string>>(new Set())
  // Update state to use defaultViewMode
  const [viewMode, setViewMode] = useState<ViewMode>(defaultViewMode)

  // Reset filter state when search is disabled
  useEffect(() => {
    if (!enableSearch) {
      setFilter("")
      setFilteredPaths(new Set())
      setMatchedPaths(new Set())
    }
  }, [enableSearch])

  // Initialize with all nodes expanded if isExpanded is true
  useEffect(() => {
    if (data) {
      const initialExpanded = new Set<string>()

      if (isExpanded) {
        const collectPaths = (obj: any, path = "root") => {
          initialExpanded.add(path)

          if (Array.isArray(obj)) {
            obj.forEach((item, index) => {
              if (item && typeof item === "object") {
                collectPaths(item, `${path}[${index}]`)
              }
            })
          } else if (obj && typeof obj === "object") {
            Object.entries(obj).forEach(([key, value]) => {
              const newPath = path === "root" ? key : `${path}.${key}`
              if (value && typeof value === "object") {
                collectPaths(value, newPath)
              }
            })
          }
        }

        collectPaths(data)
      } else {
        if (Array.isArray(data)) {
          initialExpanded.add("root")
        } else if (typeof data === "object" && data !== null) {
          initialExpanded.add("root")
        }
      }

      setExpandedNodes(initialExpanded)
    }
  }, [data, isExpanded])

  // Apply filter only when filter length > MIN_FILTER_LENGTH
  useEffect(() => {
    if (!filter.trim() || filter.length < MIN_FILTER_LENGTH) {
      setFilteredPaths(new Set())
      setMatchedPaths(new Set())
      return
    }

    const paths = new Set<string>()
    const matches = new Set<string>()
    const searchFilter = filter.toLowerCase()

    const findMatches = (obj: any, path = "root") => {
      if (obj === null || obj === undefined) return false

      let hasMatch = false

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const currentPath = `${path}[${index}]`
          if (typeof item === "object" && item !== null) {
            if (findMatches(item, currentPath)) {
              hasMatch = true
              paths.add(path)
            }
          } else if (String(item).toLowerCase().includes(searchFilter)) {
            hasMatch = true
            matches.add(currentPath)
            paths.add(path)
          }
        })
      } else if (typeof obj === "object") {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path === "root" ? key : `${path}.${key}`

          if (key.toLowerCase().includes(searchFilter)) {
            hasMatch = true
            matches.add(currentPath)
            paths.add(path)
          }

          if (typeof value === "object" && value !== null) {
            if (findMatches(value, currentPath)) {
              hasMatch = true
              paths.add(path)
            }
          } else if (String(value).toLowerCase().includes(searchFilter)) {
            hasMatch = true
            matches.add(currentPath)
            paths.add(path)
          }
        })
      }

      return hasMatch
    }

    findMatches(data)
    setFilteredPaths(paths)
    setMatchedPaths(matches)

    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev)
      paths.forEach((path) => newExpanded.add(path))
      return newExpanded
    })
  }, [filter, data])

  const toggleNode = (path: string) => {
    setExpandedNodes((prev) => {
      const newExpanded = new Set(prev)
      if (newExpanded.has(path)) {
        newExpanded.delete(path)
      } else {
        newExpanded.add(path)
      }
      return newExpanded
    })
  }

  const shouldShowNode = (path: string, value: any): boolean => {
    // If filter is not long enough, show everything
    if (!filter || filter.length < MIN_FILTER_LENGTH) return true
    if (filterMode === "display") return true

    if (filteredPaths.has(path)) return true
    if (matchedPaths.has(path)) return true

    if (value === null || value === undefined) return false
    if (Array.isArray(value) && value.length === 0) return false
    if (typeof value === "object" && Object.keys(value).length === 0) return false

    return false
  }

  const renderValue = (value: any, path = "root", level = 0) => {
    if (!shouldShowNode(path, value)) return null

    if (value === null) return <span className="text-gray-500">null</span>
    if (value === undefined) return <span className="text-gray-500">undefined</span>

    if (Array.isArray(value)) {
      const isExpanded = expandedNodes.has(path)
      const hasFilterMatch = Array.from(filteredPaths).some((p) => p.startsWith(path))
      const isExactMatch = matchedPaths.has(path)
      const nonEmptyItems = value.filter((_, i) => shouldShowNode(`${path}[${i}]`, value[i]))

      if (filter && nonEmptyItems.length === 0) return null

      return (
        <div className="ml-4">
          <div
            className={cn(
              "flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1",
              hasFilterMatch && filter && "bg-yellow-50 dark:bg-yellow-900/20",
              isExactMatch && "ring-2 ring-yellow-500 dark:ring-yellow-400",
            )}
            onClick={() => toggleNode(path)}
          >
            <span className="mr-1">{isExpanded ? "▼" : "▶"}</span>
            <span className="text-blue-600 dark:text-blue-400">Array[{value.length}]</span>
          </div>

          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
              {value.map((item, index) => {
                const itemPath = `${path}[${index}]`
                if (!shouldShowNode(itemPath, item)) return null

                return (
                  <div key={index} className="my-1">
                    <span className="text-gray-500 mr-2">{index}:</span>
                    {renderValue(item, itemPath, level + 1)}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object" && value !== null) {
      const keys = Object.keys(value)
      const isExpanded = expandedNodes.has(path)
      const hasFilterMatch = Array.from(filteredPaths).some((p) => p.startsWith(path))
      const isExactMatch = matchedPaths.has(path)
      const visibleKeys = keys.filter((key) => {
        const newPath = path === "root" ? key : `${path}.${key}`
        return shouldShowNode(newPath, value[key])
      })

      if (filter && visibleKeys.length === 0) return null

      return (
        <div className="ml-4">
          <div
            className={cn(
              "flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1",
              hasFilterMatch && filter && "bg-yellow-50 dark:bg-yellow-900/20",
              isExactMatch && "ring-2 ring-yellow-500 dark:ring-yellow-400",
            )}
            onClick={() => toggleNode(path)}
          >
            <span className="mr-1">{isExpanded ? "▼" : "▶"}</span>
            <span className="text-blue-600 dark:text-blue-400">
              {path === "root" ? "Object" : path.split(".").pop()}
              {keys.length > 0 ? `{${keys.length}}` : ""}
            </span>
          </div>

          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
              {keys.map((key) => {
                const newPath = path === "root" ? key : `${path}.${key}`
                if (!shouldShowNode(newPath, value[key])) return null

                const isMatch = matchedPaths.has(newPath)

                return (
                  <div
                    key={key}
                    className={cn("my-1", isMatch && filter && "bg-yellow-100 dark:bg-yellow-900/30 rounded px-1")}
                  >
                    <span className="text-purple-600 dark:text-purple-400 mr-2">{key}:</span>
                    {renderValue(value[key], newPath, level + 1)}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )
    }

    // Primitive values
    const isMatch = matchedPaths.has(path)
    const valueString = String(value)

    if (typeof value === "string") {
      return (
        <span
          className={cn(
            "text-green-600 dark:text-green-400",
            isMatch && filter && "bg-yellow-100 dark:bg-yellow-900/30 rounded px-1",
          )}
        >
          "{valueString}"
        </span>
      )
    }
    if (typeof value === "number") {
      return (
        <span
          className={cn(
            "text-orange-600 dark:text-orange-400",
            isMatch && filter && "bg-yellow-100 dark:bg-yellow-900/30 rounded px-1",
          )}
        >
          {valueString}
        </span>
      )
    }
    if (typeof value === "boolean") {
      return (
        <span
          className={cn(
            "text-red-600 dark:text-red-400",
            isMatch && filter && "bg-yellow-100 dark:bg-yellow-900/30 rounded px-1",
          )}
        >
          {valueString}
        </span>
      )
    }

    return <span>{valueString}</span>
  }

  // Add a function to render the raw JSON view
  const renderRawJson = () => {
    try {
      const jsonString = JSON.stringify(data, null, 3)

      if (filter && filter.length >= MIN_FILTER_LENGTH) {
        // Highlight search matches in raw mode
        const regex = new RegExp(`(${filter.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`, "gi")
        const parts = jsonString.split(regex)

        return (
          <pre className="whitespace-pre-wrap break-words text-xs">
            {parts.map((part, i) =>
              regex.test(part) ? (
                <span key={i} className="bg-yellow-100 dark:bg-yellow-900/30">
                  {part}
                </span>
              ) : (
                part
              ),
            )}
          </pre>
        )
      }

      return <pre className="whitespace-pre-wrap break-words text-xs">{jsonString}</pre>
    } catch (error) {
      return <div className="text-red-500">Error rendering JSON: {String(error)}</div>
    }
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2">
        {enableSearch && (
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
            <Input
              placeholder={`Filter by key or value (min ${MIN_FILTER_LENGTH} characters)...`}
              className={cn(
                "pl-8",
                filter.length > 0 && filter.length < MIN_FILTER_LENGTH && "border-yellow-500 dark:border-yellow-400",
              )}
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
            />
            {filter.length > 0 && filter.length < MIN_FILTER_LENGTH && (
              <div className="absolute right-2 top-2.5 text-xs text-yellow-600 dark:text-yellow-400">
                {MIN_FILTER_LENGTH - filter.length} more chars
              </div>
            )}
          </div>
        )}

        {/* Only show view mode toggle if showViewModeToggle is true */}
        {showViewModeToggle && (
          <div className="flex border rounded-md overflow-hidden">
            <Button
              variant="ghost"
              size="sm"
              className={cn("rounded-none", viewMode === "tree" && "bg-muted")}
              onClick={() => setViewMode("tree")}
              title="Tree View"
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className={cn("rounded-none", viewMode === "raw" && "bg-muted")}
              onClick={() => setViewMode("raw")}
              title="Raw JSON"
            >
              <Code className="h-4 w-4" />
            </Button>
          </div>
        )}

        {filter && filter.length >= MIN_FILTER_LENGTH && (
          <Button
            variant="outline"
            size="icon"
            onClick={() => setFilterMode((prev) => (prev === "hide" ? "display" : "hide"))}
            title={filterMode === "hide" ? "Show all nodes" : "Hide non-matching nodes"}
          >
            {filterMode === "hide" ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </Button>
        )}
      </div>

      <div
        className={cn(
          "bg-white dark:bg-gray-950 rounded-md p-4 overflow-auto max-h-[500px] font-mono text-sm",
          !enableSearch && "mt-0", // Remove top margin when search is disabled
        )}
      >
        {viewMode === "tree" ? renderValue(data) : renderRawJson()}
      </div>
    </div>
  )
}

