export class TableRenderer {
  constructor(elements) {
    this.host = elements.table;
    this.rowCount = elements.rowCount;
    this.copyButton = elements.copyDataButton;
    this.currentDataset = [];
    this.copyResetTimer = null;

    if (this.copyButton) {
      this.copyButton.addEventListener("click", () => this.copyCurrentData());
      this.syncCopyButton();
    }
  }

  render(dataset) {
    this.host.innerHTML = "";
    this.currentDataset = Array.isArray(dataset) ? dataset : [];
    this.syncCopyButton();

    if (!dataset.length) {
      this.rowCount.textContent = "Rows: 0";
      this.host.appendChild(
        this.createTableWrapper(
          "<table class=\"data-table\"><tbody><tr><td class=\"empty-state\">No rows to display for this step.</td></tr></tbody></table>"
        )
      );
      return;
    }

    if (this.isGrouped(dataset)) {
      this.rowCount.textContent = `Groups: ${dataset.length}`;
      this.renderGroupedData(dataset);
      return;
    }

    this.rowCount.textContent = `Rows: ${dataset.length}`;
    this.host.appendChild(this.createTableWrapper(this.createFlatTable(dataset)));
  }

  renderError(error) {
    this.host.innerHTML = "";
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
    const thead = document.createElement("thead");
    const headerRow = document.createElement("tr");

    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    const tbody = document.createElement("tbody");
    dataset.forEach((row) => {
      const tr = document.createElement("tr");

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
    dataset.forEach((group, index) => {
      const wrapper = document.createElement("div");
      wrapper.className = "group-card";

      const button = document.createElement("button");
      button.type = "button";
      button.className = "group-toggle";
      button.setAttribute("aria-expanded", index === 0 ? "true" : "false");
      button.innerHTML = `<span>Group: ${group.groupKey}</span><span>${group.count} rows</span>`;

      const content = document.createElement("div");
      content.className = "group-content";
      if (index !== 0) {
        content.hidden = true;
      }

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

  isGrouped(dataset) {
    return Boolean(dataset[0] && Array.isArray(dataset[0].rows));
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
      return;
    }

    const payload = this.formatDatasetForCopy(this.currentDataset);

    try {
      await navigator.clipboard.writeText(payload);
      this.showCopyState();
    } catch (error) {
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
