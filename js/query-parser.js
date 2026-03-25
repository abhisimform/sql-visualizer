export class QueryParser {
  parse(rawQuery) {
    const query = this.normalizeQuery(rawQuery);
    if (!query) {
      return [];
    }

    const clauses = this.extractClauses(query);
    const steps = [];

    if (clauses.from) {
      steps.push({ type: "FROM", value: clauses.from.raw });
    }

    if (clauses.where) {
      steps.push({ type: "WHERE", value: this.parseCondition(clauses.where.raw) });
    }

    if (clauses.groupBy) {
      steps.push({
        type: "GROUP BY",
        value: this.splitTopLevel(clauses.groupBy.raw, ",").map((value) => value.trim().toLowerCase())
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
      { key: "orderBy", token: "ORDER BY" }
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

  parseSelectExpression(expression) {
    const aliasMatch = expression.match(/^(.*?)(?:\s+AS\s+|\s+)([a-zA-Z_][\w]*)$/i);
    const aggregateMatch = expression.match(/^(COUNT\(\*\)|COUNT\((.*?)\)|AVG\((.*?)\)|SUM\((.*?)\)|MAX\((.*?)\)|MIN\((.*?)\))$/i);

    const raw = expression.trim();
    let source = raw;
    let alias = "";

    if (aliasMatch) {
      const possibleSource = aliasMatch[1].trim();
      const possibleAlias = aliasMatch[2].trim().toLowerCase();
      if (this.looksLikeAggregate(possibleSource) || !possibleSource.includes(" ")) {
        source = possibleSource;
        alias = possibleAlias;
      }
    }

    const normalized = source.trim().toLowerCase();
    const aggregate = source.trim().match(/^(COUNT)\(\*\)$|^(COUNT|AVG|SUM|MAX|MIN)\((.*?)\)$/i);

    if (aggregate) {
      const fn = (aggregate[1] || aggregate[2]).toUpperCase();
      const argument = aggregate[1] ? "*" : aggregate[3].trim().toLowerCase();
      return {
        kind: "aggregate",
        raw: normalized,
        alias: alias || (fn === "COUNT" && argument === "*" ? "count" : normalized),
        fn,
        argument
      };
    }

    return {
      kind: "column",
      raw: normalized,
      alias: alias || normalized,
      column: normalized
    };
  }

  parseOrderExpression(expression) {
    const parts = expression.trim().split(/\s+/);
    const direction = ["ASC", "DESC"].includes((parts.at(-1) || "").toUpperCase()) ? parts.pop().toUpperCase() : "ASC";
    const target = parts.join(" ");
    const parsed = this.parseSelectExpression(target);

    return {
      ...parsed,
      direction
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

      const match = part.match(/^(.*?)\s*(>=|<=|!=|=|>|<)\s*(.+)$/i);
      if (!match) {
        return;
      }

      clauses.push({
        left: this.parseOperand(match[1]),
        operator: match[2],
        right: this.parseValue(match[3])
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

  parseOperand(value) {
    const normalized = value.trim();
    const aggregate = normalized.match(/^(COUNT)\(\*\)$|^(COUNT|AVG|SUM|MAX|MIN)\((.*?)\)$/i);

    if (aggregate) {
      return {
        kind: "aggregate",
        fn: (aggregate[1] || aggregate[2]).toUpperCase(),
        argument: aggregate[1] ? "*" : aggregate[3].trim().toLowerCase(),
        raw: normalized.toLowerCase()
      };
    }

    return {
      kind: "column",
      column: normalized.toLowerCase(),
      raw: normalized.toLowerCase()
    };
  }

  parseValue(value) {
    const normalized = value.trim();
    const subqueryMatch = normalized.match(/^\((SELECT .*?)\)$/i);

    if (subqueryMatch) {
      return {
        kind: "subquery",
        query: this.parse(subqueryMatch[1])
      };
    }

    if ((normalized.startsWith("'") && normalized.endsWith("'")) || (normalized.startsWith('"') && normalized.endsWith('"'))) {
      return normalized.slice(1, -1);
    }

    const numeric = Number(normalized);
    return Number.isNaN(numeric) ? normalized.toLowerCase() : numeric;
  }

  looksLikeAggregate(value) {
    return /^(COUNT\(\*\)|COUNT\(.*\)|AVG\(.*\)|SUM\(.*\)|MAX\(.*\)|MIN\(.*\))$/i.test(value.trim());
  }
}
