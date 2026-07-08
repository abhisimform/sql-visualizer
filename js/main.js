import { QueryVisualizerApp } from "./ui/app.js";
import { runTests } from "./tests/runner.js";

document.addEventListener("DOMContentLoaded", () => {
  const app = new QueryVisualizerApp();
  app.init();
  
  // Run tests automatically on startup
  runTests();
});
