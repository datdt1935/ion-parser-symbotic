import type { ParsedIonData } from "@/app/types"

export interface IonDataState {
  isLoading: number
  data: ParsedIonData | null
  error: string | null
  filters: {
    page: number
    limit: number
  }
}

export interface SetDataPayload {
  data: ParsedIonData
}

export interface SetErrorPayload {
  error: string
}

