import { createLogger } from "../../services/dev-logger.js";
import { getLeafClauses } from "../../core/parser/query-parser.js";

const logger = createLogger("Animation");

export class AnimationEngine {
  constructor(options = {}) {
    this.duration = options.duration || 260;
    this.groupDuration = options.groupDuration || 1100;
    this.joinDuration = options.joinDuration || 1250;
    this.settleDelay = options.settleDelay || 220;
    this.maxAnimatedRows = options.maxAnimatedRows || 18;
    this.maxJoinRows = options.maxJoinRows || 8;
    logger.debug("animation.lifecycle", "animation-engine:constructed", {
      duration: this.duration,
      groupDuration: this.groupDuration,
      joinDuration: this.joinDuration
    });
  }

  async animateRowsDiff({ host, buildFinalState, mode = "rows" }) {
    logger.debug("animation.transitions", "rows-diff:start", { mode });
    const previousRows = Array.from(host.querySelectorAll("tbody tr[data-row-key]"));

    buildFinalState();
    await this.nextFrame();

    const nextRows = Array.from(host.querySelectorAll("tbody tr[data-row-key]"));
    if (!nextRows.length) {
      logger.debug("animation.skipped", "rows-diff:skipped-no-next-rows");
      return;
    }

    const rowCount = Math.max(previousRows.length, nextRows.length, 1);
    const duration = this.getAdaptiveDuration(mode === "reorder" ? this.duration + 60 : this.duration, rowCount, 980);

    if (!previousRows.length) {
      logger.debug("animation.state", "rows-diff:first-render", { animatedRows: nextRows.slice(0, this.maxAnimatedRows).length });
      await this.fadeInRows(nextRows.slice(0, this.maxAnimatedRows), duration);
      await this.wait(this.settleDelay);
      return;
    }

    const hostRect = host.getBoundingClientRect();
    const previousSnapshots = previousRows.slice(0, this.maxAnimatedRows).map((row) => ({
      key: row.dataset.rowKey,
      rect: row.getBoundingClientRect(),
      html: row.innerHTML
    }));
    const nextSnapshots = new Map(
      nextRows.slice(0, this.maxAnimatedRows).map((row) => [row.dataset.rowKey, row])
    );

    const overlay = this.createOverlay(host);
    const animations = [];

    previousSnapshots.forEach((snapshot) => {
      const nextRow = nextSnapshots.get(snapshot.key);
      if (!nextRow) {
        const ghost = this.createGhostRow(snapshot, hostRect);
        overlay.appendChild(ghost);
        animations.push(this.animateElement(ghost, [
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" },
          { opacity: 0, transform: "translate3d(26px, -10px, 0) scale(0.97)" }
        ], { duration, easing: "ease" }));
        return;
      }

      const nextRect = nextRow.getBoundingClientRect();
      const deltaX = snapshot.rect.left - nextRect.left;
      const deltaY = snapshot.rect.top - nextRect.top;

      if (deltaX || deltaY) {
        animations.push(this.animateElement(nextRow, [
          { transform: `translate3d(${deltaX}px, ${deltaY}px, 0)` },
          { transform: "translate3d(0, 0, 0)" }
        ], {
          duration,
          easing: mode === "reorder" ? "cubic-bezier(0.22, 1, 0.36, 1)" : "ease"
        }));
      }
    });

    nextRows.slice(0, this.maxAnimatedRows).forEach((row) => {
      if (!previousSnapshots.find((item) => item.key === row.dataset.rowKey)) {
        animations.push(this.animateElement(row, [
          { opacity: 0, transform: "translate3d(0, 16px, 0) scale(0.98)" },
          { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
        ], { duration, easing: "ease-out" }));
      }
    });

    await this.waitForAnimations(animations, duration);
    overlay.remove();
    await this.wait(this.settleDelay);
    logger.debug("animation.transitions", "rows-diff:end", { animationCount: animations.length });
  }

  async animateGrouping({ host, previousDataset, groupedData, buildFinalState, getRowLabel }) {
    const sampleRows = previousDataset.slice(0, this.maxAnimatedRows);
    const sampleGroups = groupedData.slice(0, Math.min(8, groupedData.length));

    if (!sampleRows.length || !sampleGroups.length) {
      logger.debug("animation.skipped", "grouping:skipped-insufficient-data", { sampleRows: sampleRows.length, sampleGroups: sampleGroups.length });
      buildFinalState();
      return;
    }

    host.innerHTML = "";
    const stage = document.createElement("section");
    stage.className = "grouping-stage";
    stage.style.setProperty("--group-columns", String(Math.max(1, Math.min(sampleGroups.length, 4))));
    stage.innerHTML = `
      <div class="viz-header">
        <p class="viz-eyebrow">Grouping Rows</p>
        <h3>Rows move into buckets</h3>
        <p class="viz-copy">Buckets expand based on the number of groups and rows in this step.</p>
      </div>
      <div class="grouping-source"></div>
      <div class="grouping-buckets"></div>
      <div class="viz-floating-layer"></div>
    `;

    const source = stage.querySelector(".grouping-source");
    const buckets = stage.querySelector(".grouping-buckets");
    const layer = stage.querySelector(".viz-floating-layer");

    const tokenTemplates = [];
    sampleRows.forEach((row) => {
      const token = document.createElement("div");
      token.className = "group-token-source";
      token.textContent = getRowLabel(row);
      source.appendChild(token);
      tokenTemplates.push({ row, token });
    });

    const placeholderMap = new Map();
    sampleGroups.forEach((group) => {
      const bucket = document.createElement("article");
      bucket.className = "group-bucket";
      bucket.innerHTML = `
        <header>
          <strong>${group.groupKey}</strong>
          <span>${group.count} rows</span>
        </header>
        <div class="group-bucket-body"></div>
      `;

      const bucketBody = bucket.querySelector(".group-bucket-body");
      const previewRows = group.rows.slice(0, this.maxAnimatedRows);
      previewRows.forEach((row) => {
        const placeholder = document.createElement("div");
        placeholder.className = "group-token group-token-placeholder";
        placeholder.dataset.groupKey = group.groupKey;
        placeholder.dataset.rowKey = this.stableKey(row);
        placeholder.textContent = getRowLabel(row);
        bucketBody.appendChild(placeholder);
        placeholderMap.set(`${group.groupKey}::${this.stableKey(row)}`, placeholder);
      });

      buckets.appendChild(bucket);
    });

    host.appendChild(stage);
    await this.nextFrame();

    const stageRect = stage.getBoundingClientRect();
    const duration = this.getAdaptiveDuration(this.groupDuration, sampleRows.length + sampleGroups.length, 1500);
    const animations = [];

    tokenTemplates.forEach(({ row, token }, index) => {
      const tokenRect = token.getBoundingClientRect();
      const groupIndex = this.findGroupIndex(row, sampleGroups);
      const group = sampleGroups[Math.max(groupIndex, 0)] || sampleGroups[0];
      const placeholder = placeholderMap.get(`${group.groupKey}::${this.stableKey(row)}`);

      if (!placeholder) {
        return;
      }

      const placeholderRect = placeholder.getBoundingClientRect();
      const floating = document.createElement("div");
      floating.className = "group-token group-token-float";
      floating.textContent = token.textContent;
      floating.style.width = `${Math.max(tokenRect.width, placeholderRect.width)}px`;
      floating.style.left = `${tokenRect.left - stageRect.left}px`;
      floating.style.top = `${tokenRect.top - stageRect.top}px`;
      layer.appendChild(floating);
      token.classList.add("is-dimmed");
      placeholder.classList.add("is-target");

      const deltaX = placeholderRect.left - tokenRect.left;
      const deltaY = placeholderRect.top - tokenRect.top;
      animations.push(this.animateElement(floating, [
        { opacity: 0.98, transform: "translate3d(0, 0, 0) scale(1)" },
        { opacity: 1, transform: `translate3d(${deltaX}px, ${deltaY}px, 0) scale(0.98)` }
      ], {
        duration,
        delay: index * 70,
        easing: "cubic-bezier(0.22, 1, 0.36, 1)"
      }));
    });

    await this.waitForAnimations(animations, duration + sampleRows.length * 70);
    await this.wait(this.settleDelay + 120);
    buildFinalState();
    logger.debug("animation.transitions", "grouping:end", { animationCount: animations.length });
  }

  async animateJoin({ host, leftDataset, rightDataset, joinMeta, resultDataset, buildFinalState, summarizeRow }) {
    const leftRows = leftDataset.slice(0, this.maxJoinRows);
    const rightRows = rightDataset.slice(0, this.maxJoinRows);
    const resultRows = resultDataset.slice(0, this.maxJoinRows);

    if (!leftRows.length || !rightRows.length || !resultRows.length) {
      logger.debug("animation.skipped", "join:skipped-insufficient-data", {
        leftRows: leftRows.length,
        rightRows: rightRows.length,
        resultRows: resultRows.length
      });
      buildFinalState();
      return;
    }

    const pairMeta = this.buildJoinPairMeta({ leftRows, rightRows, joinMeta, resultRows });
    const duration = this.getAdaptiveDuration(this.joinDuration, resultRows.length + leftRows.length + rightRows.length, 1700);

    host.innerHTML = "";
    const stage = document.createElement("section");
    stage.className = "join-stage";
    stage.style.setProperty("--join-row-count", String(resultRows.length));
    stage.innerHTML = `
      <div class="viz-header join-stage-header">
        <p class="viz-eyebrow">${joinMeta.mode || "INNER"} JOIN</p>
        <h3>Watch matching rows combine</h3>
        <p class="viz-copy">${joinMeta.condition?.raw || "Rows are matched using the join condition."}</p>
      </div>
      <div class="join-grid">
        <section class="join-pane">
          <div class="join-pane-title">Left Table</div>
          <div class="join-pane-body"></div>
        </section>
        <section class="join-merge">
          <div class="join-merge-title">Merge Flow</div>
          <div class="join-merge-list"></div>
        </section>
        <section class="join-pane">
          <div class="join-pane-title">Right Table</div>
          <div class="join-pane-body"></div>
        </section>
      </div>
    `;

    const [leftPane, mergePane, rightPane] = [
      stage.querySelectorAll(".join-pane-body")[0],
      stage.querySelector(".join-merge-list"),
      stage.querySelectorAll(".join-pane-body")[1]
    ];

    leftPane.appendChild(this.createJoinPreviewTable(leftRows, pairMeta.leftKeys, pairMeta.leftUnmatchedKeys));
    rightPane.appendChild(this.createJoinPreviewTable(rightRows, pairMeta.rightKeys, pairMeta.rightUnmatchedKeys));

    resultRows.forEach((row, index) => {
      const mergeRow = document.createElement("article");
      mergeRow.className = "join-merge-row";
      mergeRow.innerHTML = `
        <span class="join-pill">${summarizeRow(pairMeta.leftPreview[index] || row)}</span>
        <span class="join-link">${joinMeta.mode || "JOIN"}</span>
        <span class="join-pill join-pill-accent">${summarizeRow(pairMeta.rightPreview[index] || row)}</span>
      `;
      mergePane.appendChild(mergeRow);
    });

    host.appendChild(stage);
    await this.nextFrame();

    const highlightedRows = Array.from(stage.querySelectorAll("tbody tr.is-match, tbody tr.is-unmatched-keep"));
    const mergeRows = Array.from(stage.querySelectorAll(".join-merge-row"));
    const animations = [
      ...highlightedRows.map((row, index) => this.animateElement(row, [
        { boxShadow: "0 0 0 0 rgba(56, 189, 248, 0)", transform: "scale(1)" },
        { boxShadow: "0 0 0 10px rgba(56, 189, 248, 0.08)", transform: "scale(1.01)" },
        { boxShadow: "0 0 0 0 rgba(56, 189, 248, 0)", transform: "scale(1)" }
      ], { duration, delay: index * 90, easing: "ease-out" })),
      ...mergeRows.map((row, index) => this.animateElement(row, [
        { opacity: 0, transform: "translate3d(0, 20px, 0) scale(0.96)" },
        { opacity: 1, transform: "translate3d(0, 0, 0) scale(1)" }
      ], { duration, delay: index * 120, easing: "cubic-bezier(0.22, 1, 0.36, 1)" }))
    ];

    await this.waitForAnimations(animations, duration + resultRows.length * 120);
    await this.wait(this.settleDelay + 180);
    buildFinalState();
    logger.debug("animation.transitions", "join:end", { animationCount: animations.length, mode: joinMeta.mode || "INNER" });
  }

  buildJoinPairMeta({ leftRows, rightRows, joinMeta, resultRows }) {
    const mode = String(joinMeta.mode || "INNER").toUpperCase();
    const rightAlias = joinMeta.source?.alias || joinMeta.source?.table || "right";
    const leafClauses = getLeafClauses(joinMeta.condition);
    const clause = leafClauses[0] || {};
    const leftQualifier = clause.left?.qualifier === rightAlias ? clause.right?.qualifier : clause.left?.qualifier;
    const leftKeys = new Set();
    const rightKeys = new Set();
    const leftUnmatchedKeys = new Set();
    const rightUnmatchedKeys = new Set();
    const leftPreview = [];
    const rightPreview = [];

    resultRows.forEach((resultRow) => {
      const leftProjection = this.projectJoinSide(resultRow, leftRows[0], leftQualifier);
      const rightProjection = this.projectJoinSide(resultRow, rightRows[0], rightAlias);

      leftPreview.push(leftProjection);
      rightPreview.push(rightProjection);

      if (leftProjection) {
        const key = this.stableKey(leftProjection);
        leftKeys.add(key);
        if (mode === "LEFT" || mode === "FULL") {
          const hasRightValue = rightProjection && Object.values(rightProjection).some((value) => value !== null && value !== undefined);
          if (!hasRightValue) {
            leftUnmatchedKeys.add(key);
          }
        }
      }

      if (rightProjection) {
        const key = this.stableKey(rightProjection);
        rightKeys.add(key);
        if (mode === "RIGHT" || mode === "FULL") {
          const hasLeftValue = leftProjection && Object.values(leftProjection).some((value) => value !== null && value !== undefined);
          if (!hasLeftValue) {
            rightUnmatchedKeys.add(key);
          }
        }
      }
    });

    return { leftKeys, rightKeys, leftPreview, rightPreview, leftUnmatchedKeys, rightUnmatchedKeys };
  }

  projectJoinSide(resultRow, referenceRow, qualifier) {
    if (!referenceRow || !resultRow) {
      return null;
    }

    const projected = {};
    Object.keys(referenceRow).forEach((key) => {
      if (Object.prototype.hasOwnProperty.call(resultRow, key)) {
        projected[key] = resultRow[key];
      } else if (qualifier && Object.prototype.hasOwnProperty.call(resultRow, `${qualifier}.${key}`)) {
        projected[key] = resultRow[`${qualifier}.${key}`];
      }
    });

    return Object.keys(projected).length ? projected : null;
  }

  createJoinPreviewTable(rows, matchedKeys, unmatchedKeys = new Set()) {
    const table = document.createElement("table");
    table.className = "data-table data-table-preview";

    const headers = Object.keys(rows[0] || {});
    const thead = document.createElement("thead");
    const tbody = document.createElement("tbody");
    const headerRow = document.createElement("tr");

    headers.forEach((header) => {
      const th = document.createElement("th");
      th.textContent = header;
      headerRow.appendChild(th);
    });

    thead.appendChild(headerRow);

    rows.forEach((row) => {
      const tr = document.createElement("tr");
      const key = this.stableKey(row);
      if (matchedKeys.has(key)) {
        tr.classList.add("is-match");
      }
      if (unmatchedKeys.has(key)) {
        tr.classList.add("is-unmatched-keep");
      }

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

  findGroupIndex(row, groups) {
    return groups.findIndex((group) => Object.entries(group.groupValues || {}).every(([key, value]) => row[key] === value));
  }

  createOverlay(host) {
    const overlay = document.createElement("div");
    overlay.className = "table-animation-overlay";
    host.appendChild(overlay);
    return overlay;
  }

  createGhostRow(snapshot, hostRect) {
    const ghost = document.createElement("table");
    ghost.className = "data-table row-ghost-table";
    ghost.style.left = `${snapshot.rect.left - hostRect.left}px`;
    ghost.style.top = `${snapshot.rect.top - hostRect.top}px`;
    ghost.style.width = `${snapshot.rect.width}px`;

    const tbody = document.createElement("tbody");
    const tr = document.createElement("tr");
    tr.innerHTML = snapshot.html;
    tbody.appendChild(tr);
    ghost.appendChild(tbody);
    return ghost;
  }

  async fadeInRows(rows, duration) {
    const animations = rows.map((row, index) => this.animateElement(row, [
      { opacity: 0, transform: "translate3d(0, 12px, 0)" },
      { opacity: 1, transform: "translate3d(0, 0, 0)" }
    ], { duration, delay: index * 34, easing: "ease-out" }));

    await this.waitForAnimations(animations, duration + rows.length * 34);
  }

  animateElement(element, keyframes, options) {
    if (!element || typeof element.animate !== "function") {
      logger.debug("animation.skipped", "element-animation:unsupported");
      return null;
    }

    return element.animate(keyframes, {
      fill: "both",
      ...options
    });
  }

  getAdaptiveDuration(base, density, ceiling) {
    return Math.min(base + Math.max(0, density - 4) * 26, ceiling);
  }

  async waitForAnimations(animations, fallbackDuration) {
    const active = animations.filter(Boolean);
    if (!active.length) {
      logger.debug("animation.skipped", "wait-for-animations:no-active", { fallbackDuration });
      await this.wait(fallbackDuration);
      return;
    }

    logger.debug("animation.timings", "wait-for-animations:active", { activeCount: active.length });
    await Promise.all(active.map((animation) => animation.finished.catch(() => undefined)));
  }

  async nextFrame() {
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  }

  async wait(duration) {
    await new Promise((resolve) => window.setTimeout(resolve, duration));
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
}
