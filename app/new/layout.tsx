import type React from "react"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ION Log Viewer - New UI",
  description: "Parse and view ION log files with the new UI layout",
}

export default function NewLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}

