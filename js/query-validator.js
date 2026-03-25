const CLAUSE_SEQUENCE = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY", "OFFSET", "LIMIT"];
const BUILT_IN_FUNCTIONS = new Set(["COUNT", "AVG", "SUM", "MAX", "MIN"]);
const PSEUDO_COLUMNS = new Set(["group", "groupkey", "count"]);

export function validateQuery(ast, schema, options = {}) {
  const rawQuery = options.rawQuery || "";
  const sampleRows = normalizeSampleRows(options.sampleRows || {});
  const errors = [];

  validateRequiredClauses(ast, rawQuery, errors);
  validateClauseOrder(rawQuery, errors);

  if (errors.length) {
    return errors;
  }

  const context = createValidationContext(ast, schema, sampleRows, rawQuery, options.outerAliases || new Set());

  validateFromClause(context, errors);
  validateLimitOffset(ast, rawQuery, errors);
  validateHavingUsage(context, errors);
  validateSelectAliases(context, errors);
  validateExpressionsInAst(context, errors);
  validateAggregateUsage(context, errors);
  validateTypeComparisons(context, errors);

  return errors;
}

export function createQueryError(type, message, location, suggestion = "") {
  return { type, message, location, suggestion };
}

function normalizeSampleRows(sampleRows) {
  return Object.entries(sampleRows).reduce((accumulator, [table, row]) => {
    accumulator[table.toUpperCase()] = row;
    return accumulator;
  }, {});
}

function createValidationContext(ast, schema, sampleRows, rawQuery, outerAliases) {
  const normalizedSchema = Object.entries(schema).reduce((accumulator, [table, columns]) => {
    accumulator[table.toUpperCase()] = columns.map((column) => column.toLowerCase());
    return accumulator;
  }, {});

  const sources = collectSources(ast).map((source) => ({
    ...source,
    tableName: source.table.toUpperCase(),
    aliasName: source.alias.toLowerCase()
  }));

  const groupByStep = ast.find((step) => step.type === "GROUP BY");
  const selectStep = ast.find((step) => step.type === "SELECT");
  const aliases = new Set(outerAliases);

  sources.forEach((source) => {
    aliases.add(source.aliasName);
    aliases.add(source.tableName.toLowerCase());
  });

  return {
    ast,
    rawQuery,
    schema: normalizedSchema,
    sampleRows,
    sources,
    outerAliases: new Set(outerAliases),
    availableAliases: aliases,
    groupExpressions: groupByStep ? groupByStep.value : [],
    selectExpressions: selectStep ? selectStep.value : [],
    selectAliases: new Set((selectStep ? selectStep.value : []).map((expression) => expression.alias).filter(Boolean))
  };
}

function collectSources(ast) {
  const sources = [];
  const fromStep = ast.find((step) => step.type === "FROM");
  const baseSource = fromStep?.value?.source ? fromStep.value.source : fromStep?.value;
  if (baseSource?.table) {
    sources.push(baseSource);
  }

  ast.filter((step) => step.type === "JOIN").forEach((step) => {
    if (step.value?.source?.table) {
      sources.push(step.value.source);
    }
  });

  return sources;
}

function validateRequiredClauses(ast, rawQuery, errors) {
  if (!ast.some((step) => step.type === "SELECT")) {
    errors.push(createQueryError("SyntaxError", "Missing SELECT clause", findTokenLocation(rawQuery, "SELECT"), "Start the query with SELECT ..."));
  }

  if (!ast.some((step) => step.type === "FROM")) {
    errors.push(createQueryError("SyntaxError", "Missing FROM clause", findTokenLocation(rawQuery, "FROM"), "Add a FROM clause like FROM EMPLOYEE_DATA"));
  }
}

function validateClauseOrder(rawQuery, errors) {
  if (!rawQuery) {
    return;
  }

  const positions = CLAUSE_SEQUENCE
    .map((keyword) => ({ keyword, index: findTopLevelKeyword(rawQuery, keyword) }))
    .filter((entry) => entry.index !== -1);

  for (let index = 1; index < positions.length; index += 1) {
    const previousOrder = CLAUSE_SEQUENCE.indexOf(positions[index - 1].keyword);
    const currentOrder = CLAUSE_SEQUENCE.indexOf(positions[index].keyword);

    if (currentOrder < previousOrder) {
      errors.push(createQueryError(
        "SyntaxError",
        `Clause ${positions[index].keyword} is out of order`,
        toLocation(rawQuery, positions[index].index),
        `Move ${positions[index].keyword} before ${positions[index - 1].keyword}`
      ));
      return;
    }
  }
}

function validateFromClause(context, errors) {
  context.sources.forEach((source) => {
    if (!context.schema[source.tableName]) {
      errors.push(createQueryError(
        "SemanticError",
        `Table '${source.tableName}' does not exist`,
        findTokenLocation(context.rawQuery, source.tableName),
        closestSuggestion(source.tableName.toLowerCase(), Object.keys(context.schema).map((name) => name.toLowerCase()), "Did you mean")
      ));
    }
  });

  context.ast.filter((step) => step.type === "JOIN").forEach((step) => {
    if (step.value?.mode !== "CROSS" && (!step.value.condition || step.value.invalidCondition)) {
      errors.push(createQueryError(
        "LogicalError",
        "Invalid JOIN condition",
        findTokenLocation(context.rawQuery, "JOIN"),
        "Use JOIN ... ON left_column = right_column"
      ));
    }
  });
}

function validateLimitOffset(ast, rawQuery, errors) {
  ["LIMIT", "OFFSET"].forEach((type) => {
    const step = ast.find((item) => item.type === type);
    if (!step) {
      return;
    }

    const match = rawQuery.match(new RegExp(`${type}\\s+([^\\s;]+)`, "i"));
    const rawValue = match ? match[1] : String(step.value);
    if (!/^\d+$/.test(rawValue)) {
      errors.push(createQueryError("TypeError", `${type} expects a numeric value`, findTokenLocation(rawQuery, rawValue), `Use ${type} 10 style syntax`));
    }
  });
}

function validateHavingUsage(context, errors) {
  const havingStep = context.ast.find((step) => step.type === "HAVING");
  if (havingStep && !context.groupExpressions.length) {
    errors.push(createQueryError("LogicalError", "HAVING cannot be used without GROUP BY", findTokenLocation(context.rawQuery, "HAVING"), "Add GROUP BY before HAVING or move the filter to WHERE"));
  }
}

function validateSelectAliases(context, errors) {
  const aliases = new Map();

  context.selectExpressions.forEach((expression) => {
    if (!expression.alias) {
      return;
    }

    const key = expression.alias.toLowerCase();
    if (aliases.has(key)) {
      errors.push(createQueryError("SemanticError", `Duplicate column alias '${expression.alias}'`, findTokenLocation(context.rawQuery, expression.alias), "Rename one of the selected aliases"));
      return;
    }

    aliases.set(key, true);
  });
}

function validateExpressionsInAst(context, errors) {
  context.ast.forEach((step) => {
    if (step.type === "SELECT" || step.type === "GROUP BY" || step.type === "ORDER_BY") {
      step.value.forEach((expression) => validateExpression(expression, context, errors, step.type));
      return;
    }

    if (step.type === "WHERE" || step.type === "HAVING") {
      step.value.clauses.forEach((clause) => {
        validateExpression(clause.left, context, errors, step.type);
        validateExpression(clause.right, context, errors, step.type);
      });
      return;
    }

    if (step.type === "JOIN" && step.value?.condition) {
      step.value.condition.clauses.forEach((clause) => {
        validateExpression(clause.left, context, errors, step.type);
        validateExpression(clause.right, context, errors, step.type);
      });
    }
  });
}

function validateExpression(expression, context, errors, stepType = "") {
  if (!expression || errors.length) {
    return;
  }

  switch (expression.kind) {
    case "column":
      validateColumnReference(expression, context, errors, stepType);
      return;
    case "aggregate":
      validateAggregateFunction(expression, context, errors);
      validateExpression(expression.argument, context, errors, stepType);
      return;
    case "binary":
      validateExpression(expression.left, context, errors, stepType);
      validateExpression(expression.right, context, errors, stepType);
      return;
    case "subquery":
      validateSubquery(expression, context, errors);
      return;
    case "list":
      expression.values.forEach((value) => validateExpression(value, context, errors, stepType));
      return;
    case "literal":
      if (expression.value === "*") {
        return;
      }
      detectInvalidFunctionLiteral(expression, context, errors);
      return;
    default:
      return;
  }
}

function validateColumnReference(expression, context, errors, stepType) {
  if (PSEUDO_COLUMNS.has(expression.name)) {
    return;
  }

  const qualifier = expression.qualifier ? expression.qualifier.toLowerCase() : "";

  if (qualifier) {
    const matchedSource = context.sources.find((source) => source.aliasName === qualifier || source.tableName.toLowerCase() === qualifier);
    if (!matchedSource) {
      if (context.outerAliases.has(qualifier)) {
        return;
      }

      errors.push(createQueryError(
        "SemanticError",
        `Alias '${qualifier}' not found`,
        findTokenLocation(context.rawQuery, qualifier),
        "Use a valid table alias from the FROM or JOIN clause"
      ));
      return;
    }

    const columns = context.schema[matchedSource.tableName] || [];
    if (!columns.includes(expression.name)) {
      errors.push(createQueryError(
        "SemanticError",
        `Column '${expression.name}' does not exist in table '${qualifier}'`,
        findTokenLocation(context.rawQuery, expression.raw || expression.name),
        closestSuggestion(expression.name, columns, "Did you mean")
      ));
    }
    return;
  }

  const matchedSources = context.sources.filter((source) => (context.schema[source.tableName] || []).includes(expression.name));

  if (matchedSources.length === 1) {
    return;
  }

  if (matchedSources.length > 1) {
    errors.push(createQueryError(
      "SemanticError",
      `Column '${expression.name}' is ambiguous`,
      findTokenLocation(context.rawQuery, expression.name),
      "Prefix the column with a table alias"
    ));
    return;
  }

  if (stepType === "ORDER_BY" && context.selectAliases.has(expression.name)) {
    return;
  }

  const allColumns = Array.from(new Set(context.sources.flatMap((source) => context.schema[source.tableName] || [])));
  errors.push(createQueryError(
    "SemanticError",
    `Column '${expression.name}' does not exist`,
    findTokenLocation(context.rawQuery, expression.raw || expression.name),
    closestSuggestion(expression.name, allColumns, "Did you mean")
  ));
}

function validateAggregateFunction(expression, context, errors) {
  if (!BUILT_IN_FUNCTIONS.has(expression.fn)) {
    errors.push(createQueryError("LogicalError", `Invalid function name '${expression.fn}'`, findTokenLocation(context.rawQuery, expression.fn), "Use one of COUNT, AVG, SUM, MAX, MIN"));
  }
}

function validateSubquery(expression, context, errors) {
  const subqueryErrors = validateQuery(expression.query, context.schema, {
    rawQuery: expression.raw,
    sampleRows: context.sampleRows,
    outerAliases: context.availableAliases
  });

  if (subqueryErrors.length) {
    errors.push(subqueryErrors[0]);
  }
}

function detectInvalidFunctionLiteral(expression, context, errors) {
  const match = typeof expression.value === "string" ? expression.value.match(/^([a-zA-Z_][\w]*)\s*\(/) : null;
  if (!match) {
    return;
  }

  const functionName = match[1].toUpperCase();
  if (BUILT_IN_FUNCTIONS.has(functionName)) {
    return;
  }

  errors.push(createQueryError("LogicalError", `Invalid function name '${match[1]}'`, findTokenLocation(context.rawQuery, match[1]), "Use one of COUNT, AVG, SUM, MAX, MIN"));
}

function validateAggregateUsage(context, errors) {
  const hasAggregate = context.selectExpressions.some((expression) => containsAggregate(expression));
  const nonAggregateColumns = context.selectExpressions.filter((expression) => !containsAggregate(expression) && !(expression.kind === "literal" && expression.value === "*"));

  if (hasAggregate && !context.groupExpressions.length && nonAggregateColumns.length) {
    const expression = nonAggregateColumns[0];
    errors.push(createQueryError(
      "SemanticError",
      `Column '${expression.alias || expression.raw}' must appear in GROUP BY when aggregates are used`,
      findTokenLocation(context.rawQuery, expression.raw || expression.alias),
      "Add GROUP BY for the non-aggregated column or remove it from SELECT"
    ));
    return;
  }

  if (!context.groupExpressions.length) {
    return;
  }

  const groupLabels = new Set(context.groupExpressions.map((expression) => getExpressionLabel(expression)));
  nonAggregateColumns.forEach((expression) => {
    if (groupLabels.has(getExpressionLabel(expression))) {
      return;
    }

    errors.push(createQueryError(
      "SemanticError",
      `Column '${expression.alias || expression.raw}' must appear in GROUP BY`,
      findTokenLocation(context.rawQuery, expression.raw || expression.alias),
      "Add the column to GROUP BY or wrap it in an aggregate"
    ));
  });
}

function validateTypeComparisons(context, errors) {
  context.ast
    .filter((step) => step.type === "WHERE" || step.type === "HAVING" || step.type === "JOIN")
    .forEach((step) => {
      const clauses = step.type === "JOIN" ? step.value?.condition?.clauses || [] : step.value.clauses;
      clauses.forEach((clause) => {
        const leftType = inferExpressionType(clause.left, context);
        const rightType = inferExpressionType(clause.right, context);

        if (leftType === "unknown" || rightType === "unknown" || leftType === rightType) {
          return;
        }

        errors.push(createQueryError("TypeError", `Cannot compare ${leftType} with ${rightType}`, findTokenLocation(context.rawQuery, clause.operator), "Use compatible types on both sides of the comparison"));
      });
    });
}

function inferExpressionType(expression, context) {
  if (!expression) {
    return "unknown";
  }

  switch (expression.kind) {
    case "literal":
      return typeof expression.value === "number" ? "number" : typeof expression.value === "string" ? "string" : "unknown";
    case "column": {
      const qualifier = expression.qualifier ? expression.qualifier.toLowerCase() : "";
      if (qualifier) {
        const matchedSource = context.sources.find((source) => source.aliasName === qualifier || source.tableName.toLowerCase() === qualifier);
        return matchedSource ? inferColumnType(matchedSource, expression.name, context) : "unknown";
      }

      const matchedSource = context.sources.find((source) => (context.schema[source.tableName] || []).includes(expression.name));
      return matchedSource ? inferColumnType(matchedSource, expression.name, context) : "unknown";
    }
    case "aggregate":
    case "binary":
      return "number";
    case "list": {
      const first = expression.values[0];
      return first ? inferExpressionType(first, context) : "unknown";
    }
    case "subquery": {
      const selectStep = expression.query.find((step) => step.type === "SELECT");
      return selectStep?.value?.[0] ? inferExpressionType(selectStep.value[0], context) : "unknown";
    }
    default:
      return "unknown";
  }
}

function inferColumnType(source, columnName, context) {
  const sampleRow = context.sampleRows[source.tableName] || {};
  const value = sampleRow[columnName];
  return typeof value === "number" ? "number" : typeof value === "string" ? "string" : "unknown";
}

function containsAggregate(expression) {
  if (!expression) {
    return false;
  }

  if (expression.kind === "aggregate") {
    return true;
  }

  if (expression.kind === "binary") {
    return containsAggregate(expression.left) || containsAggregate(expression.right);
  }

  return false;
}

function getExpressionLabel(expression) {
  if (expression.alias) {
    return expression.alias;
  }

  if (expression.kind === "column") {
    return expression.qualifier ? `${expression.qualifier}.${expression.name}` : expression.name;
  }

  return expression.raw;
}

function closestSuggestion(input, candidates, prefix) {
  if (!candidates.length) {
    return "";
  }

  const best = candidates
    .map((candidate) => ({ candidate, distance: levenshtein(input.toLowerCase(), candidate.toLowerCase()) }))
    .sort((left, right) => left.distance - right.distance)[0];

  if (!best || best.distance > 4) {
    return "";
  }

  return `${prefix} '${best.candidate}'?`;
}

function levenshtein(left, right) {
  const matrix = Array.from({ length: left.length + 1 }, () => Array(right.length + 1).fill(0));

  for (let row = 0; row <= left.length; row += 1) {
    matrix[row][0] = row;
  }

  for (let column = 0; column <= right.length; column += 1) {
    matrix[0][column] = column;
  }

  for (let row = 1; row <= left.length; row += 1) {
    for (let column = 1; column <= right.length; column += 1) {
      const cost = left[row - 1] === right[column - 1] ? 0 : 1;
      matrix[row][column] = Math.min(matrix[row - 1][column] + 1, matrix[row][column - 1] + 1, matrix[row - 1][column - 1] + cost);
    }
  }

  return matrix[left.length][right.length];
}

function findTokenLocation(query, token) {
  const index = token ? query.toLowerCase().indexOf(String(token).toLowerCase()) : -1;
  return toLocation(query, index === -1 ? 0 : index);
}

function toLocation(query, index) {
  const safeIndex = Math.max(0, index);
  const lines = query.slice(0, safeIndex).split("\n");
  return { line: lines.length, column: lines.at(-1).length + 1 };
}

function findTopLevelKeyword(query, keyword) {
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
    if (/\s|\(/.test(before) && /\s|\)|$/.test(after)) {
      return index;
    }
  }

  return -1;
}
