export class QueryParser {
  parse(rawQuery) {
    const query = this.normalizeQuery(rawQuery);
    if (!query) {
      return [];
    }

    const clauses = this.extractClauses(query);
    const steps = [];

    if (clauses.from) {
      steps.push({ type: "FROM", value: this.parseFromClause(clauses.from.raw) });
    }

    if (clauses.where) {
      steps.push({ type: "WHERE", value: this.parseCondition(clauses.where.raw) });
    }

    if (clauses.groupBy) {
      steps.push({
        type: "GROUP BY",
        value: this.splitTopLevel(clauses.groupBy.raw, ",").map((value) => this.parseExpression(value))
      });
    }

    if (clauses.having) {
      steps.push({ type: "HAVING", value: this.parseCondition(clauses.having.raw) });
    }

    if (clauses.select) {
      steps.push({
        type: "SELECT",
        value: this.splitTopLevel(clauses.select.raw, ",").map((value) => this.parseSelectExpression(value))
      });
    }

    if (clauses.orderBy) {
      steps.push({
        type: "ORDER_BY",
        value: this.splitTopLevel(clauses.orderBy.raw, ",").map((value) => this.parseOrderExpression(value))
      });
    }

    if (clauses.offset) {
      steps.push({
        type: "OFFSET",
        value: Math.max(0, Number(clauses.offset.raw) || 0)
      });
    }

    if (clauses.limit) {
      steps.push({
        type: "LIMIT",
        value: Math.max(0, Number(clauses.limit.raw) || 0)
      });
    }

    return steps;
  }

  normalizeQuery(rawQuery) {
    return rawQuery.replace(/;\s*$/g, "").replace(/\s+/g, " ").trim();
  }

  extractClauses(query) {
    const keywords = [
      { key: "select", token: "SELECT" },
      { key: "from", token: "FROM" },
      { key: "where", token: "WHERE" },
      { key: "groupBy", token: "GROUP BY" },
      { key: "having", token: "HAVING" },
      { key: "orderBy", token: "ORDER BY" },
      { key: "limit", token: "LIMIT" },
      { key: "offset", token: "OFFSET" }
    ];

    const positions = keywords
      .map((keyword) => ({ ...keyword, index: this.findTopLevelKeyword(query, keyword.token) }))
      .filter((keyword) => keyword.index !== -1)
      .sort((left, right) => left.index - right.index);

    const clauses = {};

    positions.forEach((entry, index) => {
      const start = entry.index + entry.token.length;
      const end = index + 1 < positions.length ? positions[index + 1].index : query.length;
      clauses[entry.key] = {
        raw: query.slice(start, end).trim()
      };
    });

    return clauses;
  }

  findTopLevelKeyword(query, keyword) {
    const upperQuery = query.toUpperCase();
    const upperKeyword = keyword.toUpperCase();
    let depth = 0;

    for (let index = 0; index <= upperQuery.length - upperKeyword.length; index += 1) {
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

      if (upperQuery.slice(index, index + upperKeyword.length) !== upperKeyword) {
        continue;
      }

      const before = index === 0 ? " " : upperQuery[index - 1];
      const after = upperQuery[index + upperKeyword.length] || " ";
      const isBoundaryBefore = /\s|\(/.test(before);
      const isBoundaryAfter = /\s|\)|$/.test(after);

      if (isBoundaryBefore && isBoundaryAfter) {
        return index;
      }
    }

    return -1;
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

  parseFromClause(expression) {
    const match = expression.trim().match(/^([a-zA-Z_][\w]*)(?:\s+(?:AS\s+)?([a-zA-Z_][\w]*))?$/i);
    const table = match ? match[1].toLowerCase() : expression.trim().toLowerCase();
    const alias = match && match[2] ? match[2].toLowerCase() : table;

    return {
      raw: expression.trim(),
      table,
      alias
    };
  }

  parseSelectExpression(expression) {
    const { source, alias } = this.extractAlias(expression);
    const parsed = this.parseExpression(source);
    const defaultAlias = this.getDefaultAlias(parsed);

    return {
      ...parsed,
      alias: alias || defaultAlias
    };
  }

  parseOrderExpression(expression) {
    const parts = expression.trim().split(/\s+/);
    const direction = ["ASC", "DESC"].includes((parts.at(-1) || "").toUpperCase()) ? parts.pop().toUpperCase() : "ASC";
    const parsed = this.parseExpression(parts.join(" "));

    return {
      ...parsed,
      direction,
      alias: this.getDefaultAlias(parsed)
    };
  }

  extractAlias(expression) {
    const explicitAlias = expression.match(/^(.*)\s+AS\s+([a-zA-Z_][\w]*)$/i);
    if (explicitAlias) {
      return {
        source: explicitAlias[1].trim(),
        alias: explicitAlias[2].trim().toLowerCase()
      };
    }

    return {
      source: expression.trim(),
      alias: ""
    };
  }

  parseCondition(expression) {
    const normalized = expression.replace(/\s+/g, " ").trim();
    const connectors = [];
    const parts = this.splitConditionParts(normalized);
    const clauses = [];

    parts.forEach((part, index) => {
      if (index % 2 === 1) {
        connectors.push(part.toUpperCase());
        return;
      }

      const operator = this.findConditionOperator(part);
      if (!operator) {
        return;
      }

      const upper = part.toUpperCase();
      const operatorIndex = upper.indexOf(operator.token, operator.index);
      const left = part.slice(0, operatorIndex).trim();
      const right = part.slice(operatorIndex + operator.token.length).trim();

      clauses.push({
        left: this.parseExpression(left),
        operator: operator.kind,
        right: this.parseExpression(right)
      });
    });

    return { raw: normalized, clauses, connectors };
  }

  splitConditionParts(expression) {
    const parts = [];
    let depth = 0;
    let current = "";
    let index = 0;

    while (index < expression.length) {
      const char = expression[index];

      if (char === "(") {
        depth += 1;
        current += char;
        index += 1;
        continue;
      }

      if (char === ")") {
        depth = Math.max(0, depth - 1);
        current += char;
        index += 1;
        continue;
      }

      const connectorMatch = depth === 0 ? expression.slice(index).match(/^(\s+)(AND|OR)(\s+)/i) : null;
      if (connectorMatch) {
        if (current.trim()) {
          parts.push(current.trim());
        }
        parts.push(connectorMatch[2].toUpperCase());
        current = "";
        index += connectorMatch[0].length;
        continue;
      }

      current += char;
      index += 1;
    }

    if (current.trim()) {
      parts.push(current.trim());
    }

    return parts;
  }

  findConditionOperator(expression) {
    const operators = [
      { token: " NOT IN ", kind: "NOT IN" },
      { token: " IN ", kind: "IN" },
      { token: ">=", kind: ">=" },
      { token: "<=", kind: "<=" },
      { token: "!=", kind: "!=" },
      { token: "=", kind: "=" },
      { token: ">", kind: ">" },
      { token: "<", kind: "<" }
    ];

    const upper = expression.toUpperCase();
    let depth = 0;

    for (let index = 0; index < upper.length; index += 1) {
      const char = upper[index];

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

      for (const operator of operators) {
        if (upper.slice(index, index + operator.token.length) === operator.token) {
          return { ...operator, index };
        }
      }
    }

    return null;
  }

  parseExpression(expression) {
    const trimmed = expression.trim();
    if (!trimmed) {
      return { kind: "literal", value: "", raw: "" };
    }

    const unwrapped = this.unwrapOuterParentheses(trimmed);
    if (unwrapped !== trimmed) {
      if (/^SELECT\s+/i.test(unwrapped)) {
        return {
          kind: "subquery",
          query: this.parse(unwrapped),
          raw: trimmed
        };
      }

      const listParts = this.splitTopLevel(unwrapped, ",");
      if (listParts.length > 1) {
        return {
          kind: "list",
          values: listParts.map((value) => this.parseExpression(value)),
          raw: trimmed
        };
      }

      return this.parseExpression(unwrapped);
    }

    const arithmetic = this.parseBinaryExpression(trimmed, ["+", "-"]) || this.parseBinaryExpression(trimmed, ["*", "/"]);
    if (arithmetic) {
      return arithmetic;
    }

    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) || (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      return {
        kind: "literal",
        value: trimmed.slice(1, -1),
        raw: trimmed
      };
    }

    const numeric = Number(trimmed);
    if (!Number.isNaN(numeric)) {
      return {
        kind: "literal",
        value: numeric,
        raw: trimmed
      };
    }

    const aggregate = trimmed.match(/^(COUNT)\(\*\)$|^(COUNT|AVG|SUM|MAX|MIN)\((.*?)\)$/i);
    if (aggregate) {
      const fn = (aggregate[1] || aggregate[2]).toUpperCase();
      const argument = aggregate[1] ? { kind: "star", raw: "*" } : this.parseExpression(aggregate[3]);
      return {
        kind: "aggregate",
        fn,
        argument,
        raw: trimmed.toLowerCase()
      };
    }

    const columnMatch = trimmed.match(/^([a-zA-Z_][\w]*)(?:\.([a-zA-Z_][\w]*))?$/);
    if (columnMatch) {
      const qualifier = columnMatch[2] ? columnMatch[1].toLowerCase() : "";
      const name = (columnMatch[2] || columnMatch[1]).toLowerCase();
      return {
        kind: "column",
        qualifier,
        name,
        raw: trimmed.toLowerCase()
      };
    }

    return {
      kind: "literal",
      value: trimmed,
      raw: trimmed.toLowerCase()
    };
  }

  parseBinaryExpression(expression, operators) {
    let depth = 0;

    for (let index = expression.length - 1; index >= 0; index -= 1) {
      const char = expression[index];

      if (char === ")") {
        depth += 1;
        continue;
      }

      if (char === "(") {
        depth = Math.max(0, depth - 1);
        continue;
      }

      if (depth !== 0 || !operators.includes(char)) {
        continue;
      }

      if (char === "-" && index === 0) {
        continue;
      }

      const left = expression.slice(0, index).trim();
      const right = expression.slice(index + 1).trim();
      if (!left || !right) {
        continue;
      }

      return {
        kind: "binary",
        operator: char,
        left: this.parseExpression(left),
        right: this.parseExpression(right),
        raw: expression.toLowerCase()
      };
    }

    return null;
  }

  unwrapOuterParentheses(expression) {
    if (!expression.startsWith("(") || !expression.endsWith(")")) {
      return expression;
    }

    let depth = 0;
    for (let index = 0; index < expression.length; index += 1) {
      const char = expression[index];

      if (char === "(") {
        depth += 1;
      } else if (char === ")") {
        depth -= 1;
      }

      if (depth === 0 && index < expression.length - 1) {
        return expression;
      }
    }

    return expression.slice(1, -1).trim();
  }

  getDefaultAlias(expression) {
    switch (expression.kind) {
      case "column":
        return expression.name;
      case "aggregate":
        if (expression.fn === "COUNT" && expression.argument.kind === "star") {
          return "count";
        }
        return expression.raw;
      case "binary":
        return expression.raw;
      default:
        return expression.raw || "value";
    }
  }
}
