import { configureStore } from "@reduxjs/toolkit"
import { useDispatch as useAppDispatch, useSelector as useAppSelector, type TypedUseSelectorHook } from "react-redux"
import { rootReducer } from "./reducer"

const store = configureStore({
  reducer: rootReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
      immutableCheck: false,
    }),
})

export type RootState = ReturnType<typeof rootReducer>
export type AppDispatch = typeof store.dispatch

export const useDispatch = () => useAppDispatch<AppDispatch>()
export const useSelector: TypedUseSelectorHook<RootState> = useAppSelector

export { store }

