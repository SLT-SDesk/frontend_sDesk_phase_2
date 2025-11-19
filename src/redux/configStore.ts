import { configureStore, combineReducers } from "@reduxjs/toolkit";
import createSagaMiddleware from "redux-saga";
import { persistStore, persistReducer } from "redux-persist";
import storage from "redux-persist/lib/storage";
import rootSaga from "./rootSaga";
import authReducer from "./auth/authSlice";
import locationReducer from "./location/locationSlice";
import teamAdminReducer from "./teamAdmin/teamAdminSlice";
import techniciansReducer from "./technicians/technicianSlice";
import sltusersReducer from "./sltusers/sltusersSlice";
import categoriesReducer from "./categories/categorySlice";
import incidentReducer from "./incident/incidentSlice";
import userLookupReducer from "./userLookup/userLookupSlice";

const persistConfig = {
  key: "root",
  storage,
  whitelist: ["auth"], // Only persist auth state
};

const rootReducer = combineReducers({
  auth: authReducer,
  teamAdmin: teamAdminReducer,
  technicians: techniciansReducer,
  location: locationReducer,
  sltusers: sltusersReducer,
  categories: categoriesReducer,
  incident: incidentReducer,
  userLookup: userLookupReducer,
});

const persistedReducer = persistReducer(persistConfig, rootReducer);

const sagaMiddleware = createSagaMiddleware();

export const store = configureStore({
  reducer: persistedReducer,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }).concat(sagaMiddleware),
});


sagaMiddleware.run(rootSaga);

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
