import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { FinansProvider } from "./lib/store";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <FinansProvider>
        <App />
      </FinansProvider>
    </BrowserRouter>
  </React.StrictMode>
);
