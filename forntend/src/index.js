import React from "react";
import ReactDOM from "react-dom";
import "./index.css";
import App from "./App";
import { TokenAuthProvider } from "./context/TokenAuthContext";

ReactDOM.render(
  <React.StrictMode>
    <TokenAuthProvider>
      <App />
    </TokenAuthProvider>
  </React.StrictMode>,
  document.getElementById("root")
);
