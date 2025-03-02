export function formatDateTime(timestamp: number | string | Date): string {
  try {
    const date = new Date(timestamp)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date")
    }
    return date.toISOString() // Returns in ISO 8601 format: YYYY-MM-DDTHH:mm:ss.sssZ
  } catch (error) {
    console.warn("Invalid date format:", timestamp)
    return "Invalid date"
  }
}

/**
 * Formats a duration in HH:mm:ss.sss format
 */
export function formatDuration(ms: number): string {
  try {
    const totalSeconds = Math.floor(ms / 1000)
    const hours = Math.floor(totalSeconds / 3600)
    const minutes = Math.floor((totalSeconds % 3600) / 60)
    const seconds = totalSeconds % 60
    const milliseconds = ms % 1000

    if (hours > 0) {
      return `${hours.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
    }

    return `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}.${milliseconds.toString().padStart(3, "0")}`
  } catch (error) {
    console.warn("Invalid duration:", ms)
    return "00:00.000"
  }
}

/**
 * Parses an ISO 8601 date string and returns a formatted string
 * For display purposes - keeps ISO format but adds spaces for readability
 */
export function formatDateTimeDisplay(isoString: string): string {
  try {
    // Verify it's a valid ISO string first
    const date = new Date(isoString)
    if (isNaN(date.getTime())) {
      throw new Error("Invalid date")
    }

    // Format: YYYY-MM-DD HH:mm:ss.sss UTC
    return isoString
      .replace("T", " ") // Replace T with space
      .replace("Z", " UTC") // Replace Z with UTC
  } catch (error) {
    console.warn("Invalid ISO date string:", isoString)
    return "Invalid date"
  }
}

