import React from "react";
import { createRoot } from "react-dom/client";
import * as Sentry from "@sentry/react";
import App from "./App.tsx";
import "./index.css";
import "./lib/i18n"; // Initialize i18n
import { initPerformanceMonitoring } from "./lib/performance"; // Initialize performance monitoring

// Initialize Sentry error tracking (before React renders)
if (import.meta.env.VITE_SENTRY_DSN) {
  Sentry.init({
    dsn: import.meta.env.VITE_SENTRY_DSN,
    environment: import.meta.env.MODE,
    enabled: import.meta.env.PROD, // Only enable in production
  });
}

const rootElement = document.getElementById("root");
if (!rootElement) throw new Error('Failed to find the root element');

// Initialize performance monitoring
initPerformanceMonitoring();

createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
