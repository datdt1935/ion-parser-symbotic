import { combineReducers } from "redux"
import { ionDataReducer } from "@/features/ion-data/slice"

export const rootReducer = combineReducers({
  ionData: ionDataReducer,
})

export type RootState = ReturnType<typeof rootReducer>

