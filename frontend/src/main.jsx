import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./App.css";
import "./history.css";
import "./threat-profile.css";
import "./campaign-detection.css";
import "./threat-intelligence.css";
import "./protection-mode.css";
import "./scan-report.css";
import "./emergency-response.css";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <App />
  </StrictMode>
);
