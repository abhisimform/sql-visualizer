export class QueryEngine {
  constructor(sourceData) {
    this.sourceData = sourceData;
  }

  executeStep(dataset, step) {
    switch (step.type) {
      case "FROM":
        return this.getSourceRows(step.value);
      case "WHERE":
        return dataset.filter((row) => this.matchesCondition(row, step.value));
      case "GROUP BY":
        return this.groupRows(dataset, step.value);
      case "HAVING":
        return dataset.filter((group) => this.matchesCondition(group, step.value));
      case "SELECT":
        return this.selectColumns(dataset, step.value);
      case "ORDER_BY":
        return this.orderRows(dataset, step.value);
      default:
        return dataset;
    }
  }

  executeQuery(steps) {
    let dataset = [];

    steps.forEach((step) => {
      dataset = this.executeStep(dataset, step);
    });

    return dataset;
  }

  getSourceRows(tableName) {
    const normalized = String(tableName || "").trim().replace(/;$/, "").toLowerCase();
    const supportedTables = new Set(["employee_data", "data", "employees"]);

    if (!normalized || supportedTables.has(normalized)) {
      return this.cloneRows(this.sourceData);
    }

    return this.cloneRows(this.sourceData);
  }

  cloneRows(rows) {
    return rows.map((row) => ({ ...row }));
  }

  groupRows(rows, columns) {
    const groupColumns = Array.isArray(columns) ? columns : [columns];
    const groups = new Map();

    rows.forEach((row) => {
      const keyValues = groupColumns.map((column) => row[column]);
      const key = JSON.stringify(keyValues);
      const bucket = groups.get(key) || { keyValues, rows: [] };
      bucket.rows.push({ ...row });
      groups.set(key, bucket);
    });

    return Array.from(groups.values()).map((group) => {
      const values = {};
      groupColumns.forEach((column, index) => {
        values[column] = group.keyValues[index];
      });

      return {
        groupKey: group.keyValues.join(" | "),
        groupColumns,
        groupValues: values,
        count: group.rows.length,
        rows: group.rows
      };
    });
  }

  selectColumns(dataset, columns) {
    if (!dataset.length) {
      return [];
    }

    if (this.isGrouped(dataset)) {
      return dataset.map((group) => this.buildSelectedRow(group, columns));
    }

    if (columns.some((column) => column.kind === "aggregate")) {
      return [this.buildSelectedRow(dataset, columns)];
    }

    return dataset.map((row) => this.buildSelectedRow(row, columns));
  }

  buildSelectedRow(source, columns) {
    const selected = {};
    const representativeRow = this.pickRepresentativeRow(source, columns);

    columns.forEach((column) => {
      selected[column.alias] = this.resolveSelectExpression(source, column, representativeRow);
    });

    return selected;
  }

  pickRepresentativeRow(source, columns) {
    if (!this.isGroup(source)) {
      return Array.isArray(source) ? source[0] : source;
    }

    const aggregateColumn = columns.find((column) => column.kind === "aggregate" && ["MAX", "MIN"].includes(column.fn));
    if (!aggregateColumn || aggregateColumn.argument === "*") {
      return source.rows[0];
    }

    const sortedRows = [...source.rows].sort((left, right) => {
      const leftValue = left[aggregateColumn.argument];
      const rightValue = right[aggregateColumn.argument];
      return aggregateColumn.fn === "MAX" ? rightValue - leftValue : leftValue - rightValue;
    });

    return sortedRows[0] || source.rows[0];
  }

  resolveSelectExpression(source, expression, representativeRow) {
    if (expression.kind === "aggregate") {
      return this.calculateAggregate(source, expression.fn, expression.argument);
    }

    const column = expression.column;

    if (column === "group") {
      return this.isGroup(source) ? source.groupKey : undefined;
    }

    if (column === "groupkey") {
      return this.isGroup(source) ? source.groupKey : undefined;
    }

    if (this.isGroup(source)) {
      if (column in source.groupValues) {
        return source.groupValues[column];
      }

      return representativeRow ? representativeRow[column] : undefined;
    }

    if (Array.isArray(source)) {
      return source[0] ? source[0][column] : undefined;
    }

    return source[column];
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
    if (order.alias in row) {
      return row[order.alias];
    }

    if (order.raw in row) {
      return row[order.raw];
    }

    if (order.kind === "column" && order.column in row) {
      return row[order.column];
    }

    return undefined;
  }

  matchesCondition(item, condition) {
    if (!condition || !condition.clauses.length) {
      return true;
    }

    const results = condition.clauses.map((clause) => {
      const leftValue = this.resolveOperand(item, clause.left);
      const rightValue = this.resolveConditionValue(clause.right);
      return this.compareValues(leftValue, clause.operator, rightValue);
    });

    return condition.connectors.reduce((accumulator, connector, index) => {
      const nextResult = results[index + 1];
      return connector === "AND" ? accumulator && nextResult : accumulator || nextResult;
    }, results[0]);
  }

  resolveOperand(item, operand) {
    if (operand.kind === "aggregate") {
      return this.calculateAggregate(item, operand.fn, operand.argument);
    }

    if (this.isGroup(item) && operand.column in item.groupValues) {
      return item.groupValues[operand.column];
    }

    return item[operand.column];
  }

  resolveConditionValue(value) {
    if (value && value.kind === "subquery") {
      const result = this.executeQuery(value.query);
      if (!result.length) {
        return undefined;
      }

      const firstRow = result[0];
      const firstKey = Object.keys(firstRow)[0];
      return firstRow[firstKey];
    }

    return value;
  }

  calculateAggregate(source, fn, argument) {
    const rows = this.getRowsFromSource(source);

    switch (fn) {
      case "COUNT":
        if (argument === "*") {
          return rows.length;
        }
        return rows.filter((row) => row[argument] !== undefined && row[argument] !== null).length;
      case "SUM":
        return rows.reduce((total, row) => total + (Number(row[argument]) || 0), 0);
      case "AVG":
        return rows.length ? this.calculateAggregate(source, "SUM", argument) / rows.length : 0;
      case "MAX":
        return rows.reduce((max, row) => (max === undefined || row[argument] > max ? row[argument] : max), undefined);
      case "MIN":
        return rows.reduce((min, row) => (min === undefined || row[argument] < min ? row[argument] : min), undefined);
      default:
        return undefined;
    }
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

  isGrouped(dataset) {
    return Boolean(dataset[0] && this.isGroup(dataset[0]));
  }

  isGroup(value) {
    return Boolean(value && Array.isArray(value.rows));
  }
}
