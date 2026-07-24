// database-browser.js
// Interactive browser for table structures and rows preview

import { DATABASE, QUERY_SCHEMA } from "../core/data/data.js";
import { ThemeStore } from "../services/storage.js";

class DatabaseBrowser {
  constructor() {
    this.themeStore = new ThemeStore();
    this.activeTable = Object.keys(QUERY_SCHEMA)[0] || "";
    
    this.elements = {
      themeToggle: document.getElementById("themeToggle"),
      themeLabel: document.getElementById("themeLabel"),
      tableSelectorList: document.getElementById("tableSelectorList"),
      currentTableName: document.getElementById("currentTableName"),
      rowCountBadge: document.getElementById("rowCountBadge"),
      columnAttributesList: document.getElementById("columnAttributesList"),
      previewTableContainer: document.getElementById("previewTableContainer")
    };
  }

  init() {
    this.setupTheme();
    this.renderSidebar();
    if (this.activeTable) {
      this.selectTable(this.activeTable);
    }
  }

  setupTheme() {
    this.updateThemeLabel();
    this.elements.themeToggle?.addEventListener("click", () => {
      this.themeStore.toggle();
      this.updateThemeLabel();
    });
  }

  updateThemeLabel() {
    if (!this.elements.themeLabel) return;
    const isDark = document.documentElement.dataset.theme === "dark";
    this.elements.themeLabel.textContent = isDark ? "Dark mode" : "Light mode";
  }

  renderSidebar() {
    if (!this.elements.tableSelectorList) return;
    
    const tables = Object.keys(QUERY_SCHEMA);
    let html = "";
    
    tables.forEach(tableName => {
      const rowCount = (DATABASE[tableName] || []).length;
      html += `
        <button class="sidebar-table-btn ${tableName === this.activeTable ? 'active' : ''}" data-table="${tableName}">
          <span class="btn-table-icon">📄</span>
          <span class="btn-table-name">${tableName}</span>
          <span class="btn-table-count">${rowCount} rows</span>
        </button>
      `;
    });
    
    this.elements.tableSelectorList.innerHTML = html;
    
    // Add event listeners
    this.elements.tableSelectorList.querySelectorAll(".sidebar-table-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        const tableName = btn.dataset.table;
        this.selectTable(tableName);
      });
    });
  }

  selectTable(tableName) {
    this.activeTable = tableName;
    
    // Update sidebar active styling
    this.elements.tableSelectorList?.querySelectorAll(".sidebar-table-btn").forEach(btn => {
      if (btn.dataset.table === tableName) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });

    const dataset = DATABASE[tableName] || [];
    const columns = QUERY_SCHEMA[tableName] || [];

    // Update labels
    if (this.elements.currentTableName) {
      this.elements.currentTableName.textContent = tableName.toUpperCase();
    }
    if (this.elements.rowCountBadge) {
      this.elements.rowCountBadge.textContent = `Rows: ${dataset.length}`;
    }

    this.renderColumnsInfo(tableName, columns, dataset);
    this.renderDataPreview(columns, dataset);
  }

  renderColumnsInfo(tableName, columns, dataset) {
    if (!this.elements.columnAttributesList) return;

    let html = "";
    const sampleRow = dataset[0] || {};

    columns.forEach(col => {
      const value = sampleRow[col];
      const type = typeof value === "number" ? "NUMERIC" : value instanceof Date ? "DATE" : value === null ? "UNKNOWN" : "VARCHAR";
      
      html += `
        <div class="attribute-card">
          <div class="attribute-name">${col}</div>
          <div class="attribute-type">${type}</div>
        </div>
      `;
    });

    this.elements.columnAttributesList.innerHTML = html;
  }

  renderDataPreview(columns, dataset) {
    if (!this.elements.previewTableContainer) return;

    if (dataset.length === 0) {
      this.elements.previewTableContainer.innerHTML = `
        <div class="empty-state">
          <strong>No Data Available</strong>
          <p>This table is currently empty.</p>
        </div>
      `;
      return;
    }

    let html = `<div class="table-scroll"><table class="data-table"><thead><tr>`;
    
    // Headers
    columns.forEach(col => {
      html += `<th>${col}</th>`;
    });
    html += `</tr></thead><tbody>`;

    // Rows
    dataset.forEach(row => {
      html += `<tr>`;
      columns.forEach(col => {
        const val = row[col];
        const displayVal = val === null || val === undefined ? `<span class="null-text">NULL</span>` : val;
        html += `<td>${displayVal}</td>`;
      });
      html += `</tr>`;
    });

    html += `</tbody></table></div>`;
    this.elements.previewTableContainer.innerHTML = html;
  }
}

// Instantiate and initialize browser on page load
document.addEventListener("DOMContentLoaded", () => {
  const browser = new DatabaseBrowser();
  browser.init();
});
