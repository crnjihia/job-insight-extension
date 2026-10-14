import React from "react";
import { createRoot } from "react-dom/client";
import { OptionsApp } from "./App";

const container = document.getElementById("options-root");
if (container) {
  const root = createRoot(container);
  root.render(<OptionsApp />);
}
