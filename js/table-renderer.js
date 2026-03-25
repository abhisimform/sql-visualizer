export class TableRenderer {
  constructor(elements) {
    this.host = elements.table;
    this.rowCount = elements.rowCount;
  }

  render(dataset) {
    this.host.innerHTML = "";

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
}
