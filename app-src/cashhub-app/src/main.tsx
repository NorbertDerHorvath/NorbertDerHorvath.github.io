import React from "react";
import { createRoot } from "react-dom/client";
import App from "../App"; // App.tsx a projekt gyökerében van

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("Root element not found");

createRoot(rootEl).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
