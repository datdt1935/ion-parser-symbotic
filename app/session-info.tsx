import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonViewer } from "@/components/json-viewer"
import { formatDateTime } from "@/lib/utils/date"

interface SessionInfoProps {
  data?: any
}

export function SessionInfo({ data }: SessionInfoProps) {
  // Extract session info from the specified path
  const getSessionInfo = (rawData: any) => {
    if (!rawData || !Array.isArray(rawData)) return null

    // Find the first object that has metadata.sessionInfo
    const sessionData = rawData.find((item) => item?.metadata?.sessionInfo)

    if (!sessionData?.metadata?.sessionInfo) return null

    const info = sessionData.metadata.sessionInfo

    // Format any date fields in ISO 8601
    const formattedInfo = {
      ...info,
      startTime: info.startTime ? formatDateTime(info.startTime) : undefined,
      endTime: info.endTime ? formatDateTime(info.endTime) : undefined,
      timestamp: info.timestamp ? formatDateTime(info.timestamp) : undefined,
      // Add any other date fields that need formatting
    }

    // Remove undefined values
    Object.keys(formattedInfo).forEach((key) => formattedInfo[key] === undefined && delete formattedInfo[key])

    return formattedInfo
  }

  const sessionInfo = getSessionInfo(data)

  if (!sessionInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Session Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No session information found at root.metadata.sessionInfo</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Information</CardTitle>
      </CardHeader>
      <CardContent>
        <JsonViewer data={sessionInfo} />
      </CardContent>
    </Card>
  )
}

