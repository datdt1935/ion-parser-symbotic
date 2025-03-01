"use client"

import { useState, useEffect } from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface JsonViewerProps {
  data: any
  className?: string
}

export function JsonViewer({ data, className }: JsonViewerProps) {
  const [expandedNodes, setExpandedNodes] = useState<Set<string>>(new Set())
  const [filter, setFilter] = useState("")
  const [filteredPaths, setFilteredPaths] = useState<Set<string>>(new Set())

  // Initialize with root nodes expanded
  useEffect(() => {
    if (data) {
      const initialExpanded = new Set<string>()
      if (Array.isArray(data)) {
        // Expand the first few array items by default
        const itemsToExpand = Math.min(data.length, 5)
        for (let i = 0; i < itemsToExpand; i++) {
          initialExpanded.add(`[${i}]`)
        }
      } else if (typeof data === "object" && data !== null) {
        // Expand the root object
        Object.keys(data).forEach((key) => {
          initialExpanded.add(key)
        })
      }
      setExpandedNodes(initialExpanded)
    }
  }, [data])

  // Apply filter
  useEffect(() => {
    if (!filter.trim()) {
      setFilteredPaths(new Set())
      return
    }

    const paths = new Set<string>()
    const searchFilter = filter.toLowerCase()

    const findMatches = (obj: any, path = "") => {
      if (obj === null || obj === undefined) return

      if (Array.isArray(obj)) {
        obj.forEach((item, index) => {
          const currentPath = `${path}[${index}]`
          if (typeof item === "object" && item !== null) {
            findMatches(item, currentPath)
          } else if (String(item).toLowerCase().includes(searchFilter)) {
            paths.add(currentPath)
          }
        })
      } else if (typeof obj === "object") {
        Object.entries(obj).forEach(([key, value]) => {
          const currentPath = path ? `${path}.${key}` : key

          // Check if key matches
          if (key.toLowerCase().includes(searchFilter)) {
            paths.add(currentPath)
          }

          // Check if value matches or recurse
          if (typeof value === "object" && value !== null) {
            findMatches(value, currentPath)
          } else if (String(value).toLowerCase().includes(searchFilter)) {
            paths.add(currentPath)
          }
        })
      }
    }

    findMatches(data)
    setFilteredPaths(paths)

    // Auto-expand paths that match the filter
    // Use functional update to avoid dependency on expandedNodes
    setExpandedNodes((prevExpanded) => {
      const newExpanded = new Set(prevExpanded)
      paths.forEach((path) => {
        // Add all parent paths to expanded set
        const parts = path.split(".")
        let currentPath = ""
        parts.forEach((part) => {
          if (currentPath) {
            currentPath += "." + part
          } else {
            currentPath = part
          }
          newExpanded.add(currentPath)
        })
      })
      return newExpanded
    })
  }, [filter, data])

  const toggleNode = (path: string) => {
    const newExpanded = new Set(expandedNodes)
    if (newExpanded.has(path)) {
      newExpanded.delete(path)
    } else {
      newExpanded.add(path)
    }
    setExpandedNodes(newExpanded)
  }

  const renderValue = (value: any, path = "", level = 0) => {
    if (value === null) return <span className="text-gray-500">null</span>
    if (value === undefined) return <span className="text-gray-500">undefined</span>

    if (Array.isArray(value)) {
      const isExpanded = expandedNodes.has(path)
      const hasFilterMatch = Array.from(filteredPaths).some((p) => p.startsWith(path))

      return (
        <div className="ml-4">
          <div
            className={cn(
              "flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1",
              hasFilterMatch && filter && "bg-yellow-50 dark:bg-yellow-900/20",
            )}
            onClick={() => toggleNode(path)}
          >
            <span className="mr-1">{isExpanded ? "▼" : "▶"}</span>
            <span className="text-blue-600 dark:text-blue-400">Array[{value.length}]</span>
          </div>

          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
              {value.map((item, index) => (
                <div key={index} className="my-1">
                  <span className="text-gray-500 mr-2">{index}:</span>
                  {renderValue(item, `${path}[${index}]`, level + 1)}
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (typeof value === "object" && value !== null) {
      const keys = Object.keys(value)
      const isExpanded = expandedNodes.has(path)
      const hasFilterMatch = Array.from(filteredPaths).some((p) => p.startsWith(path))

      return (
        <div className="ml-4">
          <div
            className={cn(
              "flex items-center cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1",
              hasFilterMatch && filter && "bg-yellow-50 dark:bg-yellow-900/20",
            )}
            onClick={() => toggleNode(path)}
          >
            <span className="mr-1">{isExpanded ? "▼" : "▶"}</span>
            <span className="text-blue-600 dark:text-blue-400">Object{keys.length > 0 ? `{${keys.length}}` : ""}</span>
          </div>

          {isExpanded && (
            <div className="ml-4 border-l-2 border-gray-200 dark:border-gray-700 pl-2">
              {keys.map((key) => {
                const newPath = path ? `${path}.${key}` : key
                const hasMatch = filteredPaths.has(newPath)

                return (
                  <div
                    key={key}
                    className={cn("my-1", hasMatch && filter && "bg-yellow-100 dark:bg-yellow-900/30 rounded")}
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
    if (typeof value === "string") {
      return <span className="text-green-600 dark:text-green-400">"{value}"</span>
    }
    if (typeof value === "number") {
      return <span className="text-orange-600 dark:text-orange-400">{value}</span>
    }
    if (typeof value === "boolean") {
      return <span className="text-red-600 dark:text-red-400">{value.toString()}</span>
    }

    return <span>{String(value)}</span>
  }

  return (
    <div className={cn("space-y-4", className)}>
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-gray-500" />
        <Input
          placeholder="Filter by key or value..."
          className="pl-8"
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
        />
      </div>

      <div className="bg-white dark:bg-gray-950 rounded-md p-4 overflow-auto max-h-[500px] font-mono text-sm">
        {renderValue(data)}
      </div>
    </div>
  )
}

