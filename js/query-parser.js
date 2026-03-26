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
      const { distinct, raw } = this.parseSelectClause(clauses.select.raw);
      steps.push({
        type: "SELECT",
        value: this.splitTopLevel(raw, ",").map((value) => this.parseSelectExpression(value))
      });

      if (distinct) {
        steps.push({ type: "DISTINCT", value: true });
      }
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
    return this.parseSourceSpec(expression);
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

  parseSelectClause(expression) {
    const trimmed = expression.trim();
    const distinctMatch = trimmed.match(/^DISTINCT\s+(.*)$/i);

    return {
      distinct: Boolean(distinctMatch),
      raw: distinctMatch ? distinctMatch[1].trim() : trimmed
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

      const clause = this.parseConditionClause(part);
      if (!clause) {
        return;
      }

      clauses.push(clause);
    });

    return { raw: normalized, clauses, connectors };
  }

  parseConditionClause(expression) {
    const trimmed = expression.trim();
    const upper = trimmed.toUpperCase();

    const existsMatch = trimmed.match(/^(NOT\s+)?EXISTS\s*(\(.+\))$/i);
    if (existsMatch) {
      return {
        left: null,
        operator: existsMatch[1] ? "NOT EXISTS" : "EXISTS",
        right: this.parseExpression(existsMatch[2].trim())
      };
    }

    const isNullMatch = trimmed.match(/^(.*?)\s+IS\s+(NOT\s+)?NULL$/i);
    if (isNullMatch) {
      return {
        left: this.parseExpression(isNullMatch[1].trim()),
        operator: isNullMatch[2] ? "IS NOT NULL" : "IS NULL",
        right: { kind: "literal", value: null, raw: "null" }
      };
    }

    const betweenOperator = this.findConditionOperator(trimmed);
    if (!betweenOperator) {
      return null;
    }

    if (betweenOperator.kind === "BETWEEN" || betweenOperator.kind === "NOT BETWEEN") {
      const operatorIndex = betweenOperator.index;
      const betweenAndIndex = this.findBetweenAndIndex(trimmed, operatorIndex + betweenOperator.token.length);
      if (betweenAndIndex === -1) {
        return null;
      }

      const left = trimmed.slice(0, operatorIndex).trim();
      const first = trimmed.slice(operatorIndex + betweenOperator.token.length, betweenAndIndex).trim();
      const second = trimmed.slice(betweenAndIndex + 5).trim();

      return {
        left: this.parseExpression(left),
        operator: betweenOperator.kind,
        right: {
          kind: "list",
          values: [this.parseExpression(first), this.parseExpression(second)],
          raw: `${first}, ${second}`
        }
      };
    }

    const operatorIndex = upper.indexOf(betweenOperator.token, betweenOperator.index);
    const left = trimmed.slice(0, operatorIndex).trim();
    const right = trimmed.slice(operatorIndex + betweenOperator.token.length).trim();

    return {
      left: this.parseExpression(left),
      operator: betweenOperator.kind,
      right: this.parseExpression(right)
    };
  }

  splitConditionParts(expression) {
    const parts = [];
    let depth = 0;
    let current = "";
    let index = 0;
    let betweenPending = false;

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

      const betweenMatch = depth === 0 ? expression.slice(index).match(/^(BETWEEN|NOT\s+BETWEEN)\b/i) : null;
      if (betweenMatch) {
        betweenPending = true;
        current += betweenMatch[0];
        index += betweenMatch[0].length;
        continue;
      }

      const connectorMatch = depth === 0 ? expression.slice(index).match(/^(\s+)(AND|OR)(\s+)/i) : null;
      if (connectorMatch) {
        if (betweenPending && connectorMatch[2].toUpperCase() === "AND") {
          betweenPending = false;
          current += connectorMatch[0];
          index += connectorMatch[0].length;
          continue;
        }

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
      { token: " NOT BETWEEN ", kind: "NOT BETWEEN" },
      { token: " BETWEEN ", kind: "BETWEEN" },
      { token: " NOT LIKE ", kind: "NOT LIKE" },
      { token: " LIKE ", kind: "LIKE" },
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

    if (/^NULL$/i.test(trimmed)) {
      return {
        kind: "literal",
        value: null,
        raw: "null"
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
      subquery: this.parse(inner)
    };
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

  findBetweenAndIndex(expression, startIndex) {
    const upper = expression.toUpperCase();
    let depth = 0;

    for (let index = startIndex; index < upper.length - 4; index += 1) {
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

      if (upper.slice(index, index + 5) === " AND ") {
        return index;
      }
    }

    return -1;
  }
}
