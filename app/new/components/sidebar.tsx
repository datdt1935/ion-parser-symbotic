"use client"

import { Clock, Bot, Settings } from "lucide-react"
import { useSelector } from "@/store/store"
import { ionDataSelectors } from "@/features/ion-data/slice"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ObjectInfoViewer } from "./object-info-viewer"

export function Sidebar() {
  const sessionInfo = useSelector((state) => {
    const info = ionDataSelectors.selectSessionInfo(state)
    return info || {}
  })

  const botConfig = useSelector((state) => {
    const config = ionDataSelectors.selectBotConfig(state)
    return config || {}
  })

  // Use a fallback to an empty object if botInfo is null
  const botInfo = useSelector((state) => {
    const info = ionDataSelectors.selectBotInfo?.(state) || null
    return info || {}
  })

  // Define priority fields for each section
  const sessionPriorityFields = [
    "sessionCode",
    "session_id",
    "start_time",
    "end_time",
    "duration",
    "map_id",
    "map_name",
    "operator_name",
    "sessionType",
    "result",
    "amr_version",
    "apk_version",
  ]

  const robotPriorityFields = [
    "name",
    "id",
    "model",
    "version",
    "status",
    "serial_number",
    "manufacturer",
    "firmware_version",
  ]

  const configPriorityFields = ["version", "environment", "mode", "features", "settings"]

  // Define excluded fields for each section
  const sessionExcludedFields = ["__typename"]
  const robotExcludedFields = ["__typename"]
  const configExcludedFields = ["__typename", "internal_settings"]

  return (
    <div className="space-y-4">
      <Accordion type="single" collapsible defaultValue="session">
        <AccordionItem value="session" className="border rounded-lg bg-card">
          <AccordionTrigger className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              <span className="font-semibold">Session Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ObjectInfoViewer
              data={sessionInfo}
              priorityFields={sessionPriorityFields}
              excludedFields={sessionExcludedFields}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="robot" className="border rounded-lg bg-card mt-2">
          <AccordionTrigger className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <span className="font-semibold">Robot Information</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ObjectInfoViewer
              data={botInfo}
              priorityFields={robotPriorityFields}
              excludedFields={robotExcludedFields}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="config" className="border rounded-lg bg-card mt-2">
          <AccordionTrigger className="px-4 py-3">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              <span className="font-semibold">Bot Configuration</span>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 pb-4">
            <ObjectInfoViewer
              data={botConfig}
              priorityFields={configPriorityFields}
              excludedFields={configExcludedFields}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}

