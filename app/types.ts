export interface IonSession {
  id?: string
  startTime?: string
  endTime?: string
  duration?: number
  status?: string
  [key: string]: any
}

export interface IonRobot {
  id?: string
  name?: string
  model?: string
  version?: string
  status?: string
  [key: string]: any
}

export interface ParsedIonData {
  session?: IonSession
  robot?: IonRobot
  raw?: any[]
}

