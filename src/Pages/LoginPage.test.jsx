// src/Pages/LoginPage.test.jsx
import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import LoginPage from "./LoginPage";
import { BrowserRouter as Router } from "react-router-dom";
import { Provider } from "react-redux";
import configureStore from "redux-mock-store";

// Create a mock Redux store
const mockStore = configureStore([]);

describe("LoginPage", () => {
  let store;

  beforeEach(() => {
    store = mockStore({
      auth: { isLoggedIn: false, error: null }, // initial Redux state
    });
  });

  const renderComponent = () =>
    render(
      <Provider store={store}>
        <Router>
          <LoginPage />
        </Router>
      </Provider>
    );

  test("renders the login form", () => {
    renderComponent();

    expect(screen.getByRole("heading", { name: /login/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /login/i })).toBeInTheDocument();
  });

  test("displays error message when error is present", () => {
    // Override store with error state
    store = mockStore({
      auth: { isLoggedIn: false, error: "Invalid credentials" },
    });

    render(
      <Provider store={store}>
        <Router>
          <LoginPage />
        </Router>
      </Provider>
    );

    expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
  });

  test("dispatches login action on form submission", () => {
    renderComponent();

    // Fill in email and password
    fireEvent.change(screen.getByLabelText(/email/i), {
      target: { value: "test@example.com" },
    });
    fireEvent.change(screen.getByLabelText(/password/i), {
      target: { value: "password123" },
    });

    // Submit the form
    fireEvent.click(screen.getByRole("button", { name: /login/i }));

    // Check that an action was dispatched
    const actions = store.getActions();
    expect(actions.length).toBeGreaterThan(0); // at least one Redux action dispatched
  });
});
