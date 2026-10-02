import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import "@fontsource-variable/manrope";
import "@fontsource/cormorant-garamond/500-italic.css";
import App from "./App";
import "./styles.css";
import "./sales.css";
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode><BrowserRouter basename={import.meta.env.BASE_URL}><App /></BrowserRouter></React.StrictMode>,
);
