"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { JsonViewer } from "@/components/json-viewer";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface BotModelInfoProps {
  data?: any;
}

export function BotModelInfo({ data }: BotModelInfoProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  // Extract bot model info from the specified path
  const getBotModelInfo = (rawData: any) => {
    if (!rawData || !Array.isArray(rawData)) return null;

    // Find the first object that has metadata.botModel
    const botModelData = rawData.find((item) => item?.metadata?.botModel);

    return botModelData?.metadata?.botModel || null;
  };

  const botModelInfo = getBotModelInfo(data);

  if (!botModelInfo) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>3D Model Information</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">
            No data model information found at root.metadata.botModel
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader
        className="cursor-pointer select-none hover:bg-muted/50 transition-colors"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex items-center justify-between">
          <CardTitle>3D Model Information</CardTitle>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-muted-foreground transition-transform duration-200",
              isExpanded && "transform rotate-180"
            )}
          />
        </div>
      </CardHeader>
      <div
        className={cn(
          "grid transition-all duration-200",
          isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        )}
      >
        <div className="overflow-hidden">
          <CardContent>
            <JsonViewer
              data={botModelInfo}
              isExpanded={true}
              enableSearch={false}
            />
          </CardContent>
        </div>
      </div>
    </Card>
  );
}
