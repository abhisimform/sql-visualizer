import { QueryParser } from "../parser/query-parser.js";
import { createLogger } from "../../services/dev-logger.js";

const logger = createLogger("Engine");

export class QueryEngine {
  constructor(sourceData) {
    this.sourceData = sourceData;
    this.lastError = null;
    this.queryContext = "";
    this.parser = new QueryParser();
    logger.debug("engine.startEnd", "engine:constructed", { tableCount: Object.keys(sourceData || {}).length });
  }

  setQueryContext(query) {
    this.queryContext = query || "";
    logger.debug("engine.startEnd", "query-context:set", { query: this.queryContext });
  }

  clearError() {
    this.lastError = null;
  }

  getError() {
    return this.lastError;
  }

  setError(error) {
    if (!this.lastError) {
      this.lastError = error;
      logger.error("engine.errors", "engine:error-set", { error });
    }
  }

  createError(type, message, token = "", suggestion = "") {
    const index = token ? this.queryContext.toLowerCase().indexOf(String(token).toLowerCase()) : -1;
    const safeIndex = index === -1 ? 0 : index;
    const lines = this.queryContext.slice(0, safeIndex).split("\n");

    return {
      type,
      message,
      location: {
        line: lines.length,
        column: lines.at(-1).length + 1
      },
      suggestion
    };
  }

  expandExecutionSteps(steps) {
    logger.debug("engine.steps", "execution-steps:expand-start", { stepTypes: steps.map((step) => step.type) });
    const fromIndex = steps.findIndex((step) => step.type === "FROM");
    if (fromIndex === -1) {
      return this.resolveHavingAliases(steps);
    }

    const fromStep = steps[fromIndex];
    const sources = this.parseFromSources(fromStep.value?.raw || fromStep.value?.table || "");
    if (!sources.length) {
      return steps;
    }

    const expandedSteps = [...steps];
    expandedSteps[fromIndex] = { type: "FROM", value: sources[0].source };

    const joinSteps = sources.slice(1).map((source) => ({
      type: "JOIN",
      value: source
    }));

    expandedSteps.splice(fromIndex + 1, 0, ...joinSteps);
    logger.debug("engine.steps", "execution-steps:expand-end", { stepTypes: expandedSteps.map((step) => step.type) });
    return this.resolveHavingAliases(expandedSteps);
  }

  parseFromSources(rawFrom) {
    const normalized = String(rawFrom || "").trim();
    if (!normalized) {
      return [];
    }

    if (/\bJOIN\b/i.test(normalized)) {
      return this.parseJoinSources(normalized);
    }

    return this.splitTopLevel(normalized, ",").map((part, index) => ({
      source: this.parseSourceSpec(part),
      mode: index === 0 ? "BASE" : "CROSS",
      condition: null,
      raw: part.trim()
    }));
  }

  parseJoinSources(rawFrom) {
    const sources = [];
    const firstJoinToken = this.findJoinToken(rawFrom);

    if (!firstJoinToken) {
      return [{ source: this.parseSourceSpec(rawFrom), mode: "BASE", condition: null, raw: rawFrom.trim() }];
    }

    const basePart = rawFrom.slice(0, firstJoinToken.index).trim();
    sources.push({ source: this.parseSourceSpec(basePart), mode: "BASE", condition: null, raw: basePart });

    let cursor = firstJoinToken.index;
    while (cursor < rawFrom.length) {
      const joinToken = this.findJoinToken(rawFrom, cursor);
      if (!joinToken) {
        break;
      }

      const segmentStart = joinToken.index + joinToken.length;
      const nextJoinToken = this.findJoinToken(rawFrom, segmentStart);
      const segment = rawFrom.slice(segmentStart, nextJoinToken ? nextJoinToken.index : rawFrom.length).trim();
      const onIndex = joinToken.requiresCondition ? segment.toUpperCase().indexOf(" ON ") : -1;
      const sourcePart = onIndex === -1 ? segment : segment.slice(0, onIndex).trim();
      const conditionPart = onIndex === -1 ? "" : segment.slice(onIndex + 4).trim();

      sources.push({
        source: this.parseSourceSpec(sourcePart),
        mode: joinToken.mode,
        condition: conditionPart ? this.parser.parseCondition(conditionPart) : null,
        raw: `${joinToken.token} ${segment}`.trim(),
        invalidCondition: joinToken.requiresCondition && !conditionPart
      });

      if (!nextJoinToken) {
        break;
      }

      cursor = nextJoinToken.index;
    }

    return sources;
  }

  parseSourceSpec(expression) {
    const trimmed = expression.trim();
    const derived = this.parseDerivedSource(trimmed);
    if (derived) {
      return derived;
    }

    const match = trimmed.match(/^([a-zA-Z_][\w]*)(?:\s+(?:AS\s+)?([a-zA-Z_][\w]*))?$/i);
    const table = match ? match[1].toLowerCase() : trimmed.toLowerCase();
    const alias = match && match[2] ? match[2].toLowerCase() : table;

    return {
      raw: trimmed,
      table,
      alias
    };
  }

  parseDerivedSource(expression) {
    if (!expression.startsWith("(")) {
      return null;
    }

    const closingIndex = this.findMatchingParenthesis(expression, 0);
    if (closingIndex === -1) {
      return null;
    }

    const inner = expression.slice(1, closingIndex).trim();
    const remainder = expression.slice(closingIndex + 1).trim();
    const aliasMatch = remainder.match(/^(?:AS\s+)?([a-zA-Z_][\w]*)$/i);
    if (!/^SELECT\s+/i.test(inner) || !aliasMatch) {
      return null;
    }

    const alias = aliasMatch[1].toLowerCase();

    return {
      raw: expression,
      table: alias,
      alias,
      subquery: this.parser.parse(inner)
    };
  }

  splitTopLevel(value, separator) {
    const parts = [];
    let depth = 0;
    let current = "";

    for (let index = 0; index < value.length; index += 1) {
      const char = value[index];

      if (char === "(") {
        depth += 1;
      } else if (char === ")") {
        depth = Math.max(0, depth - 1);
      }

      if (char === separator && depth === 0) {
        if (current.trim()) {
          parts.push(current.trim());
        }
        current = "";
        continue;
      }

      current += char;
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  findKeyword(query, keyword, startIndex = 0) {
    return query.toUpperCase().indexOf(keyword.toUpperCase(), startIndex);
  }

  findJoinToken(query, startIndex = 0) {
    const tokens = [
      { token: "LEFT OUTER JOIN", mode: "LEFT", requiresCondition: true },
      { token: "RIGHT OUTER JOIN", mode: "RIGHT", requiresCondition: true },
      { token: "FULL OUTER JOIN", mode: "FULL", requiresCondition: true },
      { token: "LEFT JOIN", mode: "LEFT", requiresCondition: true },
      { token: "RIGHT JOIN", mode: "RIGHT", requiresCondition: true },
      { token: "FULL JOIN", mode: "FULL", requiresCondition: true },
      { token: "INNER JOIN", mode: "INNER", requiresCondition: true },
      { token: "CROSS JOIN", mode: "CROSS", requiresCondition: false },
      { token: "JOIN", mode: "INNER", requiresCondition: true }
    ];

    const upperQuery = query.toUpperCase();
    let depth = 0;

    for (let index = startIndex; index <= upperQuery.length - 4; index += 1) {
      const char = upperQuery[index];

      if (char === "(") {
        depth += 1;
        continue;
      }

      if (char === ")") {
        depth = Math.max(0, depth - 1);
        continue;
      }

      if (depth !== 0) {
        continue;
      }

      for (const token of tokens) {
        if (upperQuery.slice(index, index + token.token.length) !== token.token) {
          continue;
        }

        const before = index === 0 ? " " : upperQuery[index - 1];
        const after = upperQuery[index + token.token.length] || " ";
        if (!/\s/.test(before) || !/\s|$/.test(after)) {
          continue;
        }

        return { ...token, index, length: token.token.length };
      }
    }

    return null;
  }

  findMatchingParenthesis(expression, startIndex) {
    let depth = 0;

    for (let index = startIndex; index < expression.length; index += 1) {
      const char = expression[index];

      if (char === "(") {
        depth += 1;
      } else if (char === ")") {
        depth -= 1;
      }

      if (depth === 0) {
        return index;
      }
    }

    return -1;
  }

  resolveHavingAliases(steps) {
    const havingStep = steps.find((step) => step.type === "HAVING");
    const selectStep = steps.find((step) => step.type === "SELECT");
    if (!havingStep || !selectStep) {
      return steps;
    }

    const aliasMap = new Map(
      selectStep.value
        .filter((expression) => expression.alias)
        .map((expression) => [expression.alias.toLowerCase(), expression])
    );

    if (!aliasMap.size) {
      return steps;
    }

    return steps.map((step) => {
      if (step !== havingStep) {
        return step;
      }

      return {
        ...step,
        value: {
          ...step.value,
          clauses: step.value.clauses.map((clause) => ({
            ...clause,
            left: this.replaceAliasReference(clause.left, aliasMap),
            right: this.replaceAliasReference(clause.right, aliasMap)
          }))
        }
      };
    });
  }

  replaceAliasReference(expression, aliasMap) {
    if (!expression) {
      return expression;
    }

    if (expression.kind === "column" && !expression.qualifier && aliasMap.has(expression.name)) {
      return this.cloneExpression(aliasMap.get(expression.name), { keepAlias: false });
    }

    if (expression.kind === "binary") {
      return {
        ...expression,
        left: this.replaceAliasReference(expression.left, aliasMap),
        right: this.replaceAliasReference(expression.right, aliasMap)
      };
    }

    if (expression.kind === "aggregate") {
      return {
        ...expression,
        argument: this.replaceAliasReference(expression.argument, aliasMap)
      };
    }

    if (expression.kind === "list") {
      return {
        ...expression,
        values: expression.values.map((value) => this.replaceAliasReference(value, aliasMap))
      };
    }

    return expression;
  }

  cloneExpression(expression, options = {}) {
    if (!expression || typeof expression !== "object") {
      return expression;
    }

    const clone = Array.isArray(expression)
      ? expression.map((item) => this.cloneExpression(item, options))
      : Object.entries(expression).reduce((accumulator, [key, value]) => {
          if (!options.keepAlias && key === "alias") {
            return accumulator;
          }

          accumulator[key] = this.cloneExpression(value, options);
          return accumulator;
        }, {});

    return clone;
  }

  executeStep(dataset, step, scopes = []) {
    if (this.lastError) {
      return dataset;
    }

    logger.debug("engine.steps", "step:execute-start", {
      type: step.type,
      inputRows: Array.isArray(dataset) ? dataset.length : 0,
      scopeDepth: scopes.length
    });

    try {
      let result;

      switch (step.type) {
        case "FROM":
          result = this.getSourceRows(step.value);
          break;
        case "JOIN":
          result = this.joinRows(dataset, step.value);
          break;
        case "WHERE":
          result = dataset.filter((row) => this.matchesCondition(row, step.value, [row, ...scopes]));
          break;
        case "GROUP BY":
          result = this.groupRows(dataset, step.value, scopes);
          break;
        case "HAVING":
          result = dataset.filter((group) => this.matchesCondition(group, step.value, [group, ...scopes]));
          break;
        case "SELECT":
          result = this.selectColumns(dataset, step.value, scopes);
          break;
        case "DISTINCT":
          result = this.distinctRows(dataset);
          break;
        case "ORDER_BY":
          result = this.orderRows(dataset, step.value);
          break;
        case "OFFSET":
          result = dataset.slice(step.value);
          break;
        case "LIMIT":
          result = dataset.slice(0, step.value);
          break;
        default:
          result = dataset;
          break;
      }

      logger.debug("engine.rowCounts", "step:execute-end", {
        type: step.type,
        outputRows: Array.isArray(result) ? result.length : 0
      });
      if (Array.isArray(result) && result.length && step.type !== "JOIN") {
        logger.debug("engine.snapshots", "step:snapshot", { type: step.type, sample: result.slice(0, 2) });
      }

      return result;
    } catch (error) {
      this.setError(this.createError(
        "ExecutionError",
        "The query could not be executed safely",
        step.type,
        "Check the current step for unsupported or malformed values"
      ));
      return [];
    }
  }

  executeQuery(steps, scopes = []) {
    let dataset = [];
    this.clearError();
    logger.debug("engine.startEnd", "query:execute-start", { stepTypes: steps.map((step) => step.type), scopeDepth: scopes.length });

    steps.forEach((step) => {
      if (this.lastError) {
        return;
      }
      dataset = this.executeStep(dataset, step, scopes);
    });

    logger.debug("engine.startEnd", "query:execute-end", { rowCount: dataset.length, error: this.lastError });
    return dataset;
  }

  getSourceRows(fromClause) {
    if (fromClause?.subquery) {
      return this.executeDerivedSource(fromClause);
    }

    const tableName = (fromClause?.table || fromClause || "").toString().trim().replace(/;$/, "").toLowerCase();
    const alias = (fromClause?.alias || tableName || "data").toLowerCase();
    const resolvedTableName = tableName || "employee_data";
    const dataset = this.resolveTableRows(resolvedTableName);
    logger.debug("engine.tableAccess", "table:load", { requested: tableName, resolvedTableName, alias });

    if (!dataset) {
      this.setError(this.createError(
        "SemanticError",
        `Table '${resolvedTableName.toUpperCase()}' does not exist`,
        resolvedTableName,
        "Use one of the available tables from the database schema"
      ));
      return [];
    }

    return dataset.map((row) => this.createScopedRow(row, resolvedTableName, alias));
  }

  executeDerivedSource(sourceSpec) {
    const alias = (sourceSpec?.alias || sourceSpec?.table || "derived").toLowerCase();
    const result = this.executeQuery(this.expandExecutionSteps(sourceSpec.subquery));
    if (this.lastError) {
      return [];
    }

    return result.map((row) => this.createScopedRow(row, alias, alias));
  }

  resolveTableRows(tableName) {
    const normalizedName = String(tableName || "").toLowerCase();
    const exactKey = Object.keys(this.sourceData || {}).find((key) => key.toLowerCase() === normalizedName);
    logger.debug("data.tableAccess", "table:resolve", { requested: tableName, resolved: exactKey || null });
    if (!exactKey) {
      logger.warn("data.missing", "table:missing", { tableName });
    }
    return exactKey ? this.sourceData[exactKey] : null;
  }

  createScopedRow(row, tableName, alias) {
    const scopedRow = { ...row };
    const bindings = {
      [alias]: scopedRow,
      [tableName]: scopedRow
    };

    this.attachMeta(scopedRow, {
      bindings,
      displayBindings: {
        [alias]: scopedRow
      }
    });

    return scopedRow;
  }

  joinRows(leftRows, joinStep) {
    logger.debug("engine.joins", "join:start", {
      mode: joinStep.mode,
      leftRows: leftRows.length,
      source: joinStep.source?.table,
      alias: joinStep.source?.alias
    });
    const rightRows = this.getSourceRows(joinStep.source);
    if (this.lastError) {
      return [];
    }

    const joinMode = joinStep.mode || "INNER";
    const requiresCondition = joinMode !== "CROSS";
    if (requiresCondition && (!joinStep.condition || joinStep.invalidCondition)) {
      this.setError(this.createError(
        "LogicalError",
        "Invalid JOIN condition",
        joinStep.raw,
        "Use JOIN ... ON left_column = right_column"
      ));
      return [];
    }

    if (joinMode === "CROSS") {
      const crossJoined = this.buildCrossJoin(leftRows, rightRows);
      logger.debug("engine.joins", "join:cross-complete", { outputRows: crossJoined.length });
      return crossJoined;
    }

    const joined = [];
    const matchedRight = new Array(rightRows.length).fill(false);
    const nullRightRow = rightRows.length ? this.createNullRowLike(rightRows[0]) : this.createNullRowForSource(joinStep.source);
    const nullLeftRow = leftRows.length ? this.createNullRowLike(leftRows[0]) : {};

    leftRows.forEach((leftRow) => {
      let matchedLeft = false;

      rightRows.forEach((rightRow, rightIndex) => {
        const mergedRow = this.mergeRows(leftRow, rightRow);
        if (!this.matchesCondition(mergedRow, joinStep.condition, [mergedRow])) {
          return;
        }

        matchedLeft = true;
        matchedRight[rightIndex] = true;
        joined.push(mergedRow);
      });

      if ((joinMode === "LEFT" || joinMode === "FULL") && !matchedLeft) {
        joined.push(this.mergeRows(leftRow, nullRightRow));
      }
    });

    if (joinMode === "RIGHT" || joinMode === "FULL") {
      rightRows.forEach((rightRow, rightIndex) => {
        if (matchedRight[rightIndex]) {
          return;
        }

        joined.push(this.mergeRows(nullLeftRow, rightRow));
      });
    }

    logger.debug("engine.joins", "join:end", { mode: joinMode, outputRows: joined.length });
    return joined;
  }

  buildCrossJoin(leftRows, rightRows) {
    const joined = [];

    leftRows.forEach((leftRow) => {
      rightRows.forEach((rightRow) => {
        joined.push(this.mergeRows(leftRow, rightRow));
      });
    });

    return joined;
  }

  createNullRowLike(templateRow) {
    const meta = this.getMeta(templateRow);
    if (!meta) {
      return {};
    }

    const rowMap = new Map();
    const cloneNullRow = (boundRow) => {
      if (!rowMap.has(boundRow)) {
        const clone = {};
        Object.keys(boundRow || {}).forEach((column) => {
          if (!column.includes(".")) {
            clone[column] = null;
          }
        });
        rowMap.set(boundRow, clone);
      }
      return rowMap.get(boundRow);
    };

    const bindings = Object.entries(meta.bindings || {}).reduce((accumulator, [key, value]) => {
      accumulator[key] = cloneNullRow(value);
      return accumulator;
    }, {});

    const displayBindings = Object.entries(meta.displayBindings || {}).reduce((accumulator, [key, value]) => {
      accumulator[key] = cloneNullRow(value);
      return accumulator;
    }, {});

    const scopedRow = {};
    Object.entries(displayBindings).forEach(([alias, row]) => {
      Object.keys(row).forEach((column) => {
        scopedRow[`${alias}.${column}`] = null;
      });
    });

    this.attachMeta(scopedRow, { bindings, displayBindings });
    return scopedRow;
  }

  createNullRowForSource(sourceSpec) {
    const resolvedTableName = (sourceSpec?.table || "").toLowerCase();
    const sampleRow = this.resolveTableRows(resolvedTableName)?.[0] || {};
    const nullRow = Object.keys(sampleRow).reduce((accumulator, key) => {
      accumulator[key] = null;
      return accumulator;
    }, {});

    return this.createScopedRow(nullRow, resolvedTableName, (sourceSpec?.alias || resolvedTableName || "data").toLowerCase());
  }

  mergeRows(leftRow, rightRow) {
    const leftMeta = this.getMeta(leftRow);
    const rightMeta = this.getMeta(rightRow);
    const mergedRow = {};
    const displayBindings = {
      ...(leftMeta?.displayBindings || {}),
      ...(rightMeta?.displayBindings || {})
    };
    const bindings = {
      ...(leftMeta?.bindings || {}),
      ...(rightMeta?.bindings || {})
    };

    Object.entries(displayBindings).forEach(([alias, row]) => {
      Object.keys(row).forEach((column) => {
        if (column.includes(".")) {
          return;
        }
        mergedRow[`${alias}.${column}`] = row[column];
      });
    });

    this.attachMeta(mergedRow, { bindings, displayBindings });
    return mergedRow;
  }

  cloneRow(row) {
    const cloned = { ...row };
    const meta = this.getMeta(row);
    if (!meta) {
      return cloned;
    }

    const rowMap = new Map();
    const cloneBoundRow = (boundRow) => {
      if (!rowMap.has(boundRow)) {
        rowMap.set(boundRow, { ...boundRow });
      }
      return rowMap.get(boundRow);
    };

    const bindings = Object.entries(meta.bindings || {}).reduce((accumulator, [key, value]) => {
      accumulator[key] = cloneBoundRow(value);
      return accumulator;
    }, {});

    const displayBindings = Object.entries(meta.displayBindings || {}).reduce((accumulator, [key, value]) => {
      accumulator[key] = cloneBoundRow(value);
      return accumulator;
    }, {});

    this.attachMeta(cloned, { bindings, displayBindings });
    return cloned;
  }

  attachMeta(target, meta) {
    Object.defineProperty(target, "__sqlMeta", {
      value: meta,
      enumerable: false,
      configurable: true,
      writable: true
    });
  }

  getMeta(target) {
    return target && target.__sqlMeta ? target.__sqlMeta : null;
  }

  groupRows(rows, expressions, scopes) {
    logger.debug("engine.grouping", "group-by:start", { inputRows: rows.length, expressionCount: expressions.length });
    const groups = new Map();

    rows.forEach((row) => {
      const rowScopes = [row, ...scopes];
      const keyValues = expressions.map((expression) => this.resolveExpression(row, expression, rowScopes));
      const key = JSON.stringify(keyValues);
      const bucket = groups.get(key) || { keyValues, rows: [] };
      bucket.rows.push(this.cloneRow(row));
      groups.set(key, bucket);
    });

    const groupedResults = Array.from(groups.values()).map((group) => {
      const groupValues = {};
      expressions.forEach((expression, index) => {
        const label = this.getExpressionLabel(expression);
        groupValues[label] = group.keyValues[index];
      });

      const grouped = {
        groupKey: group.keyValues.join(" | "),
        groupColumns: expressions,
        groupValues,
        count: group.rows.length,
        rows: group.rows
      };

      const firstMeta = this.getMeta(group.rows[0]);
      if (firstMeta) {
        this.attachMeta(grouped, firstMeta);
      }

      return grouped;
    });

    logger.debug("engine.grouping", "group-by:end", { groupCount: groupedResults.length });
    return groupedResults;
  }

  selectColumns(dataset, columns, scopes) {
    logger.debug("engine.projection", "select:start", { inputRows: dataset.length, columnCount: columns.length });
    if (!dataset.length) {
      return [];
    }

    if (this.isSelectAll(columns)) {
      const result = dataset.map((row) => this.expandSelectAll(row));
      logger.debug("engine.projection", "select:all", { outputRows: result.length });
      return result;
    }

    if (this.isGrouped(dataset)) {
      const result = dataset.map((group) => this.buildSelectedRow(group, columns, scopes));
      logger.debug("engine.projection", "select:grouped", { outputRows: result.length });
      return result;
    }

    if (columns.some((column) => this.containsAggregate(column))) {
      const result = [this.buildSelectedRow(dataset, columns, scopes)];
      logger.debug("engine.projection", "select:aggregate-only", { outputRows: result.length });
      return result;
    }

    const result = dataset.map((row) => this.buildSelectedRow(row, columns, scopes));
    logger.debug("engine.projection", "select:end", { outputRows: result.length });
    return result;
  }

  distinctRows(dataset) {
    const seen = new Set();

    return dataset.filter((row) => {
      const key = this.stableValue(row);
      if (seen.has(key)) {
        return false;
      }

      seen.add(key);
      return true;
    });
  }

  isSelectAll(columns) {
    return columns.length === 1 && columns[0].kind === "literal" && columns[0].value === "*";
  }

  expandSelectAll(row) {
    const meta = this.getMeta(row);
    if (!meta?.displayBindings || Object.keys(meta.displayBindings).length <= 1) {
      return { ...row };
    }

    return Object.keys(row).reduce((accumulator, key) => {
      accumulator[key] = row[key];
      return accumulator;
    }, {});
  }

  buildSelectedRow(source, columns, scopes) {
    const selected = {};
    const representativeRow = this.pickRepresentativeRow(source, columns);
    const activeScopes = representativeRow && representativeRow !== source ? [representativeRow, source, ...scopes] : [source, ...scopes];

    columns.forEach((column) => {
      selected[column.alias] = this.resolveExpression(source, column, activeScopes, representativeRow);
    });

    return selected;
  }

  pickRepresentativeRow(source, columns) {
    if (!this.isGroup(source)) {
      return Array.isArray(source) ? source[0] : source;
    }

    const aggregate = columns
      .map((column) => this.findRepresentativeAggregate(column))
      .find(Boolean);

    if (!aggregate || aggregate.argument.kind !== "column") {
      return source.rows[0];
    }

    const argumentName = aggregate.argument.name;
    const sortedRows = [...source.rows].sort((left, right) => {
      const leftValue = this.resolveColumnValue(left, aggregate.argument, [left]);
      const rightValue = this.resolveColumnValue(right, aggregate.argument, [right]);
      return aggregate.fn === "MAX" ? rightValue - leftValue : leftValue - rightValue;
    });

    return sortedRows[0] || source.rows[0];
  }

  findRepresentativeAggregate(expression) {
    if (!expression) {
      return null;
    }

    if (expression.kind === "aggregate" && ["MAX", "MIN"].includes(expression.fn)) {
      return expression;
    }

    if (expression.kind === "binary") {
      return this.findRepresentativeAggregate(expression.left) || this.findRepresentativeAggregate(expression.right);
    }

    return null;
  }

  resolveExpression(source, expression, scopes, representativeRow = null) {
    switch (expression.kind) {
      case "column":
        return this.resolveColumnValue(source, expression, scopes, representativeRow);
      case "literal":
        return expression.value;
      case "aggregate":
        return this.calculateAggregate(source, expression, scopes);
      case "binary":
        return this.applyBinaryOperator(
          expression.operator,
          this.resolveExpression(source, expression.left, scopes, representativeRow),
          this.resolveExpression(source, expression.right, scopes, representativeRow)
        );
      case "subquery":
        return this.resolveSubquery(expression, scopes, false);
      case "list":
        return expression.values.map((value) => this.resolveExpression(source, value, scopes, representativeRow));
      case "star":
        return "*";
      default:
        return undefined;
    }
  }

  resolveColumnValue(source, expression, scopes, representativeRow) {
    if (expression.name === "group" || expression.name === "groupkey") {
      return this.isGroup(source) ? source.groupKey : undefined;
    }

    if (this.isGroup(source)) {
      const label = this.getExpressionLabel(expression);
      if (!expression.qualifier && label in source.groupValues) {
        return source.groupValues[label];
      }
    }

    const candidates = representativeRow && representativeRow !== source ? [representativeRow, ...scopes] : scopes;

    for (const scope of candidates) {
      if (!scope) {
        continue;
      }

      if (this.isGroup(scope) && !expression.qualifier) {
        const label = this.getExpressionLabel(expression);
        if (label in scope.groupValues) {
          return scope.groupValues[label];
        }
      }

      const meta = this.getMeta(scope);
      if (expression.qualifier) {
        if (meta?.bindings?.[expression.qualifier]) {
          return meta.bindings[expression.qualifier][expression.name];
        }
        continue;
      }

      if (expression.name in scope) {
        return scope[expression.name];
      }

      if (meta?.displayBindings) {
        const matches = Object.values(meta.displayBindings).filter((row) => expression.name in row);
        const uniqueMatches = Array.from(new Set(matches));

        if (uniqueMatches.length === 1) {
          return uniqueMatches[0][expression.name];
        }

        if (uniqueMatches.length > 1) {
          this.setError(this.createError(
            "SemanticError",
            `Column '${expression.name}' is ambiguous`,
            expression.name,
            "Prefix the column with a table alias"
          ));
          return undefined;
        }
      }
    }

    if (expression.qualifier) {
      this.setError(this.createError(
        "SemanticError",
        `Alias '${expression.qualifier}' not found`,
        expression.qualifier,
        "Use a valid table alias from the FROM or JOIN clause"
      ));
    }

    return undefined;
  }

  calculateAggregate(source, expression, scopes) {
    const rows = this.getRowsFromSource(source);
    logger.debug("engine.aggregates", "aggregate:start", { fn: expression.fn, rowCount: rows.length });

    switch (expression.fn) {
      case "COUNT":
        if (expression.argument.kind === "star") {
          return rows.length;
        }
        return rows.filter((row) => this.resolveExpression(row, expression.argument, [row, ...scopes]) !== undefined).length;
      case "SUM":
        return rows.reduce((total, row) => total + (Number(this.resolveExpression(row, expression.argument, [row, ...scopes])) || 0), 0);
      case "AVG":
        return rows.length ? this.calculateAggregate(source, { ...expression, fn: "SUM" }, scopes) / rows.length : 0;
      case "MAX":
        return rows.reduce((max, row) => {
          const value = this.resolveExpression(row, expression.argument, [row, ...scopes]);
          return max === undefined || value > max ? value : max;
        }, undefined);
      case "MIN":
        return rows.reduce((min, row) => {
          const value = this.resolveExpression(row, expression.argument, [row, ...scopes]);
          return min === undefined || value < min ? value : min;
        }, undefined);
      default:
        return undefined;
    }
  }

  resolveSubquery(expression, scopes, asSet) {
    logger.debug("engine.subqueries", "subquery:execute-start", { asSet, raw: expression.raw, scopeDepth: scopes.length });
    const result = this.executeQuery(this.expandExecutionSteps(expression.query), scopes);
    if (this.lastError) {
      return asSet ? [] : undefined;
    }

    if (!result.length) {
      return asSet ? [] : undefined;
    }

    if (asSet) {
      logger.debug("engine.subqueries", "subquery:execute-end-set", { rowCount: result.length });
      return result.map((row) => row[Object.keys(row)[0]]);
    }

    if (result.length > 1) {
      this.setError(this.createError(
        "LogicalError",
        "Subquery returned multiple rows when a single value was expected",
        expression.raw,
        "Ensure the subquery returns one row or use IN instead of a scalar comparison"
      ));
      return undefined;
    }

    const firstRow = result[0];
    logger.debug("engine.subqueries", "subquery:execute-end-scalar", { rowCount: result.length });
    return firstRow[Object.keys(firstRow)[0]];
  }

  applyBinaryOperator(operator, left, right) {
    switch (operator) {
      case "+":
        return (Number(left) || 0) + (Number(right) || 0);
      case "-":
        return (Number(left) || 0) - (Number(right) || 0);
      case "*":
        return (Number(left) || 0) * (Number(right) || 0);
      case "/":
        return right ? (Number(left) || 0) / Number(right) : 0;
      default:
        return undefined;
    }
  }

  orderRows(dataset, orderExpressions) {
    const orders = Array.isArray(orderExpressions) ? orderExpressions : [orderExpressions];
    const sorted = [...dataset];

    logger.debug("engine.sorting", "order-by:start", { inputRows: dataset.length, orderCount: orders.length });
    sorted.sort((left, right) => {
      for (const order of orders) {
        const directionMultiplier = order.direction === "DESC" ? -1 : 1;
        const leftValue = this.resolveOrderValue(left, order);
        const rightValue = this.resolveOrderValue(right, order);

        if (leftValue === rightValue) {
          continue;
        }

        if (typeof leftValue === "number" && typeof rightValue === "number") {
          return (leftValue - rightValue) * directionMultiplier;
        }

        return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
      }

      return 0;
    });

    logger.debug("engine.sorting", "order-by:end", { outputRows: sorted.length });
    return sorted;
  }

  resolveOrderValue(row, order) {
    if (order.alias && order.alias in row) {
      return row[order.alias];
    }

    const label = this.getExpressionLabel(order);
    if (label in row) {
      return row[label];
    }

    if (order.kind === "column") {
      return this.resolveColumnValue(row, order, [row]);
    }

    return undefined;
  }

  matchesCondition(source, condition, scopes) {
    if (!condition || !condition.clauses.length) {
      return true;
    }

    const results = condition.clauses.map((clause) => this.evaluateClause(source, clause, scopes));
    logger.debug("engine.filtering", "condition:evaluated", { raw: condition.raw, results, connectors: condition.connectors });

    return condition.connectors.reduce((accumulator, connector, index) => {
      const nextResult = results[index + 1];
      return connector === "AND" ? accumulator && nextResult : accumulator || nextResult;
    }, results[0]);
  }

  evaluateClause(source, clause, scopes) {
    if (clause.operator === "EXISTS" || clause.operator === "NOT EXISTS") {
      const exists = this.resolveExistsSubquery(clause.right, scopes);
      logger.debug("engine.filtering", "clause:exists", { operator: clause.operator, exists });
      return clause.operator === "EXISTS" ? exists : !exists;
    }

    const leftValue = this.resolveExpression(source, clause.left, scopes);

    if (clause.operator === "IN" || clause.operator === "NOT IN") {
      const rightValues = clause.right.kind === "subquery"
        ? this.resolveSubquery(clause.right, scopes, true)
        : this.resolveExpression(source, clause.right, scopes);
      const haystack = Array.isArray(rightValues) ? rightValues : [rightValues];
      const matched = haystack.some((value) => value == leftValue);
      logger.debug("engine.filtering", "clause:in", { operator: clause.operator, leftValue, haystackSize: haystack.length, matched });
      return clause.operator === "IN" ? matched : !matched;
    }

    if (clause.operator === "LIKE" || clause.operator === "NOT LIKE") {
      const rightValue = this.resolveExpression(source, clause.right, scopes);
      const matched = this.matchesLike(leftValue, rightValue);
      logger.debug("engine.filtering", "clause:like", { operator: clause.operator, leftValue, rightValue, matched });
      return clause.operator === "LIKE" ? matched : !matched;
    }

    if (clause.operator === "BETWEEN" || clause.operator === "NOT BETWEEN") {
      const rightValues = clause.right?.kind === "list"
        ? clause.right.values.map((value) => this.resolveExpression(source, value, scopes))
        : [undefined, undefined];
      const matched = leftValue >= rightValues[0] && leftValue <= rightValues[1];
      logger.debug("engine.filtering", "clause:between", { operator: clause.operator, leftValue, bounds: rightValues, matched });
      return clause.operator === "BETWEEN" ? matched : !matched;
    }

    if (clause.operator === "IS NULL") {
      return leftValue === null || leftValue === undefined;
    }

    if (clause.operator === "IS NOT NULL") {
      return leftValue !== null && leftValue !== undefined;
    }

    const rightValue = clause.right.kind === "subquery"
      ? this.resolveSubquery(clause.right, scopes, false)
      : this.resolveExpression(source, clause.right, scopes);

    return this.compareValues(leftValue, clause.operator, rightValue);
  }

  getRowsFromSource(source) {
    if (this.isGroup(source)) {
      return source.rows;
    }

    if (Array.isArray(source)) {
      return source;
    }

    return [source];
  }

  compareValues(left, operator, right) {
    switch (operator) {
      case "=":
        return left == right;
      case "!=":
        return left != right;
      case ">":
        return left > right;
      case "<":
        return left < right;
      case ">=":
        return left >= right;
      case "<=":
        return left <= right;
      default:
        return false;
    }
  }

  resolveExistsSubquery(expression, scopes) {
    if (!expression || expression.kind !== "subquery") {
      return false;
    }

    const result = this.executeQuery(this.expandExecutionSteps(expression.query), scopes);
    if (this.lastError) {
      return false;
    }

    logger.debug("engine.subqueries", "subquery:exists", { rowCount: result.length });
    return result.length > 0;
  }

  matchesLike(left, right) {
    const value = String(left ?? "");
    const pattern = String(right ?? "")
      .replace(/[.*+?^${}()|[\]\\]/g, "\\$&")
      .replace(/%/g, ".*")
      .replace(/_/g, ".");

    return new RegExp(`^${pattern}$`, "i").test(value);
  }

  stableValue(value) {
    if (value === null || value === undefined) {
      return String(value);
    }

    if (Array.isArray(value)) {
      return `[${value.map((item) => this.stableValue(item)).join(",")}]`;
    }

    if (typeof value === "object") {
      const keys = Object.keys(value).filter((key) => key !== "__sqlMeta").sort();
      return `{${keys.map((key) => `${key}:${this.stableValue(value[key])}`).join("|")}}`;
    }

    return JSON.stringify(value);
  }

  getExpressionLabel(expression) {
    if (expression.alias) {
      return expression.alias;
    }

    if (expression.kind === "column") {
      return expression.name;
    }

    return expression.raw;
  }

  containsAggregate(expression) {
    if (!expression) {
      return false;
    }

    if (expression.kind === "aggregate") {
      return true;
    }

    if (expression.kind === "binary") {
      return this.containsAggregate(expression.left) || this.containsAggregate(expression.right);
    }

    return false;
  }

  isGrouped(dataset) {
    return Boolean(dataset[0] && this.isGroup(dataset[0]));
  }

  isGroup(value) {
    return Boolean(value && Array.isArray(value.rows));
  }
}
