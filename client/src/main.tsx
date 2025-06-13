import './hmr-ws-patch';  // Keep this as first import - handles admin bypass via URL parameters
import './lib/error-handler';  // Centralized error handling - prevents duplicate handlers
import React from "react";
import ReactDOM from "react-dom/client";

import App from "./App";
import "./index.css";

console.log("🚀 FA Axis loading...");

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement
);

// Simple, direct loading of your FA Axis app
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

console.log("✅ FA Axis React app mounted successfully");
