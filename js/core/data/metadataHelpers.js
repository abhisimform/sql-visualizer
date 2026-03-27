// metadataHelpers.js

import {
  SAMPLE_QUERIES,
  QUERY_EXPLANATIONS,
  EXPECTED_OUTPUT_PREVIEWS,
  JOIN_PATHS,
  QUERY_EXPLANATION_FALLBACK,
  ERROR_CASE_QUERIES,
  TABLE_DESCRIPTIONS,
  RELATIONS
} from "./data.js";

// --------------------------------------------------
// Basic safe getters
// --------------------------------------------------

export function getSampleQueryById(queryId) {
  if (queryId === undefined || queryId === null) return null;
  return SAMPLE_QUERIES?.find(q => q.id === Number(queryId)) || null;
}

export function getQueryExplanation(queryId, topic = "") {
  if (queryId !== undefined && queryId !== null && QUERY_EXPLANATIONS?.[queryId]) {
    return QUERY_EXPLANATIONS[queryId];
  }

  if (topic && QUERY_EXPLANATION_FALLBACK?.topic_hints?.[topic]) {
    return QUERY_EXPLANATION_FALLBACK.topic_hints[topic];
  }

  return QUERY_EXPLANATION_FALLBACK?.default_message || "No explanation available.";
}

export function getExpectedPreview(queryId) {
  if (queryId === undefined || queryId === null) return null;
  return EXPECTED_OUTPUT_PREVIEWS?.[queryId] || null;
}

export function getErrorCaseById(errorId) {
  if (errorId === undefined || errorId === null) return null;
  return ERROR_CASE_QUERIES?.find(item => item.id === Number(errorId)) || null;
}

export function getAllErrorCases() {
  return Array.isArray(ERROR_CASE_QUERIES) ? ERROR_CASE_QUERIES : [];
}

export function getTableDescription(tableName) {
  if (!tableName) return null;
  return TABLE_DESCRIPTIONS?.[normalizeTableName(tableName)] || null;
}

export function getAllTableDescriptions() {
  return TABLE_DESCRIPTIONS || {};
}

export function getAllRelations() {
  return Array.isArray(RELATIONS) ? RELATIONS : [];
}

// --------------------------------------------------
// Query metadata bundle
// --------------------------------------------------

export function getQueryMetadata(queryId) {
  const query = getSampleQueryById(queryId);
  if (!query) return null;

  return {
    ...query,
    explanation: getQueryExplanation(query.id, query.topic),
    preview: getExpectedPreview(query.id)
  };
}

// --------------------------------------------------
// Join path helpers
// --------------------------------------------------

export function normalizeTableName(tableName) {
  if (!tableName || typeof tableName !== "string") return "";
  return tableName.trim().toUpperCase();
}

export function getJoinPathsFromTable(tableName) {
  const normalized = normalizeTableName(tableName);
  if (!normalized) return {};
  return JOIN_PATHS?.[normalized] || {};
}

export function getJoinPathBetween(tableA, tableB) {
  const a = normalizeTableName(tableA);
  const b = normalizeTableName(tableB);

  if (!a || !b) return [];
  return JOIN_PATHS?.[a]?.[b] || [];
}

export function hasJoinPath(tableA, tableB) {
  const paths = getJoinPathBetween(tableA, tableB);
  return Array.isArray(paths) && paths.length > 0;
}

export function getReachableTables(tableName) {
  const normalized = normalizeTableName(tableName);
  const map = JOIN_PATHS?.[normalized] || {};
  return Object.keys(map);
}

export function getJoinSuggestions(tableNames = []) {
  if (!Array.isArray(tableNames) || tableNames.length === 0) return [];

  const normalizedTables = [...new Set(tableNames.map(normalizeTableName).filter(Boolean))];
  const suggestions = [];

  for (let i = 0; i < normalizedTables.length; i++) {
    for (let j = i + 1; j < normalizedTables.length; j++) {
      const from = normalizedTables[i];
      const to = normalizedTables[j];
      const path = getJoinPathBetween(from, to);

      if (path.length > 0) {
        suggestions.push({
          from_table: from,
          to_table: to,
          steps: path,
          summary: buildJoinSummary(path)
        });
      }
    }
  }

  return suggestions;
}

export function buildJoinSummary(path = []) {
  if (!Array.isArray(path) || path.length === 0) return "No join path available.";

  return path
    .map(step => {
      const joinType = step.join_type || "JOIN";
      return `${joinType} ${step.to_table} ON ${step.from_table}.${step.from_column} = ${step.to_table}.${step.to_column}`;
    })
    .join(" → ");
}

export function getSuggestedJoinSQL(tableA, tableB, aliases = {}) {
  const path = getJoinPathBetween(tableA, tableB);
  if (!path.length) return "";

  const aliasMap = aliases || {};
  const seen = new Set();
  let sql = "";

  path.forEach((step, index) => {
    const fromAlias = aliasMap[step.from_table] || step.from_table;
    const toAlias = aliasMap[step.to_table] || step.to_table;

    if (index === 0) {
      if (!seen.has(step.from_table)) {
        sql += `FROM ${step.from_table}${aliasMap[step.from_table] ? ` ${fromAlias}` : ""}\n`;
        seen.add(step.from_table);
      }
    }

    sql += `${step.join_type} ${step.to_table}${aliasMap[step.to_table] ? ` ${toAlias}` : ""} ON ${fromAlias}.${step.from_column} = ${toAlias}.${step.to_column}\n`;
    seen.add(step.to_table);
  });

  return sql.trim();
}

// --------------------------------------------------
// Query filtering helpers
// --------------------------------------------------

export function getQueriesByDifficulty(difficulty) {
  if (!difficulty) return SAMPLE_QUERIES || [];
  return (SAMPLE_QUERIES || []).filter(
    q => String(q.difficulty).toLowerCase() === String(difficulty).toLowerCase()
  );
}

export function getQueriesByTopic(topic) {
  if (!topic) return SAMPLE_QUERIES || [];
  return (SAMPLE_QUERIES || []).filter(
    q => String(q.topic).toLowerCase() === String(topic).toLowerCase()
  );
}

export function searchSampleQueries(searchText = "") {
  const term = String(searchText || "").trim().toLowerCase();
  if (!term) return SAMPLE_QUERIES || [];

  return (SAMPLE_QUERIES || []).filter(query => {
    return (
      String(query.title || "").toLowerCase().includes(term) ||
      String(query.topic || "").toLowerCase().includes(term) ||
      String(query.difficulty || "").toLowerCase().includes(term) ||
      String(query.query || "").toLowerCase().includes(term)
    );
  });
}

export function groupQueriesByDifficulty() {
  return (SAMPLE_QUERIES || []).reduce((acc, query) => {
    const key = query.difficulty || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(query);
    return acc;
  }, {});
}

export function groupQueriesByTopic() {
  return (SAMPLE_QUERIES || []).reduce((acc, query) => {
    const key = query.topic || "Unknown";
    if (!acc[key]) acc[key] = [];
    acc[key].push(query);
    return acc;
  }, {});
}

// --------------------------------------------------
// Preview helpers
// --------------------------------------------------

export function hasExpectedPreview(queryId) {
  return !!getExpectedPreview(queryId);
}

export function getPreviewColumns(queryId) {
  const preview = getExpectedPreview(queryId);
  return Array.isArray(preview?.columns) ? preview.columns : [];
}

export function getPreviewRows(queryId) {
  const preview = getExpectedPreview(queryId);
  return Array.isArray(preview?.sample_rows) ? preview.sample_rows : [];
}

export function formatPreviewAsObjects(queryId) {
  const preview = getExpectedPreview(queryId);
  if (!preview) return [];

  const columns = Array.isArray(preview.columns) ? preview.columns : [];
  const rows = Array.isArray(preview.sample_rows) ? preview.sample_rows : [];

  return rows.map(row => {
    const obj = {};
    columns.forEach((col, index) => {
      obj[col] = row?.[index] ?? null;
    });
    return obj;
  });
}

// --------------------------------------------------
// Relation helpers
// --------------------------------------------------

export function getRelationsForTable(tableName) {
  const normalized = normalizeTableName(tableName);
  if (!normalized) return [];

  return (RELATIONS || []).filter(rel => {
    return (
      normalizeTableName(rel.from_table) === normalized ||
      normalizeTableName(rel.to_table) === normalized
    );
  });
}

export function getDirectlyRelatedTables(tableName) {
  const normalized = normalizeTableName(tableName);
  if (!normalized) return [];

  const related = new Set();

  (RELATIONS || []).forEach(rel => {
    if (normalizeTableName(rel.from_table) === normalized) {
      related.add(normalizeTableName(rel.to_table));
    }
    if (normalizeTableName(rel.to_table) === normalized) {
      related.add(normalizeTableName(rel.from_table));
    }
  });

  return [...related];
}

// --------------------------------------------------
// Friendly UI helpers
// --------------------------------------------------

export function buildQueryInfoCardData(queryId) {
  const query = getSampleQueryById(queryId);
  if (!query) return null;

  return {
    id: query.id,
    title: query.title || "Untitled Query",
    difficulty: query.difficulty || "Unknown",
    topic: query.topic || "General",
    query: query.query || "",
    explanation: getQueryExplanation(query.id, query.topic),
    preview: getExpectedPreview(query.id)
  };
}

export function buildErrorInfoCardData(errorId) {
  const error = getErrorCaseById(errorId);
  if (!error) return null;

  return {
    id: error.id,
    title: error.title || "Unknown Error",
    wrong_query: error.wrong_query || "",
    why_it_fails: error.why_it_fails || "",
    corrected_query: error.corrected_query || "",
    concept: error.concept || "SQL"
  };
}

export function buildTableInfoCardData(tableName) {
  const normalized = normalizeTableName(tableName);
  if (!normalized) return null;

  return {
    table_name: normalized,
    description: getTableDescription(normalized),
    relations: getRelationsForTable(normalized),
    reachable_tables: getReachableTables(normalized)
  };
}
