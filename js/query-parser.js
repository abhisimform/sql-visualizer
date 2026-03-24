export class QueryParser {
  parse(rawQuery) {
    const query = rawQuery.replace(/\s+/g, " ").trim();
    const selectMatch = query.match(/SELECT\s+(.*?)\s+FROM/i);
    const fromMatch = query.match(/FROM\s+(.*?)(\s+WHERE|\s+GROUP BY|\s+HAVING|\s+ORDER BY|$)/i);
    const whereMatch = query.match(/WHERE\s+(.*?)(\s+GROUP BY|\s+HAVING|\s+ORDER BY|$)/i);
    const groupMatch = query.match(/GROUP BY\s+(.*?)(\s+HAVING|\s+ORDER BY|$)/i);
    const havingMatch = query.match(/HAVING\s+(.*?)(\s+ORDER BY|$)/i);
    const orderMatch = query.match(/ORDER BY\s+(.*)$/i);

    const steps = [];

    if (fromMatch) {
      steps.push({ type: "FROM", value: fromMatch[1].trim() });
    }

    if (whereMatch) {
      steps.push({ type: "WHERE", value: this.parseCondition(whereMatch[1].trim()) });
    }

    if (groupMatch) {
      steps.push({ type: "GROUP BY", value: groupMatch[1].trim().toLowerCase() });
    }

    if (havingMatch) {
      steps.push({ type: "HAVING", value: this.parseCondition(havingMatch[1].trim()) });
    }

    if (selectMatch) {
      steps.push({
        type: "SELECT",
        value: selectMatch[1]
          .split(",")
          .map((value) => value.trim().toLowerCase())
      });
    }

    if (orderMatch) {
      const [column, direction = "ASC"] = orderMatch[1].trim().split(/\s+/);
      steps.push({
        type: "ORDER_BY",
        value: {
          col: column.toLowerCase(),
          direction: direction.toUpperCase()
        }
      });
    }

    return steps;
  }

  parseCondition(expression) {
    const normalized = expression.replace(/\s+/g, " ").trim();
    const connectors = [];
    const parts = normalized
      .split(/\s+(AND|OR)\s+/i)
      .filter(Boolean)
      .map((token) => token.trim());

    const clauses = [];

    parts.forEach((part, index) => {
      if (index % 2 === 1) {
        connectors.push(part.toUpperCase());
        return;
      }

      const match = part.match(/^(COUNT\(\*\)|[a-zA-Z_][\w]*)\s*(>=|<=|!=|=|>|<)\s*(.+)$/i);
      if (!match) {
        return;
      }

      clauses.push({
        left: match[1].toLowerCase(),
        operator: match[2],
        right: this.parseValue(match[3])
      });
    });

    return { raw: normalized, clauses, connectors };
  }

  parseValue(value) {
    const normalized = value.trim();

    if ((normalized.startsWith("'") && normalized.endsWith("'")) || (normalized.startsWith("\"") && normalized.endsWith("\""))) {
      return normalized.slice(1, -1);
    }

    const numeric = Number(normalized);
    return Number.isNaN(numeric) ? normalized.toLowerCase() : numeric;
  }
}
