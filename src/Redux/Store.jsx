// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";

const store = configureStore({
  reducer: {
    auth: authReducer,
  },
  devTools: true, // enables Redux DevTools
});

export default store;
