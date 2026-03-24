import { EMPLOYEE_DATA } from "./data.js";
import { KEYWORDS, STEP_TO_KEYWORD_ID } from "./constants.js";
import { queryStorage, ThemeStore } from "./storage.js";
import { QueryParser } from "./query-parser.js";
import { QueryEngine } from "./query-engine.js";
import { TableRenderer } from "./table-renderer.js";

export class QueryVisualizerApp {
  constructor() {
    this.elements = {
      queryInput: document.getElementById("queryInput"),
      queryDisplay: document.getElementById("queryDisplay"),
      runButton: document.getElementById("runButton"),
      prevButton: document.getElementById("prevButton"),
      nextButton: document.getElementById("nextButton"),
      stepLabel: document.getElementById("stepLabel"),
      rowCount: document.getElementById("rowCount"),
      table: document.getElementById("table"),
      themeToggle: document.getElementById("themeToggle"),
      themeLabel: document.getElementById("themeLabel")
    };

    this.parser = new QueryParser();
    this.engine = new QueryEngine(EMPLOYEE_DATA);
    this.renderer = new TableRenderer(this.elements);
    this.themeStore = new ThemeStore();
    this.steps = [];
    this.stepIndex = 0;
    this.currentData = [];

    this.saveQuery = this.debounce(() => {
      queryStorage.save(this.elements.queryInput.value);
    }, 300);
  }

  init() {
    this.themeStore.apply(this.themeStore.getPreferredTheme());
    this.updateThemeLabel();

    const savedQuery = queryStorage.load();
    if (savedQuery) {
      this.elements.queryInput.value = savedQuery;
    }

    this.bindEvents();
    this.run();
  }

  bindEvents() {
    this.elements.runButton.addEventListener("click", () => this.run());
    this.elements.prevButton.addEventListener("click", () => this.prevStep());
    this.elements.nextButton.addEventListener("click", () => this.nextStep());
    this.elements.queryInput.addEventListener("input", this.saveQuery);
    this.elements.themeToggle.addEventListener("click", () => {
      this.themeStore.toggle();
      this.updateThemeLabel();
    });
  }

  run() {
    const query = this.elements.queryInput.value.trim();
    this.steps = this.parser.parse(query);
    this.stepIndex = 0;
    this.currentData = [];

    this.renderQuery(query);
    this.clearHighlight();
    this.renderer.render([]);
    this.updateStepLabel();
    this.updateButtons();
  }

  nextStep() {
    if (this.stepIndex >= this.steps.length) {
      return;
    }

    const step = this.steps[this.stepIndex];
    this.currentData = this.engine.executeStep(this.currentData, step);
    this.highlightStep(step.type);
    this.stepIndex += 1;
    this.renderer.render(this.currentData);
    this.updateStepLabel(step.type);
    this.updateButtons();
  }

  prevStep() {
    if (this.stepIndex === 0) {
      return;
    }

    const targetIndex = this.stepIndex - 1;
    this.currentData = [];
    this.stepIndex = 0;
    this.clearHighlight();

    while (this.stepIndex < targetIndex) {
      this.currentData = this.engine.executeStep(this.currentData, this.steps[this.stepIndex]);
      this.stepIndex += 1;
    }

    const activeType = targetIndex > 0 ? this.steps[targetIndex - 1].type : "";
    if (activeType) {
      this.highlightStep(activeType);
    }

    this.renderer.render(this.currentData);
    this.updateStepLabel(activeType);
    this.updateButtons();
  }

  renderQuery(query) {
    let formattedQuery = query;

    KEYWORDS.forEach((keyword) => {
      const id = keyword.replace(/\s+/g, "_");
      formattedQuery = formattedQuery.replace(new RegExp(keyword, "gi"), `<span id="${id}">${keyword}</span>`);
    });

    this.elements.queryDisplay.innerHTML = formattedQuery;
  }

  highlightStep(stepType) {
    this.clearHighlight();
    const keywordId = STEP_TO_KEYWORD_ID[stepType];
    const node = document.getElementById(keywordId);
    if (node) {
      node.classList.add("active");
    }
  }

  clearHighlight() {
    this.elements.queryDisplay.querySelectorAll("span").forEach((node) => {
      node.classList.remove("active");
    });
  }

  updateButtons() {
    this.elements.prevButton.disabled = this.stepIndex === 0;
    this.elements.nextButton.disabled = this.stepIndex >= this.steps.length;
  }

  updateStepLabel(activeType = "") {
    if (!this.steps.length) {
      this.elements.stepLabel.textContent = "No valid SQL steps detected.";
      return;
    }

    if (!activeType) {
      this.elements.stepLabel.textContent = `Ready to execute ${this.steps.length} step${this.steps.length === 1 ? "" : "s"}.`;
      return;
    }

    this.elements.stepLabel.textContent = `Step ${this.stepIndex} of ${this.steps.length}: ${activeType}`;
  }

  updateThemeLabel() {
    const theme = document.documentElement.dataset.theme || "dark";
    this.elements.themeLabel.textContent = theme === "dark" ? "Dark mode" : "Light mode";
    this.elements.themeToggle.setAttribute("aria-label", `Switch to ${theme === "dark" ? "light" : "dark"} mode`);
  }

  debounce(callback, delay) {
    let timeoutId;

    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }
}
