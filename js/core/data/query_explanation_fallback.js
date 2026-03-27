export const QUERY_EXPLANATION_FALLBACK = {
  default_message: "This query demonstrates a SQL concept using the current practice dataset.",
  topic_hints: {
    "SELECT": "Retrieves chosen columns from one table.",
    "WHERE": "Filters rows before grouping.",
    "JOIN": "Combines related rows from multiple tables.",
    "LEFT JOIN": "Keeps all rows from the left table even if right-side match is missing.",
    "GROUP BY": "Creates grouped buckets before aggregate calculations.",
    "HAVING": "Filters grouped results after aggregation.",
    "DATE": "Uses date extraction or comparison logic.",
    "SUBQUERY": "Uses one query inside another query.",
    "CASE": "Creates conditional computed values.",
    "EXISTS": "Checks whether matching related rows exist."
  }
};