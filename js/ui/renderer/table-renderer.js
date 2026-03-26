import { DATABASE } from "../../core/data/data.js";
import { AnimationEngine } from "../animation/animation-engine.js";
import { createLogger } from "../../services/dev-logger.js";

const logger = createLogger("Renderer");

export class TableRenderer {
  constructor(elements, options = {}) {
    this.host = elements.table;
    this.rowCount = elements.rowCount;
    this.copyButton = elements.copyDataButton;
    this.currentDataset = [];
    this.copyResetTimer = null;
    this.sourceData = options.sourceData || DATABASE;
    this.animations = new AnimationEngine();

    if (this.copyButton) {
      this.copyButton.addEventListener("click", () => this.copyCurrentData());
      this.syncCopyButton();
    }

    logger.debug("renderer.lifecycle", "renderer:constructed", { hasCopyButton: Boolean(this.copyButton) });
  }

  async renderTransition({ previousDataset = [], nextDataset = [], step = null }) {
    const normalizedPrevious = Array.isArray(previousDataset) ? previousDataset : [];
    const normalizedNext = Array.isArray(nextDataset) ? nextDataset : [];

    this.currentDataset = normalizedNext;
    this.updateRowCount(normalizedNext);
    this.syncCopyButton();
    logger.debug("renderer.lifecycle", "render-transition:start", {
      stepType: step?.type || "",
      previousRows: normalizedPrevious.length,
      nextRows: normalizedNext.length
    });

    if (!normalizedNext.length) {
      logger.debug("renderer.mode", "render-transition:fallback-empty");
      this.render(normalizedNext);
      return;
    }

    if (step?.type === "JOIN") {
      logger.debug("renderer.mode", "render-transition:join-animation", { table: step.value?.source?.table });
      const rightDataset = this.resolveTableRows(step.value?.source?.table);
      await this.animations.animateJoin({
        host: this.host,
        leftDataset: normalizedPrevious,
        rightDataset,
        joinMeta: step.value || {},
        resultDataset: normalizedNext,
        summarizeRow: (row) => this.summarizeRow(row, { compact: true }),
        buildFinalState: () => this.render(normalizedNext)
      });
      return;
    }

    if (step?.type === "GROUP BY" && this.isFlatRows(normalizedPrevious) && this.isGrouped(normalizedNext)) {
      logger.debug("renderer.mode", "render-transition:group-animation", { groupCount: normalizedNext.length });
      await this.animations.animateGrouping({
        host: this.host,
        previousDataset: normalizedPrevious,
        groupedData: normalizedNext,
        getRowLabel: (row) => this.summarizeRow(row, { compact: true }),
        buildFinalState: () => this.render(normalizedNext)
      });
      return;
    }

    if (this.isFlatRows(normalizedPrevious) && this.isFlatRows(normalizedNext)) {
      const mode = step?.type === "ORDER_BY" ? "reorder" : step?.type === "WHERE" ? "filter" : "rows";
      logger.debug("renderer.mode", "render-transition:row-animation", { mode });
      await this.animations.animateRowsDiff({
        host: this.host,
        mode,
        buildFinalState: () => this.render(normalizedNext)
      });
      return;
    }

    logger.debug("renderer.mode", "render-transition:direct-render");
    this.render(normalizedNext);
  }

  render(dataset) {
    logger.debug("renderer.lifecycle", "render:start", { rowCount: Array.isArray(dataset) ? dataset.length : 0 });
    this.host.innerHTML = "";
    this.host.classList.remove("table-host-grouped");
    this.currentDataset = Array.isArray(dataset) ? dataset : [];
    this.updateRowCount(this.currentDataset);
    this.syncCopyButton();

    if (!this.currentDataset.length) {
      logger.debug("renderer.dataset", "render:empty-state");
      this.host.appendChild(
        this.createTableWrapper(
          "<table class=\"data-table\"><tbody><tr><td class=\"empty-state\">No rows to display for this step.</td></tr></tbody></table>"
        )
      );
      return;
    }

    if (this.isGrouped(this.currentDataset)) {
      logger.debug("renderer.mode", "render:grouped", { groupCount: this.currentDataset.length });
      this.host.classList.add("table-host-grouped");
      this.renderGroupedData(this.currentDataset);
      return;
    }

    logger.debug("renderer.mode", "render:flat", { rowCount: this.currentDataset.length });
    this.host.appendChild(this.createTableWrapper(this.createFlatTable(this.currentDataset)));
  }

  renderError(error) {
    logger.error("renderer.errors", "render:error", { error });
    this.host.innerHTML = "";
    this.host.classList.remove("table-host-grouped");
    this.currentDataset = [];
    this.syncCopyButton();
    this.rowCount.textContent = "Error";

    const suggestion = error.suggestion ? `<p>${error.suggestion}</p>` : "";
    const location = error.location ? `<p>Line ${error.location.line}, Column ${error.location.column}</p>` : "";

    this.host.appendChild(
      this.createTableWrapper(`
        <table class="data-table">
          <tbody>
            <tr>
              <td class="empty-state">
                <strong>${error.type}</strong>
                <p>${error.message}</p>
                ${location}
                ${suggestion}
              </td>
            </tr>
          </tbody>
        </table>
      `)
    );
  }

  updateRowCount(dataset) {
    if (!Array.isArray(dataset) || !dataset.length) {
      this.rowCount.textContent = "Rows: 0";
      return;
    }

    this.rowCount.textContent = this.isGrouped(dataset) ? `Groups: ${dataset.length}` : `Rows: ${dataset.length}`;
  }

  createTableWrapper(content) {
    const wrapper = document.createElement("div");
    wrapper.className = "table-scroll";

    if (typeof content === "string") {
      wrapper.innerHTML = content;
    } else {
      wrapper.appendChild(content);
    }

    return wrapper;
  }

  createFlatTable(dataset) {
    const table = document.createElement("table");
    table.className = "data-table";

    const headers = Object.keys(dataset[0]);
    const keyedRows = this.annotateRows(dataset);
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");
    keyedRows.forEach(({ row, key }) => {
      const tr = document.createElement("tr");
      tr.dataset.rowKey = key;

      headers.forEach((header) => {
        const td = document.createElement("td");
        td.textContent = row[header];
        tr.appendChild(td);
      });

      tbody.appendChild(tr);
    });

    table.append(thead, tbody);
    return table;
  }

  renderGroupedData(dataset) {
    logger.debug("renderer.dataset", "render-grouped-data", { groupCount: dataset.length });
    const columns = Math.max(1, Math.min(dataset.length, dataset.length <= 2 ? 2 : dataset.length <= 4 ? 3 : 4));
    this.host.style.setProperty("--group-columns", String(columns));

    dataset.forEach((group, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "group-card";
      wrapper.style.setProperty("--group-size", String(group.rows.length));

      const button = document.createElement("button");
      button.type = "button";
      button.className = "group-toggle";
      // button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      button.setAttribute("aria-expanded", "true");
      button.innerHTML = `<span>Group: ${group.groupKey}</span><span>${group.count} rows</span>`;

      const content = document.createElement("div");
      content.className = "group-content";
      // if (index !== 0) {
      //   content.hidden = true;
      // }

      button.addEventListener("click", () => {
        const isExpanded = button.getAttribute("aria-expanded") === "true";
        button.setAttribute("aria-expanded", String(!isExpanded));
        content.hidden = isExpanded;
      });

      content.appendChild(this.createTableWrapper(this.createFlatTable(group.rows)));
      wrapper.append(button, content);
      this.host.appendChild(wrapper);
    });
  }

  annotateRows(dataset) {
    const seen = new Map();
    return dataset.map((row) => {
      const signature = this.stableKey(row);
      const occurrence = seen.get(signature) || 0;
      seen.set(signature, occurrence + 1);
      return {
        row,
        key: `${signature}__${occurrence}`
      };
    });
  }

  summarizeRow(row, options = {}) {
    const compact = Boolean(options.compact);

    if (!row || typeof row !== "object") {
      return String(row);
    }

    const preferredKeys = ["id", "name", "city", "status", "dept", "order_date"];
    const chosen = [];

    preferredKeys.forEach((key) => {
      if (chosen.length >= (compact ? 2 : 3)) {
        return;
      }
      if (Object.prototype.hasOwnProperty.call(row, key) && row[key] !== undefined) {
        chosen.push([key, row[key]]);
      }
    });

    if (!chosen.length) {
      Object.entries(row).slice(0, compact ? 2 : 3).forEach((entry) => chosen.push(entry));
    }

    return chosen
      .map(([key, value]) => `${this.formatSummaryKey(key)}: ${this.truncateValue(value, compact ? 14 : 22)}`)
      .join(" | ");
  }

  formatSummaryKey(key) {
    return String(key || "")
      .replace(/_/g, " ")
      .replace(/\bid\b/i, "ID");
  }

  truncateValue(value, maxLength) {
    const text = String(value ?? "");
    return text.length > maxLength ? `${text.slice(0, maxLength - 1)}...` : text;
  }

  resolveTableRows(tableName) {
    const normalizedName = String(tableName || "").toLowerCase();
    const exactKey = Object.keys(this.sourceData || {}).find((key) => key.toLowerCase() === normalizedName);
    logger.debug("data.tableAccess", "renderer:table-resolve", { requested: tableName, resolved: exactKey || null });
    return exactKey ? this.sourceData[exactKey] : [];
  }

  isGrouped(dataset) {
    return Boolean(dataset[0] && Array.isArray(dataset[0].rows));
  }

  isFlatRows(dataset) {
    return Array.isArray(dataset) && (!dataset.length || !Array.isArray(dataset[0]?.rows));
  }

  stableKey(value) {
    if (value === null || value === undefined) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableKey(item)).join(",")}]`;
    }

    if (typeof value === "object") {
      const keys = Object.keys(value).sort();
      return `{${keys.map((key) => `${key}:${this.stableKey(value[key])}`).join("|")}}`;
    }

    return JSON.stringify(value);
  }

  syncCopyButton() {
    if (!this.copyButton) {
      return;
    }

    this.copyButton.disabled = !this.currentDataset.length;
    this.copyButton.classList.remove("is-copied");
    this.copyButton.setAttribute("aria-label", "Copy current table data");
    this.copyButton.setAttribute("title", this.currentDataset.length ? "Copy current table data" : "No data to copy");
  }

  async copyCurrentData() {
    if (!this.currentDataset.length) {
      logger.debug("renderer.copy", "copy:blocked-empty");
      return;
    }

    const payload = this.formatDatasetForCopy(this.currentDataset);

    try {
      await navigator.clipboard.writeText(payload);
      logger.debug("renderer.copy", "copy:success", { length: payload.length });
      this.showCopyState();
    } catch (error) {
      logger.error("renderer.errors", "copy:clipboard-failed", { error: error.message });
      this.fallbackCopy(payload);
      this.showCopyState();
    }
  }

  fallbackCopy(payload) {
    const helper = document.createElement("textarea");
    helper.value = payload;
    helper.setAttribute("readonly", "true");
    helper.style.position = "fixed";
    helper.style.opacity = "0";
    helper.style.pointerEvents = "none";
    document.body.appendChild(helper);
    helper.select();
    document.execCommand("copy");
    document.body.removeChild(helper);
  }

  showCopyState() {
    if (!this.copyButton) {
      return;
    }

    window.clearTimeout(this.copyResetTimer);
    this.copyButton.classList.add("is-copied");
    this.copyButton.setAttribute("aria-label", "Copied current table data");
    this.copyButton.setAttribute("title", "Copied current table data");
    this.copyResetTimer = window.setTimeout(() => {
      this.copyButton.classList.remove("is-copied");
      this.copyButton.setAttribute("aria-label", "Copy current table data");
      this.copyButton.setAttribute("title", "Copy current table data");
    }, 1400);
  }

  formatDatasetForCopy(dataset) {
    if (this.isGrouped(dataset)) {
      return dataset
        .map((group) => `{
  groupKey: ${this.formatValue(group.groupKey)},
  count: ${this.formatValue(group.count)},
  rows: ${this.formatArray(group.rows, 2)}
}`)
        .join(",\n");
    }

    return this.formatArray(dataset, 0);
  }

  formatArray(values, indentLevel) {
    const indent = "  ".repeat(indentLevel);
    const innerIndent = "  ".repeat(indentLevel + 1);
    const rows = values.map((value) => `${innerIndent}${this.formatValue(value, indentLevel + 1)}`);

    return `[
${rows.join(",\n")}
${indent}]`;
  }

  formatValue(value, indentLevel = 0) {
    if (Array.isArray(value)) {
      return this.formatArray(value, indentLevel);
    }

    if (value && typeof value === "object") {
      const indent = "  ".repeat(indentLevel);
      const innerIndent = "  ".repeat(indentLevel + 1);
      const entries = Object.entries(value).map(
        ([key, entryValue]) => `${innerIndent}${key}: ${this.formatValue(entryValue, indentLevel + 1)}`
      );

      return `{
${entries.join(",\n")}
${indent}}`;
    }

    if (typeof value === "string") {
      return JSON.stringify(value);
    }

    if (value === undefined) {
      return "undefined";
    }

    return String(value);
  }
}
