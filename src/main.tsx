import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import "./notes/notes.css";

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("[engram] #root not found in index.html");
}

ReactDOM.createRoot(rootEl).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

if (import.meta.env.PROD && "serviceWorker" in navigator && window.isSecureContext) {
  window.addEventListener("load", () => {
    void navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`).catch(() => {
      // The notebook remains usable online; offline installation can be retried.
    });
  });
}
