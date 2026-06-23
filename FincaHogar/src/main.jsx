import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App.jsx";
import "./index.css";

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);

// Dark‑mode toggle button (same as before)
const toggleBtn = document.createElement("button");
toggleBtn.textContent = "Modo Oscuro 🌙";
toggleBtn.className = "toggle-btn";
toggleBtn.onclick = () => {
  document.body.classList.toggle("dark");
};
document.body.appendChild(toggleBtn);
