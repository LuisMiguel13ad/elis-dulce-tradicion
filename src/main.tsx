import React from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import { initPerformanceMonitoring } from "./lib/performance"; // Initialize performance monitoring

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

// Initialize performance monitoring
initPerformanceMonitoring();

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
