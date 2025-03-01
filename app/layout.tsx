import type React from "react"
import { Providers } from "./providers"
import "./globals.css"
import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "ION Parser",
  description: "Parse and view ION log files",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

