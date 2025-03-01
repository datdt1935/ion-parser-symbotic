import { createAction } from "@reduxjs/toolkit";
import type { SetIonDataPayload, SetErrorPayload } from "./types";

export const setIonData = createAction<SetIonDataPayload>("ionData/setData");
export const setLoading = createAction<boolean>("ionData/setLoading");
export const setError = createAction<SetErrorPayload>("ionData/setError");
export const clearIonData = createAction("ionData/clear");
