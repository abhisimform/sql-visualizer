export class QueryEngine {
  constructor(sourceData) {
    this.sourceData = sourceData;
  }

  executeStep(dataset, step) {
    switch (step.type) {
      case "FROM":
        return this.cloneRows(this.sourceData);
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

  cloneRows(rows) {
    return rows.map((row) => ({ ...row }));
  }

  groupRows(rows, column) {
    const groups = new Map();

    rows.forEach((row) => {
      const key = row[column];
      const bucket = groups.get(key) || [];
      bucket.push(row);
      groups.set(key, bucket);
    });

    return Array.from(groups.entries()).map(([groupKey, groupRows]) => ({
      groupKey,
      count: groupRows.length,
      rows: this.cloneRows(groupRows)
    }));
  }

  selectColumns(dataset, columns) {
    if (!dataset.length) {
      return [];
    }

    if (this.isGrouped(dataset)) {
      return dataset.map((group) => {
        const selected = {};

        columns.forEach((column) => {
          if (column === "count(*)") {
            selected.count = group.count;
          } else if (column === "group") {
            selected.group = group.groupKey;
          } else if (column === "groupkey") {
            selected.groupkey = group.groupKey;
          } else if (column in group) {
            selected[column] = group[column];
          }
        });

        return selected;
      });
    }

    return dataset.map((row) => {
      const selected = {};
      columns.forEach((column) => {
        selected[column] = row[column];
      });
      return selected;
    });
  }

  orderRows(dataset, order) {
    const sorted = [...dataset];
    const directionMultiplier = order.direction === "DESC" ? -1 : 1;

    sorted.sort((left, right) => {
      const leftValue = left[order.col];
      const rightValue = right[order.col];

      if (typeof leftValue === "number" && typeof rightValue === "number") {
        return (leftValue - rightValue) * directionMultiplier;
      }

      return String(leftValue).localeCompare(String(rightValue)) * directionMultiplier;
    });

    return sorted;
  }

  matchesCondition(item, condition) {
    if (!condition || !condition.clauses.length) {
      return true;
    }

    const results = condition.clauses.map((clause) => {
      const leftValue = this.resolveOperand(item, clause.left);
      return this.compareValues(leftValue, clause.operator, clause.right);
    });

    return condition.connectors.reduce((accumulator, connector, index) => {
      const nextResult = results[index + 1];
      return connector === "AND" ? accumulator && nextResult : accumulator || nextResult;
    }, results[0]);
  }

  resolveOperand(item, operand) {
    if (operand === "count(*)") {
      return item.count;
    }

    return item[operand];
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
    return Boolean(dataset[0] && Array.isArray(dataset[0].rows));
  }
}
