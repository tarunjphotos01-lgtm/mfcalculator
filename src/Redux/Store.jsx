// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import populationReducer from './populationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    population: populationReducer,
  },
  devTools: process.env.NODE_ENV !== "production",
});

export default store;