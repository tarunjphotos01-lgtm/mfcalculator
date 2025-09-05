// src/redux/store.js
import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./AuthSlice";
import populationReducer from './populationSlice';

const store = configureStore({
  reducer: {
    auth: authReducer,
    population: populationReducer,
  },
  devTools: true, // enables Redux DevTools
});

export default store;