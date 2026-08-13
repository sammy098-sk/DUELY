import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { toast } from "sonner";
import { App } from "./App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./styles.css";

// Intercept global fetch calls to catch and log 500 API & Edge Function errors
if (typeof window !== "undefined") {
  const originalFetch = window.fetch;
  window.fetch = async (...args) => {
    try {
      const response = await originalFetch(...args);
      if (response.status >= 500) {
        const cloned = response.clone();
        cloned.text().then((body) => {
          const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url || "API";
          console.error(`[API 500 Error] ${response.status} at ${url}:`, body);
          toast.error(`Backend Service Error (${response.status}): Failed to process request.`);
        }).catch(() => {
          // ignore clone error
        });
      }
      return response;
    } catch (err) {
      console.error("[Network Failure]", err);
      throw err;
    }
  };
}

const rootElement = document.getElementById("root");
if (rootElement && !rootElement.innerHTML) {
  const root = createRoot(rootElement);
  root.render(
    <StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </StrictMode>,
  );
}
