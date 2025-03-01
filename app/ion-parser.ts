import { makeReader, IonTypes } from "ion-js"

export interface ParsedIonData {
  raw: any[]
  session?: IonSession
  robot?: IonRobot
}

export interface IonSession {
  id?: string
  startTime?: any
  endTime?: any
  duration?: any
  status?: any
  [key: string]: any
}

export interface IonRobot {
  id?: string
  name?: string
  model?: string
  version?: string
  status?: any
  [key: string]: any
}

export class IonParser {
  static async parse(buffer: ArrayBuffer): Promise<ParsedIonData> {
    const uint8Array = new Uint8Array(buffer)
    const data: any[] = []

    try {
      const reader = makeReader(uint8Array)

      while (reader.next() !== null) {
        const value = this.readValue(reader)
        if (value !== undefined) {
          data.push(value)
        }
      }

      return this.structureData(data)
    } catch (error) {
      console.error("Ion parsing error:", {
        name: error instanceof Error ? error.name : "Unknown",
        message: error instanceof Error ? error.message : "Unknown error",
        stack: error instanceof Error ? error.stack : undefined,
      })
      throw new Error("Failed to parse Ion data: " + (error instanceof Error ? error.message : "Unknown error"))
    }
  }

  private static readValue(reader: any): any {
    try {
      const type = reader.type()

      switch (type) {
        case IonTypes.NULL:
          return null

        case IonTypes.BOOL:
          return reader.booleanValue()

        case IonTypes.INT:
          return reader.numberValue()

        case IonTypes.FLOAT:
          return reader.numberValue()

        case IonTypes.DECIMAL:
          return reader.numberValue()

        case IonTypes.TIMESTAMP:
          return reader.timestampValue().toString()

        case IonTypes.STRING:
          return reader.stringValue()

        case IonTypes.SYMBOL:
          return reader.symbolValue()

        case IonTypes.STRUCT:
          const struct: any = {}
          reader.stepIn()

          while (reader.next() !== null) {
            const fieldName = reader.fieldName()
            const fieldValue = this.readValue(reader)
            if (fieldValue !== undefined) {
              struct[fieldName] = fieldValue
            }
          }

          reader.stepOut()
          return struct

        case IonTypes.LIST:
          const list: any[] = []
          reader.stepIn()

          while (reader.next() !== null) {
            const value = this.readValue(reader)
            if (value !== undefined) {
              list.push(value)
            }
          }

          reader.stepOut()
          return list

        case IonTypes.SEXP:
          // Handle S-expressions as lists
          return this.readValue({ ...reader, type: () => IonTypes.LIST })

        case IonTypes.CLOB:
          return reader.stringValue()

        case IonTypes.BLOB:
          return Buffer.from(reader.byteValue()).toString("base64")

        default:
          console.warn("Unhandled Ion type:", type)
          return undefined
      }
    } catch (error) {
      console.warn("Error reading Ion value:", {
        error,
        type: reader.type(),
      })
      return undefined
    }
  }

  private static structureData(data: any[]): ParsedIonData {
    const structured: ParsedIonData = {
      raw: data.filter((item) => item !== undefined),
    }

    try {
      // Find session information
      const sessionData = data.find(
        (item) =>
          item && typeof item === "object" && (item.sessionId || item.session_id || item.startTime || item.session),
      )
      if (sessionData) {
        structured.session = this.normalizeSessionData(sessionData)
      }

      // Find robot information
      const robotData = data.find(
        (item) => item && typeof item === "object" && (item.robotId || item.robot_id || item.robotName || item.robot),
      )
      if (robotData) {
        structured.robot = this.normalizeRobotData(robotData)
      }
    } catch (error) {
      console.warn("Error structuring data:", error)
    }

    return structured
  }

  private static normalizeSessionData(data: any): IonSession {
    if (!data || typeof data !== "object") {
      return {}
    }

    return {
      id: data.sessionId || data.session_id || data.id,
      startTime: data.startTime || data.start_time,
      endTime: data.endTime || data.end_time,
      duration: data.duration,
      status: data.status,
      ...data,
    }
  }

  private static normalizeRobotData(data: any): IonRobot {
    if (!data || typeof data !== "object") {
      return {}
    }

    return {
      id: data.robotId || data.robot_id || data.id,
      name: data.robotName || data.robot_name || data.name,
      model: data.model || data.robotModel,
      version: data.version || data.robotVersion,
      status: data.status,
      ...data,
    }
  }
}

