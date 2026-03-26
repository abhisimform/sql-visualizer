import { DATABASE, QUERY_SCHEMA } from "./data.js";
import { KEYWORDS } from "./constants.js";
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
      animationToggle: document.getElementById("animationToggle"),
      prevButton: document.getElementById("prevButton"),
      nextButton: document.getElementById("nextButton"),
      stepLabel: document.getElementById("stepLabel"),
      rowCount: document.getElementById("rowCount"),
      copyDataButton: document.getElementById("copyDataButton"),
      table: document.getElementById("table"),
      resultsPanel: document.querySelector(".panel-results"),
      themeToggle: document.getElementById("themeToggle"),
      themeLabel: document.getElementById("themeLabel")
    };

    this.parser = new QueryParser();
    this.engine = new QueryEngine(DATABASE);
    this.renderer = new TableRenderer(this.elements, { sourceData: DATABASE });
    this.themeStore = new ThemeStore();
    this.executionSteps = [];
    this.steps = [];
    this.stepIndex = 0;
    this.currentData = [];
    this.visibleData = [];
    this.queryError = null;
    this.isAnimating = false;
    this.animationsEnabled = false;
    this.previewState = new Map();
    this.previewContextCounter = 0;

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
    this.updateAnimationToggle();
    this.run();
  }

  bindEvents() {
    this.elements.runButton.addEventListener("click", () => this.run());
    this.elements.animationToggle.addEventListener("click", () => this.toggleAnimations());
    this.elements.prevButton.addEventListener("click", () => this.prevStep());
    this.elements.nextButton.addEventListener("click", () => this.nextStep());
    this.elements.queryInput.addEventListener("input", this.saveQuery);
    this.elements.themeToggle.addEventListener("click", () => {
      this.themeStore.toggle();
      this.updateThemeLabel();
    });
  }

  run() {
    if (this.isAnimating) {
      return;
    }

    const query = this.elements.queryInput.value.trim();
    this.engine.setQueryContext(query);
    this.engine.clearError();
    this.queryError = null;
    this.previewState = new Map();
    this.previewContextCounter = 0;

    try {
      this.executionSteps = this.engine.expandExecutionSteps(this.parser.parse(query));
      this.steps = this.buildDisplaySteps(this.executionSteps);
    } catch (error) {
      this.executionSteps = [];
      this.steps = [];
      this.queryError = this.createAppError(
        "SyntaxError",
        "The query could not be parsed",
        query,
        "Check the SQL syntax and try again"
      );
    }

    if (!this.queryError) {
      const errors = validateQuery(this.executionSteps, QUERY_SCHEMA, {
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
    this.visibleData = [];
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

  async nextStep() {
    if (this.queryError || this.stepIndex >= this.steps.length || this.isAnimating) {
      return;
    }

    const step = this.steps[this.stepIndex];
    const previousMainData = this.snapshotDataset(this.currentData);
    const previousVisibleData = this.snapshotDataset(this.visibleData);
    const result = this.applyDisplayStep(step);

    if (result.error) {
      this.queryError = result.error;
      this.renderer.renderError(this.queryError);
      this.updateStepLabel();
      this.updateButtons();
      return;
    }

    this.currentData = result.mainData;
    this.visibleData = result.visibleData;
    this.highlightStep(step, this.stepIndex);
    this.stepIndex += 1;
    this.updateStepLabel(step);
    this.updateButtons();

    if (!this.animationsEnabled) {
      this.elements.resultsPanel?.classList.remove("is-animating");
      this.renderer.render(this.visibleData);
      this.updateStepLabel(step);
      this.updateButtons();
      return;
    }

    this.isAnimating = true;
    this.elements.resultsPanel?.classList.add("is-animating");
    this.updateStepLabel(step);
    this.updateButtons();

    try {
      await this.renderer.renderTransition({
        previousDataset: step.animationSource === "main" ? previousMainData : previousVisibleData,
        nextDataset: this.visibleData,
        step,
        stepIndex: this.stepIndex - 1,
        steps: this.steps
      });
    } finally {
      this.isAnimating = false;
      this.elements.resultsPanel?.classList.remove("is-animating");
      this.updateStepLabel(step);
      this.updateButtons();
    }
  }

  prevStep() {
    if (this.queryError || this.stepIndex === 0 || this.isAnimating) {
      return;
    }

    const targetIndex = this.stepIndex - 1;
    this.currentData = [];
    this.visibleData = [];
    this.stepIndex = 0;
    this.previewState = new Map();
    this.previewContextCounter = 0;
    this.elements.resultsPanel?.classList.remove("is-animating");
    this.engine.clearError();
    this.clearHighlight();

    while (this.stepIndex < targetIndex) {
      const result = this.applyDisplayStep(this.steps[this.stepIndex]);
      if (result.error) {
        this.queryError = result.error;
        this.renderer.renderError(this.queryError);
        this.updateStepLabel();
        this.updateButtons();
        return;
      }
      this.currentData = result.mainData;
      this.visibleData = result.visibleData;
      this.stepIndex += 1;
    }

    const activeIndex = targetIndex - 1;
    const activeStep = activeIndex >= 0 ? this.steps[activeIndex] : null;
    if (activeStep) {
      this.highlightStep(activeStep, activeIndex);
    }

    this.renderer.render(this.visibleData);
    this.updateStepLabel(activeStep);
    this.updateButtons();
  }

  renderQuery(query, error = null) {
    const segments = this.collectKeywordSegments(query);
    const occupied = segments.map((segment) => [segment.start, segment.end]);

    const sourceTokens = Array.from(new Set(
      this.steps
        .map((step) => step.highlightSource)
        .filter((value) => value && !/[()]/.test(value))
    )).sort((left, right) => right.length - left.length);

    sourceTokens.forEach((source) => {
      const sourceKey = source.toLowerCase();
      const indexes = this.findAllOccurrences(query, source);

      indexes.forEach((start, occurrence) => {
        const end = start + source.length;
        if (occupied.some(([left, right]) => !(end <= left || start >= right))) {
          return;
        }

        segments.push({
          start,
          end,
          priority: 2,
          html: `<span class="query-source" data-source="${sourceKey}" data-occurrence="${occurrence}">${this.escapeHtml(query.slice(start, end))}</span>`
        });
        occupied.push([start, end]);
      });
    });

    segments.sort((left, right) => left.start - right.start || left.priority - right.priority);

    let cursor = 0;
    let html = "";
    segments.forEach((segment) => {
      if (segment.start < cursor) {
        return;
      }

      html += this.escapeHtml(query.slice(cursor, segment.start));
      html += segment.html;
      cursor = segment.end;
    });

    html += this.escapeHtml(query.slice(cursor));
    this.elements.queryDisplay.innerHTML = html;

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

  highlightStep(stepOrType, stepIndex = this.stepIndex) {
    this.clearHighlight();

    const step = typeof stepOrType === "string" ? { type: stepOrType } : stepOrType;
    if (step?.highlightKey) {
      const node = this.elements.queryDisplay.querySelector(
        `[data-highlight-key="${step.highlightKey}"]`
      );

      if (node) {
        node.classList.add("active");
      }
    }

    if (step?.highlightSource) {
      const sourceKey = step.highlightSource.toLowerCase();
      const occurrence = this.getSourceHighlightOccurrence(sourceKey, stepIndex);
      const node = this.elements.queryDisplay.querySelector(
        `[data-source="${sourceKey}"][data-occurrence="${occurrence}"]`
      );

      if (node) {
        node.classList.add("active");
      }
    }
  }

  clearHighlight() {
    this.elements.queryDisplay.querySelectorAll("span").forEach((node) => {
      node.classList.remove("active");
    });
  }

  getSourceHighlightOccurrence(sourceKey, stepIndex) {
    let occurrence = 0;

    for (let index = 0; index < stepIndex; index += 1) {
      if ((this.steps[index]?.highlightSource || "").toLowerCase() === sourceKey) {
        occurrence += 1;
      }
    }

    return occurrence;
  }

  normalizeStepType(stepType = "") {
    return String(stepType || "")
      .trim()
      .replace(/_/g, " ")
      .replace(/\s+/g, " ")
      .toUpperCase();
  }

  snapshotDataset(dataset) {
    if (typeof structuredClone === "function") {
      return structuredClone(dataset);
    }

    return JSON.parse(JSON.stringify(dataset || []));
  }

  updateButtons() {
    this.elements.runButton.disabled = this.isAnimating;
    this.elements.animationToggle.disabled = this.isAnimating;

    if (this.queryError) {
      this.elements.prevButton.disabled = true;
      this.elements.nextButton.disabled = true;
      return;
    }

    if (this.isAnimating) {
      this.elements.prevButton.disabled = true;
      this.elements.nextButton.disabled = true;
      return;
    }

    this.elements.prevButton.disabled = this.stepIndex === 0;
    this.elements.nextButton.disabled = this.stepIndex >= this.steps.length;
  }

  updateStepLabel(activeStep = null) {
    const label = typeof activeStep === "string"
      ? activeStep
      : activeStep?.displayLabel || this.normalizeStepType(activeStep?.type || "");

    if (this.queryError) {
      this.elements.stepLabel.textContent = `${this.queryError.type}: ${this.queryError.message}`;
      return;
    }

    if (!this.steps.length) {
      this.elements.stepLabel.textContent = "No valid SQL steps detected.";
      return;
    }

    if (!label) {
      this.elements.stepLabel.textContent = `Ready to execute ${this.steps.length} step${this.steps.length === 1 ? "" : "s"}.`;
      return;
    }

    this.elements.stepLabel.textContent = this.isAnimating
      ? `Animating step ${this.stepIndex} of ${this.steps.length}: ${label}`
      : `Step ${this.stepIndex} of ${this.steps.length}: ${label}`;
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

  buildDisplaySteps(steps, contextId = "root", outerAliases = new Set()) {
    const localAliases = contextId === "root" ? this.collectAliasesFromSteps(steps) : new Set();
    const availableOuterAliases = new Set([...outerAliases, ...localAliases]);
    const typeCounts = new Map();

    return steps.flatMap((step) => this.expandDisplayStep(step, contextId, availableOuterAliases, typeCounts));
  }

  expandDisplayStep(step, contextId = "root", outerAliases = new Set(), typeCounts = new Map()) {
    const displaySteps = [];
    const clausePath = this.getClausePathSegment(step.type);

    if (step.type === "FROM" && step.value?.subquery) {
      const subqueryContextId = `${contextId}>${clausePath}_subquery_0`;
      const nestedSteps = this.engine.expandExecutionSteps(step.value.subquery);
      displaySteps.push(...this.buildDisplaySteps(nestedSteps, subqueryContextId));
    } else {
      this.collectSubqueriesFromStep(step).forEach((subquery, index) => {
        if (this.isCorrelatedSubquery(subquery.query, outerAliases)) {
          return;
        }

        const subqueryContextId = `${contextId}>${clausePath}_subquery_${index}`;
        const nestedSteps = this.engine.expandExecutionSteps(subquery.query);
        displaySteps.push(...this.buildDisplaySteps(nestedSteps, subqueryContextId, outerAliases));
      });
    }

    if (contextId === "root" && step.type === "JOIN" && step.value?.source) {
      displaySteps.push({
        type: "SOURCE",
        kind: "source",
        sourceSpec: step.value.source,
        highlightSource: step.value.source.raw,
        animationSource: "visible",
        displayLabel: `Load ${String(step.value.source.table || "source").toUpperCase()}`
      });
    }

    const normalizedType = this.normalizeStepType(step.type);
    const typeOccurrence = typeCounts.get(normalizedType) || 0;
    typeCounts.set(normalizedType, typeOccurrence + 1);

    displaySteps.push({
      type: step.type,
      value: step.value,
      contextId,
      kind: contextId !== "root" ? "preview" : "execute",
      highlightSource: this.getHighlightSource(step),
      animationSource: contextId !== "root" ? "visible" : "main",
      displayLabel: contextId !== "root" ? `${this.normalizeStepType(step.type)} in subquery` : this.normalizeStepType(step.type),
      highlightKey: `${contextId}:${normalizedType}:${typeOccurrence}`
    });

    return displaySteps;
  }

  collectSubqueriesFromStep(step) {
    if (!step) {
      return [];
    }

    if (step.type === "WHERE" || step.type === "HAVING") {
      return step.value.clauses.flatMap((clause) => [
        ...this.collectSubqueriesFromExpression(clause.left),
        ...this.collectSubqueriesFromExpression(clause.right)
      ]);
    }

    if (step.type === "SELECT" || step.type === "GROUP BY" || step.type === "ORDER_BY") {
      return step.value.flatMap((expression) => this.collectSubqueriesFromExpression(expression));
    }

    if (step.type === "JOIN" && step.value?.condition) {
      return step.value.condition.clauses.flatMap((clause) => [
        ...this.collectSubqueriesFromExpression(clause.left),
        ...this.collectSubqueriesFromExpression(clause.right)
      ]);
    }

    return [];
  }

  collectSubqueriesFromExpression(expression) {
    if (!expression) {
      return [];
    }

    if (expression.kind === "subquery") {
      return [expression];
    }

    if (expression.kind === "binary") {
      return [
        ...this.collectSubqueriesFromExpression(expression.left),
        ...this.collectSubqueriesFromExpression(expression.right)
      ];
    }

    if (expression.kind === "aggregate") {
      return this.collectSubqueriesFromExpression(expression.argument);
    }

    if (expression.kind === "list") {
      return expression.values.flatMap((value) => this.collectSubqueriesFromExpression(value));
    }

    return [];
  }

  collectAliasesFromSteps(steps) {
    const aliases = new Set();

    steps.forEach((step) => {
      if (step.type === "FROM" && step.value?.alias) {
        aliases.add(step.value.alias.toLowerCase());
        return;
      }

      if (step.type === "JOIN" && step.value?.source?.alias) {
        aliases.add(step.value.source.alias.toLowerCase());
      }
    });

    return aliases;
  }

  isCorrelatedSubquery(steps, outerAliases) {
    if (!outerAliases.size) {
      return false;
    }

    const localAliases = this.collectAliasesFromSteps(steps);

    return steps.some((step) => this.stepUsesOuterAlias(step, outerAliases, localAliases));
  }

  stepUsesOuterAlias(step, outerAliases, localAliases) {
    if (!step) {
      return false;
    }

    if (step.type === "WHERE" || step.type === "HAVING") {
      return step.value.clauses.some((clause) => (
        this.expressionUsesOuterAlias(clause.left, outerAliases, localAliases)
        || this.expressionUsesOuterAlias(clause.right, outerAliases, localAliases)
      ));
    }

    if (step.type === "SELECT" || step.type === "GROUP BY" || step.type === "ORDER_BY") {
      return step.value.some((expression) => this.expressionUsesOuterAlias(expression, outerAliases, localAliases));
    }

    if (step.type === "JOIN" && step.value?.condition) {
      return step.value.condition.clauses.some((clause) => (
        this.expressionUsesOuterAlias(clause.left, outerAliases, localAliases)
        || this.expressionUsesOuterAlias(clause.right, outerAliases, localAliases)
      ));
    }

    return false;
  }

  expressionUsesOuterAlias(expression, outerAliases, localAliases) {
    if (!expression) {
      return false;
    }

    if (expression.kind === "column" && expression.qualifier) {
      return outerAliases.has(expression.qualifier.toLowerCase()) && !localAliases.has(expression.qualifier.toLowerCase());
    }

    if (expression.kind === "binary") {
      return this.expressionUsesOuterAlias(expression.left, outerAliases, localAliases)
        || this.expressionUsesOuterAlias(expression.right, outerAliases, localAliases);
    }

    if (expression.kind === "aggregate") {
      return this.expressionUsesOuterAlias(expression.argument, outerAliases, localAliases);
    }

    if (expression.kind === "list") {
      return expression.values.some((value) => this.expressionUsesOuterAlias(value, outerAliases, localAliases));
    }

    if (expression.kind === "subquery") {
      return this.isCorrelatedSubquery(expression.query, new Set([...outerAliases, ...localAliases]));
    }

    return false;
  }

  getHighlightSource(step) {
    if (step?.type === "FROM") {
      const source = step.value?.raw || "";
      return source && !/[()]/.test(source) ? source : "";
    }

    if (step?.type === "JOIN") {
      const source = step.value?.source?.raw || "";
      return source && !/[()]/.test(source) ? source : "";
    }

    if (step?.type === "SOURCE") {
      const source = step.sourceSpec?.raw || "";
      return source && !/[()]/.test(source) ? source : "";
    }

    return "";
  }

  applyDisplayStep(step) {
    if (step.kind === "source") {
      return {
        mainData: this.currentData,
        visibleData: this.snapshotDataset(this.renderer.resolveTableRows(step.sourceSpec?.table))
      };
    }

    if (step.contextId && step.contextId !== "root") {
      const previewContext = this.getPreviewContext(step.contextId);
      previewContext.engine.setQueryContext(this.elements.queryInput.value.trim());
      previewContext.engine.clearError();
      previewContext.dataset = previewContext.engine.executeStep(previewContext.dataset, {
        type: step.type,
        value: step.value
      });

      return {
        mainData: this.currentData,
        visibleData: this.snapshotDataset(previewContext.dataset),
        error: previewContext.engine.getError()
      };
    }

    this.engine.clearError();
    const mainData = this.engine.executeStep(this.currentData, {
      type: step.type,
      value: step.value
    });

    return {
      mainData,
      visibleData: this.snapshotDataset(mainData),
      error: this.engine.getError()
    };
  }

  getPreviewContext(contextId) {
    if (!this.previewState.has(contextId)) {
      this.previewState.set(contextId, {
        dataset: [],
        engine: new QueryEngine(DATABASE)
      });
    }

    return this.previewState.get(contextId);
  }

  nextPreviewContextId() {
    this.previewContextCounter += 1;
    return `subquery_${this.previewContextCounter}`;
  }

  collectKeywordSegments(query, contextId = "root", baseOffset = 0) {
    const clauses = this.getClauseEntries(query);
    const typeCounts = new Map();
    const segments = [];

    clauses.forEach((clause) => {
      const normalizedType = this.normalizeStepType(clause.type);
      const occurrence = typeCounts.get(normalizedType) || 0;
      typeCounts.set(normalizedType, occurrence + 1);

      segments.push({
        start: baseOffset + clause.index,
        end: baseOffset + clause.index + clause.token.length,
        priority: 1,
        html: `<span class="query-keyword" data-highlight-key="${contextId}:${normalizedType}:${occurrence}">${this.escapeHtml(clause.token)}</span>`
      });

      const subqueries = this.findSubqueryRanges(clause.raw, baseOffset + clause.rawStart);
      subqueries.forEach((subquery, index) => {
        const subqueryContextId = `${contextId}>${this.getClausePathSegment(clause.type)}_subquery_${index}`;
        segments.push(...this.collectKeywordSegments(subquery.text, subqueryContextId, subquery.start));
      });
    });

    return segments;
  }

  getClauseEntries(query) {
    const clauseDefinitions = [
      { type: "SELECT", token: "SELECT" },
      { type: "FROM", token: "FROM" },
      { type: "WHERE", token: "WHERE" },
      { type: "GROUP BY", token: "GROUP BY" },
      { type: "HAVING", token: "HAVING" },
      { type: "ORDER BY", token: "ORDER BY" },
      { type: "LIMIT", token: "LIMIT" },
      { type: "OFFSET", token: "OFFSET" }
    ];

    const positions = clauseDefinitions
      .map((entry) => ({ ...entry, index: this.parser.findTopLevelKeyword(query, entry.token) }))
      .filter((entry) => entry.index !== -1)
      .sort((left, right) => left.index - right.index);

    return positions.map((entry, index) => {
      const rawStart = entry.index + entry.token.length;
      const rawEnd = index + 1 < positions.length ? positions[index + 1].index : query.length;

      return {
        ...entry,
        rawStart,
        raw: query.slice(rawStart, rawEnd)
      };
    });
  }

  findSubqueryRanges(text, baseOffset) {
    const ranges = [];

    for (let index = 0; index < text.length; index += 1) {
      if (text[index] !== "(") {
        continue;
      }

      const closeIndex = this.parser.findMatchingParenthesis(text, index);
      if (closeIndex === -1) {
        continue;
      }

      const inner = text.slice(index + 1, closeIndex);
      const trimmed = inner.trim();
      const leadingTrim = inner.length - inner.trimStart().length;

      if (/^SELECT\s+/i.test(trimmed)) {
        ranges.push({
          start: baseOffset + index + 1 + leadingTrim,
          text: trimmed
        });
      }

      index = closeIndex;
    }

    return ranges;
  }

  getClausePathSegment(stepType = "") {
    return String(stepType || "")
      .trim()
      .replace(/\s+/g, "_")
      .replace(/[^a-zA-Z0-9_]/g, "_")
      .toLowerCase();
  }

  findAllOccurrences(query, value) {
    const indexes = [];
    const source = String(value || "");
    const haystack = query.toLowerCase();
    const needle = source.toLowerCase();
    let startIndex = 0;

    if (!needle) {
      return indexes;
    }

    while (startIndex < haystack.length) {
      const index = haystack.indexOf(needle, startIndex);
      if (index === -1) {
        break;
      }

      indexes.push(index);
      startIndex = index + needle.length;
    }

    return indexes;
  }

  escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\"/g, "&quot;");
  }

  debounce(callback, delay) {
    let timeoutId;

    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => callback(...args), delay);
    };
  }

  toggleAnimations() {
    if (this.isAnimating) {
      return;
    }

    this.animationsEnabled = !this.animationsEnabled;
    this.updateAnimationToggle();
    this.updateStepLabel(this.steps[this.stepIndex - 1]?.type || "");
  }

  updateAnimationToggle() {
    if (!this.elements.animationToggle) {
      return;
    }

    const label = this.animationsEnabled ? "Animation: On" : "Animation: Off";
    this.elements.animationToggle.textContent = label;
    this.elements.animationToggle.setAttribute("aria-pressed", String(this.animationsEnabled));
    this.elements.animationToggle.setAttribute(
      "title",
      this.animationsEnabled
        ? "Animate the next execution step"
        : "Render the next execution step instantly"
    );
  }
}
