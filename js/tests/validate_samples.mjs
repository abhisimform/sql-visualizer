// validate_samples.js
// Runs the query parser and validator over all sample queries to identify errors.

import { SAMPLE_QUERIES } from "../core/data/sampleQueries.js";
import { QueryParser } from "../core/parser/query-parser.js";
import { QueryEngine } from "../core/engine/query-engine.js";
import { validateQuery } from "../core/validator/query-validator.js";
import { DATABASE, QUERY_SCHEMA } from "../core/data/data.js";
import { setGlobalLoggingEnabled } from "../services/dev-logger.js";

setGlobalLoggingEnabled(false);

const parser = new QueryParser();
const engine = new QueryEngine({});
let errorCount = 0;

console.log("Starting validation of all sample queries...\n");

SAMPLE_QUERIES.forEach((q) => {
  const cleanQuery = q.query.replace(/;+$/, "").trim(); // strip trailing semicolons
  
  try {
    const rawAst = parser.parse(cleanQuery);
    const ast = engine.expandExecutionSteps(rawAst);
    
    // Validate AST
    const errors = validateQuery(ast, QUERY_SCHEMA, {
      rawQuery: cleanQuery,
      sampleRows: DATABASE
    });
    
    if (errors.length > 0) {
      errorCount++;
      console.log(`❌ Query ID ${q.id} ("${q.title}") has validation errors:`);
      errors.forEach((err) => {
        console.log(`   - [${err.name}] ${err.message}`);
      });
      console.log(`   SQL: ${q.query}\n`);
    }
  } catch (err) {
    errorCount++;
    console.log(`💥 Query ID ${q.id} ("${q.title}") failed to parse:`);
    console.log(`   Error: ${err.message}`);
    console.log(`   SQL: ${q.query}\n`);
  }
});

console.log(`Validation finished. Total queries with issues: ${errorCount}`);
