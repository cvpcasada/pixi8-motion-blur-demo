import React, { Suspense } from "react";
import ReactDOM from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { ErrorBoundary, useErrorBoundary } from "react-error-boundary";

function ErrorFallbackElement() {
  let { resetBoundary } = useErrorBoundary();

  return <button onClick={resetBoundary}>Try again</button>;
}


ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Suspense>
      <ErrorBoundary fallback={<ErrorFallbackElement />}>
        <App />
      </ErrorBoundary>
    </Suspense>
  </React.StrictMode>
);

