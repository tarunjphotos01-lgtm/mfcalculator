// src/redux/authSlice.js
import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  savedUserId: "test@gmail.com",   // fixed credentials
  savedPassword: "123",
  isLoggedIn: false,
  userId: "",   // current logged in user
};

const AuthSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    login: (state, action) => {
        console.log("Call reducer");
      const { userId, password } = action.payload;
      if (userId === state.savedUserId && password === state.savedPassword) {
        state.isLoggedIn = true;
        state.userId = userId;
        state.log = "valid User ID or Password!";
      } else {
        state.isLoggedIn = false;
        state.error = "Invalid User ID or Password!";
      }
    },
    logout: (state) => {
      state.isLoggedIn = false;
      state.userId = "";
    },
  },
});

export const { login, logout } = AuthSlice.actions;
export default AuthSlice.reducer;
