export class QueryEngine {
  constructor(sourceData) {
    this.sourceData = sourceData;
    this.lastError = null;
    this.queryContext = "";
  }

  setQueryContext(query) {
    this.queryContext = query || "";
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

  executeStep(dataset, step, scopes = []) {
    if (this.lastError) {
      return dataset;
    }

    try {
      switch (step.type) {
        case "FROM":
          return this.getSourceRows(step.value);
        case "WHERE":
          return dataset.filter((row) => this.matchesCondition(row, step.value, [row, ...scopes]));
        case "GROUP BY":
          return this.groupRows(dataset, step.value, scopes);
        case "HAVING":
          return dataset.filter((group) => this.matchesCondition(group, step.value, [group, ...scopes]));
        case "SELECT":
          return this.selectColumns(dataset, step.value, scopes);
        case "ORDER_BY":
          return this.orderRows(dataset, step.value);
        case "OFFSET":
          return dataset.slice(step.value);
        case "LIMIT":
          return dataset.slice(0, step.value);
        default:
          return dataset;
      }
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

    steps.forEach((step) => {
      if (this.lastError) {
        return;
      }
      dataset = this.executeStep(dataset, step, scopes);
    });

    return dataset;
  }

  getSourceRows(fromClause) {
    const tableName = (fromClause?.table || fromClause || "").toString().trim().replace(/;$/, "").toLowerCase();
    const alias = (fromClause?.alias || tableName || "data").toLowerCase();
    const supportedTables = new Set(["employee_data", "data", "employees"]);

    if (!tableName || supportedTables.has(tableName)) {
      return this.sourceData.map((row) => this.createScopedRow(row, tableName || "employee_data", alias));
    }

    return this.sourceData.map((row) => this.createScopedRow(row, tableName, alias));
  }

  createScopedRow(row, tableName, alias) {
    const scopedRow = { ...row };
    const bindings = {
      [tableName]: scopedRow,
      [alias]: scopedRow
    };

    this.attachMeta(scopedRow, {
      tableName,
      alias,
      bindings
    });

    return scopedRow;
  }

  cloneRows(rows) {
    return rows.map((row) => this.cloneRow(row));
  }

  cloneRow(row) {
    const cloned = { ...row };
    const meta = this.getMeta(row);
    if (meta) {
      this.attachMeta(cloned, {
        ...meta,
        bindings: Object.keys(meta.bindings || {}).reduce((accumulator, key) => {
          accumulator[key] = cloned;
          return accumulator;
        }, {})
      });
    }
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
    const groups = new Map();

    rows.forEach((row) => {
      const rowScopes = [row, ...scopes];
      const keyValues = expressions.map((expression) => this.resolveExpression(row, expression, rowScopes));
      const key = JSON.stringify(keyValues);
      const bucket = groups.get(key) || { keyValues, rows: [] };
      bucket.rows.push(this.cloneRow(row));
      groups.set(key, bucket);
    });

    return Array.from(groups.values()).map((group) => {
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
  }

  selectColumns(dataset, columns, scopes) {
    if (!dataset.length) {
      return [];
    }

    if (this.isGrouped(dataset)) {
      return dataset.map((group) => this.buildSelectedRow(group, columns, scopes));
    }

    if (columns.some((column) => this.containsAggregate(column))) {
      return [this.buildSelectedRow(dataset, columns, scopes)];
    }

    return dataset.map((row) => this.buildSelectedRow(row, columns, scopes));
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
      const leftValue = left[argumentName];
      const rightValue = right[argumentName];
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
      if (expression.qualifier && meta?.bindings?.[expression.qualifier]) {
        return meta.bindings[expression.qualifier][expression.name];
      }

      if (!expression.qualifier && expression.name in scope) {
        return scope[expression.name];
      }
    }

    return undefined;
  }

  calculateAggregate(source, expression, scopes) {
    const rows = this.getRowsFromSource(source);

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
    const result = this.executeQuery(expression.query, scopes);
    if (this.lastError) {
      return asSet ? [] : undefined;
    }

    if (!result.length) {
      return asSet ? [] : undefined;
    }

    if (asSet) {
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

    if (order.kind === "column" && order.name in row) {
      return row[order.name];
    }

    return undefined;
  }

  matchesCondition(source, condition, scopes) {
    if (!condition || !condition.clauses.length) {
      return true;
    }

    const results = condition.clauses.map((clause) => this.evaluateClause(source, clause, scopes));

    return condition.connectors.reduce((accumulator, connector, index) => {
      const nextResult = results[index + 1];
      return connector === "AND" ? accumulator && nextResult : accumulator || nextResult;
    }, results[0]);
  }

  evaluateClause(source, clause, scopes) {
    const leftValue = this.resolveExpression(source, clause.left, scopes);

    if (clause.operator === "IN" || clause.operator === "NOT IN") {
      const rightValues = clause.right.kind === "subquery"
        ? this.resolveSubquery(clause.right, scopes, true)
        : this.resolveExpression(source, clause.right, scopes);
      const haystack = Array.isArray(rightValues) ? rightValues : [rightValues];
      const matched = haystack.some((value) => value == leftValue);
      return clause.operator === "IN" ? matched : !matched;
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
