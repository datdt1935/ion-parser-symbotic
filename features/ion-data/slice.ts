import { createSlice, type PayloadAction, createSelector } from "@reduxjs/toolkit"
import type { ParsedIonData } from "@/app/types"
import type { RootState } from "@/store/reducer"

// Types
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

// Initial State
export const initialState: IonDataState = {
  isLoading: 0,
  data: null,
  error: null,
  filters: {
    page: 1,
    limit: 10,
  },
}

// Selectors
export const selectors = {
  selectIonData: (state: RootState) => state.ionData.data,
  selectIsLoading: (state: RootState) => state.ionData.isLoading > 0,
  selectError: (state: RootState) => state.ionData.error,
  selectFilters: (state: RootState) => state.ionData.filters,

  selectSessionInfo: createSelector(
    (state: RootState) => state.ionData.data?.raw,
    (raw) => {
      if (!raw) return null
      return raw.find((item) => item?.metadata?.sessionInfo)?.metadata?.sessionInfo || null
    },
  ),

  selectBotConfig: createSelector(
    (state: RootState) => state.ionData.data?.raw,
    (raw) => {
      if (!raw) return null
      return raw.find((item) => item?.metadata?.botConfig)?.metadata?.botConfig || null
    },
  ),
}

// Slice
const slice = createSlice({
  name: "ionData",
  initialState,
  reducers: {
    popLoading(state) {
      state.isLoading -= 1
    },
    pushLoading(state) {
      state.isLoading += 1
    },
    setData(state, action: PayloadAction<SetDataPayload>) {
      state.data = action.payload.data
      state.error = null
    },
    setError(state, action: PayloadAction<SetErrorPayload>) {
      state.error = action.payload.error
    },
    setFilters(state, action: PayloadAction<Partial<typeof initialState.filters>>) {
      state.filters = { ...state.filters, ...action.payload }
    },
    clearData(state) {
      state.data = null
      state.error = null
      state.isLoading = 0
    },
  },
})

export const { actions } = slice

// For external use
export const ionDataSelectors = selectors
export const ionDataActions = { ...actions }
export const ionDataReducer = slice.reducer

