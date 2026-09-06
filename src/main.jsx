import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import { ProductsProvider } from "./context/ProductsContext";
import { SettingsProvider } from "./context/SettingsContext";
import "./index.css";

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <BrowserRouter>
      <SettingsProvider>
        <ProductsProvider>
          <App />
        </ProductsProvider>
      </SettingsProvider>
    </BrowserRouter>
  </React.StrictMode>
);
