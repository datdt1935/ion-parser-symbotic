import type { RootState } from "@/lib/store/reducer"
import { createSelector } from "@reduxjs/toolkit"

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

