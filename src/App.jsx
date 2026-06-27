import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MFProfitLossCalculator from "./Pages/MFProfitLossCalculator";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<MFProfitLossCalculator/>} />
      </Routes>
    </Router>
  );
}

export default App;
