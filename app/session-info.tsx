import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonViewer } from "@/components/json-viewer"

interface SessionInfoProps {
  data?: any // Changed to accept any to handle raw data
}

export function SessionInfo({ data }: SessionInfoProps) {
  // Extract session info from the specified path
  const getSessionInfo = (rawData: any) => {
    if (!rawData || !Array.isArray(rawData)) return null

    // Find the first object that has metadata.sessionInfo
    const sessionData = rawData.find((item) => item?.metadata?.sessionInfo)

    return sessionData?.metadata?.sessionInfo || null
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

