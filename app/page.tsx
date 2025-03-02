"use client";

import type React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Loader2, FileJson } from "lucide-react";
import { SessionInfo } from "./session-info";
import { RobotInfo } from "./robot-info";
import { TopicViewer } from "@/components/topic-viewer";
import { IonParser } from "./ion-parser";
import { JsonViewer } from "@/components/json-viewer";
import { useDispatch, useSelector } from "@/store/store";
import { ionDataActions, ionDataSelectors } from "@/features/ion-data/slice";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function IonLogViewer() {
  const dispatch = useDispatch();
  const ionData = useSelector(ionDataSelectors.selectIonData);
  const isLoading = useSelector(ionDataSelectors.selectIsLoading);
  const error = useSelector(ionDataSelectors.selectError);

  const handleFileUpload = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) {
      dispatch(ionDataActions.setError({ error: "No file selected" }));
      return;
    }

    dispatch(ionDataActions.pushLoading());
    dispatch(ionDataActions.setError({ error: "" }));

    try {
      if (file.size === 0) {
        throw new Error("The selected file is empty");
      }

      const buffer = await file.arrayBuffer();

      if (buffer.byteLength === 0) {
        throw new Error("File content is empty");
      }

      const parsedData = await IonParser.parse(buffer);

      if (!parsedData.raw.length) {
        throw new Error("No valid data found in the file");
      }

      dispatch(ionDataActions.setData({ data: parsedData }));
    } catch (err) {
      console.error("File processing error:", err);
      dispatch(
        ionDataActions.setError({
          error:
            err instanceof Error ? err.message : "Failed to process the file",
        })
      );
    } finally {
      dispatch(ionDataActions.popLoading());
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Top Menu Bar */}
      <header className="border-b">
        <div className="container mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileJson className="h-6 w-6" />
            <h1 className="text-lg font-semibold">ION Log Viewer</h1>
          </div>
          <Button variant="outline" className="ml-auto" disabled={isLoading}>
            <label className="cursor-pointer flex items-center">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Parsing...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Import ION File
                </>
              )}
              <input
                type="file"
                className="hidden"
                accept=".ion"
                onChange={handleFileUpload}
                disabled={isLoading}
              />
            </label>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        {error && (
          <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/10 text-red-600 dark:text-red-400 rounded-md">
            {error}
          </div>
        )}

        {!ionData && !error && (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <Upload className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No File Loaded</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Upload an ION log file to view its contents
              </p>
              <Button variant="outline" disabled={isLoading}>
                <label className="cursor-pointer flex items-center">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Parsing...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2 h-4 w-4" />
                      Select File
                    </>
                  )}
                  <input
                    type="file"
                    className="hidden"
                    accept=".ion"
                    onChange={handleFileUpload}
                    disabled={isLoading}
                  />
                </label>
              </Button>
            </CardContent>
          </Card>
        )}

        {ionData && ionData.raw.length > 0 && (
          <Tabs defaultValue="info" className="space-y-4">
            <TabsList>
              <TabsTrigger value="info">Information</TabsTrigger>
              <TabsTrigger value="topics">Topics</TabsTrigger>
            </TabsList>

            <TabsContent value="info" className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <SessionInfo data={ionData.raw} />
                <RobotInfo data={ionData.raw} />
              </div>

              <Card>
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">
                    Raw ION Data Preview
                  </h3>
                  <JsonViewer data={ionData.raw} />
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="topics">
              <TopicViewer />
            </TabsContent>
          </Tabs>
        )}
      </main>
    </div>
  );
}
