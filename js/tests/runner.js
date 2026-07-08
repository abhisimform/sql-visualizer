// runner.js
// Lightweight test runner for checking SQL Parser, Engine, and Validator behavior

import { QueryParser } from "../core/parser/query-parser.js";
import { QueryEngine } from "../core/engine/query-engine.js";

export function runTests() {
  console.log("%c[Test Runner] Starting tests...", "color: #38bdf8; font-weight: bold;");

  const results = {
    total: 0,
    passed: 0,
    failed: []
  };

  function assert(name, condition) {
    results.total += 1;
    if (condition) {
      results.passed += 1;
    } else {
      results.failed.push(name);
      console.error(`[Test Runner] FAILED: ${name}`);
    }
  }

  try {
    const parser = new QueryParser();
    const engine = new QueryEngine({});

    // ==========================================
    // 1. PARSER TESTS
    // ==========================================
    
    // Test 1: Simple conditions
    const cond1 = parser.parseCondition("age > 30 AND city = 'Rajkot'");
    assert("Simple AND condition parsing", cond1.clauses.length === 2 && cond1.connectors[0] === "AND");

    // Test 2: Nested conditions parsing
    const cond2 = parser.parseCondition("(age > 30 AND city = 'Rajkot') OR salary > 50000");
    assert("Nested condition with OR precedence", cond2.connectors[0] === "OR" && cond2.clauses[0].kind === "nested");
    assert("Inner nested clauses exist", cond2.clauses[0].condition.connectors[0] === "AND");

    // Test 3: CASE WHEN parsing
    const exprCase = parser.parseExpression("CASE WHEN salary > 50000 THEN 'High' ELSE 'Low' END");
    assert("CASE WHEN expression parsing", exprCase.kind === "case" && exprCase.cases.length === 1 && exprCase.fallback.value === "Low");

    // Test 4: Scalar functions parsing
    const exprFunc = parser.parseExpression("LOWER(name)");
    assert("LOWER scalar function parsing", exprFunc.kind === "function" && exprFunc.fn === "LOWER" && exprFunc.arguments[0].name === "name");

    // ==========================================
    // 2. ENGINE 3VL & EVALUATION TESTS
    // ==========================================
    
    // Test 5: 3VL AND gate
    assert("3VL: true AND null = null", engine.evaluateAnd(true, null) === null);
    assert("3VL: false AND null = false", engine.evaluateAnd(false, null) === false);
    assert("3VL: true AND false = false", engine.evaluateAnd(true, false) === false);

    // Test 6: 3VL OR gate
    assert("3VL: true OR null = true", engine.evaluateOr(true, null) === true);
    assert("3VL: false OR null = null", engine.evaluateOr(false, null) === null);
    assert("3VL: false OR false = false", engine.evaluateOr(false, false) === false);

    // Test 7: compareValues with null operands
    assert("3VL comparison: 5 = null is null", engine.compareValues(5, "=", null) === null);
    assert("3VL comparison: null = null is null", engine.compareValues(null, "=", null) === null);

    // Test 8: matchesCondition behavior with nulls
    const mockRow = { name: "Amit", age: null };
    const parsedCond = parser.parseCondition("age = 20");
    // age = 20 evaluates to null (UNKNOWN) since age is null. matchesCondition should return false (filtered out).
    assert("matchesCondition filters out UNKNOWN", engine.matchesCondition(mockRow, parsedCond, []) === false);

    // Test 9: CASE WHEN execution
    const mockRowForCase = { salary: 60000 };
    const resolvedCaseVal = engine.resolveExpression(mockRowForCase, exprCase, []);
    assert("CASE WHEN execution output", resolvedCaseVal === "High");

    // Test 10: Functions evaluation
    const mockRowForFunc = { name: "CHIRAG" };
    const resolvedFuncVal = engine.resolveExpression(mockRowForFunc, exprFunc, [mockRowForFunc]);
    assert("LOWER function execution output", resolvedFuncVal === "chirag");

    const exprRound = parser.parseExpression("ROUND(12.3456, 2)");
    const resolvedRoundVal = engine.resolveExpression({}, exprRound, []);
    assert("ROUND function execution output", resolvedRoundVal === 12.35);

  } catch (error) {
    console.error("[Test Runner] Exception during test execution:", error);
    assert("Test execution without exception", false);
  }

  // ==========================================
  // REPORT RESULTS
  // ==========================================
  const summaryColor = results.failed.length === 0 ? "color: #34d399;" : "color: #f87171;";
  console.log(
    `%c[Test Runner] Completed. Passed: ${results.passed} / ${results.total} tests.`,
    `${summaryColor} font-weight: bold;`
  );
  if (results.failed.length > 0) {
    console.warn("[Test Runner] Failed tests list:", results.failed);
  }
}
