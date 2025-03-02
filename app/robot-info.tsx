import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { JsonViewer } from "@/components/json-viewer"

interface RobotInfoProps {
  data?: any // Changed to accept any to handle raw data
}

export function RobotInfo({ data }: RobotInfoProps) {
  // Extract robot info from the specified path
  const getRobotInfo = (rawData: any) => {
    if (!rawData || !Array.isArray(rawData)) return null

    // Find the first object that has metadata.botConfig
    const robotData = rawData.find((item) => item?.metadata?.botConfig)

    return robotData?.metadata?.botConfig || null
  }

  const robotInfo = getRobotInfo(data)

  if (!robotInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Robot Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">No robot information found at root.metadata.botConfig</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Robot Information</CardTitle>
      </CardHeader>
      <CardContent>
        <JsonViewer
          data={robotInfo}
          isExpanded={true}
          enableSearch={false} // Disable search for robot info
        />
      </CardContent>
    </Card>
  )
}

