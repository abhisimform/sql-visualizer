import { DATABASE, QUERY_SCHEMA } from "./data.js";
import { KEYWORDS, STEP_TO_KEYWORD_ID } from "./constants.js";
import { queryStorage, ThemeStore } from "./storage.js";
import { QueryParser } from "./query-parser.js";
import { QueryEngine } from "./query-engine.js";
import { TableRenderer } from "./table-renderer.js";
import { validateQuery } from "./query-validator.js";

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
    this.engine = new QueryEngine(DATABASE);
    this.renderer = new TableRenderer(this.elements);
    this.themeStore = new ThemeStore();
    this.steps = [];
    this.stepIndex = 0;
    this.currentData = [];
    this.queryError = null;

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
    this.engine.setQueryContext(query);
    this.engine.clearError();
    this.queryError = null;

    try {
      this.steps = this.engine.expandExecutionSteps(this.parser.parse(query));
    } catch (error) {
      this.steps = [];
      this.queryError = this.createAppError(
        "SyntaxError",
        "The query could not be parsed",
        query,
        "Check the SQL syntax and try again"
      );
    }

    if (!this.queryError) {
      const errors = validateQuery(this.steps, QUERY_SCHEMA, {
        rawQuery: query,
        sampleRows: Object.fromEntries(Object.entries(DATABASE).map(([tableName, rows]) => [tableName, rows[0] || null]))
      });

      if (errors.length) {
        this.queryError = errors[0];
        this.steps = [];
      }
    }

    this.stepIndex = 0;
    this.currentData = [];
    this.renderQuery(query, this.queryError);
    this.clearHighlight();

    if (this.queryError) {
      this.renderer.renderError(this.queryError);
      this.updateStepLabel();
      this.updateButtons();
      return;
    }

    this.renderer.render([]);
    this.updateStepLabel();
    this.updateButtons();
  }

  nextStep() {
    if (this.queryError || this.stepIndex >= this.steps.length) {
      return;
    }

    const step = this.steps[this.stepIndex];
    this.currentData = this.engine.executeStep(this.currentData, step);

    if (this.engine.getError()) {
      this.queryError = this.engine.getError();
      this.renderer.renderError(this.queryError);
      this.updateStepLabel();
      this.updateButtons();
      return;
    }

    this.highlightStep(step.type);
    this.stepIndex += 1;
    this.renderer.render(this.currentData);
    this.updateStepLabel(step.type);
    this.updateButtons();
  }

  prevStep() {
    if (this.queryError || this.stepIndex === 0) {
      return;
    }

    const targetIndex = this.stepIndex - 1;
    this.currentData = [];
    this.stepIndex = 0;
    this.engine.clearError();
    this.clearHighlight();

    while (this.stepIndex < targetIndex) {
      this.currentData = this.engine.executeStep(this.currentData, this.steps[this.stepIndex]);
      if (this.engine.getError()) {
        this.queryError = this.engine.getError();
        this.renderer.renderError(this.queryError);
        this.updateStepLabel();
        this.updateButtons();
        return;
      }
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

  renderQuery(query, error = null) {
    let formattedQuery = query;

    KEYWORDS.forEach((keyword) => {
      const id = keyword.replace(/\s+/g, "_");
      formattedQuery = formattedQuery.replace(new RegExp(keyword, "gi"), `<span id="${id}">${keyword}</span>`);
    });

    this.elements.queryDisplay.innerHTML = formattedQuery;

    if (!error || !error.location) {
      return;
    }
  }

  highlightErrorLocation(location) {
    const query = this.elements.queryInput.value;
    const lines = query.split("\n");
    const lineIndex = Math.max(0, (location.line || 1) - 1);
    const columnIndex = Math.max(0, (location.column || 1) - 1);
    let offset = 0;

    for (let index = 0; index < lineIndex; index += 1) {
      offset += (lines[index] || "").length + 1;
    }

    offset += columnIndex;
    if (offset < 0 || offset >= query.length) {
      return;
    }

    const marker = query[offset];
    const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    this.elements.queryDisplay.innerHTML = this.elements.queryDisplay.innerHTML.replace(
      new RegExp(escapedMarker),
      `<mark>${marker}</mark>`
    );
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
    if (this.queryError) {
      this.elements.prevButton.disabled = true;
      this.elements.nextButton.disabled = true;
      return;
    }

    this.elements.prevButton.disabled = this.stepIndex === 0;
    this.elements.nextButton.disabled = this.stepIndex >= this.steps.length;
  }

  updateStepLabel(activeType = "") {
    if (this.queryError) {
      this.elements.stepLabel.textContent = `${this.queryError.type}: ${this.queryError.message}`;
      return;
    }

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

  createAppError(type, message, query, suggestion) {
    const lines = query.split("\n");
    return {
      type,
      message,
      location: {
        line: lines.length ? 1 : 1,
        column: 1
      },
      suggestion
    };
  }

  debounce(callback, delay) {
    let timeoutId;

    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }
}
