# SQL Execution Visualizer: Gap Analysis Report

This document presents a comprehensive analysis of the existing **SQL Execution Visualizer** codebase. It identifies technical debt, parser limitations, engine compliance gaps relative to standard SQL specification, validation limitations, architectural couplings, and UI/UX improvement areas.

---

## 1. Parser Gaps & Limitations

The current parser ([query-parser.js](file:///home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/core/parser/query-parser.js)) is a lightweight, custom regex-based parser. While efficient for simple SQL clauses and teaching purposes, it exhibits significant architectural gaps.

### 🔴 Key Parser Gaps

1. **Lacks a Formal Lexer/Parser AST Structure**
   - Instead of tokenizing the query and constructing a formal Abstract Syntax Tree (AST), the parser relies on custom string slicing (`splitTopLevel`, `extractClauses`) and regex matching.
   - This prevents the system from scaling to support complex SQL syntax or nested constructs.

2. **Primitive Boolean Logic Parsing**
   - The parser splits condition blocks using simple keyword matches (`AND`, `OR`) at the top level via `splitConditionParts`.
   - **Gap:** It does not support complex operator precedence or parenthesized condition nesting (e.g., `(A AND B) OR (C AND D)`). It flattens condition trees into linear arrays of clauses and connectors.

3. **Subquery Restrictions**
   - Subquery detection uses string slicing of parentheses.
   - **Gap:** Multiple subqueries within the same expression or clause (e.g., `WHERE x IN (SELECT ...) AND y IN (SELECT ...)` or `SELECT (SELECT ...) AS a, (SELECT ...) AS b`) fail to parse or execute correctly.

4. **Aggregate Expression Extraction**
   - Aggregates are parsed by detecting keywords like `SUM(`, `AVG(` etc., but the parser fails on nested expressions inside aggregate functions (e.g., `SUM(salary + bonus)` or `COUNT(DISTINCT city)`).

5. **Token Boundary & Capitalization Weaknesses**
   - Because parsing depends on case conversion and index-finding, mixed-case syntax (e.g., `group by`, `ORDER   By`) or double whitespace/tabs can sometimes cause clause extraction to break or align inaccurately in query highlights.

---

## 2. SQL Execution Engine Compliance Gaps

The execution engine ([query-engine.js](file:///home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/core/engine/query-engine.js)) runs queries in-memory against JavaScript objects. This design diverges from relational SQL standards in several critical ways.

### 🔴 Engine Compliance Gaps

1. **Lack of Three-Valued Logic (3VL) for NULL Handling**
   - In standard SQL, any comparison involving `NULL` (e.g., `salary = NULL` or `salary != NULL`) evaluates to `UNKNOWN` (effectively `null`/`undefined`), which behaves as falsy in `WHERE` filters. SQL requires `IS NULL` or `IS NOT NULL` for NULL checking.
   - **Gap:** The engine performs standard JavaScript loose equality (`==` and `!=`) in `compareValues`. This means `null == null` evaluates to `true`, which deviates from SQL specifications where `NULL = NULL` is `UNKNOWN`.

2. **Limited Join Capabilities**
   - Supports `LEFT`, `RIGHT`, `FULL`, `INNER`, and `CROSS` joins, but only handles basic single-column `ON` predicates (e.g., `ON a.id = b.id`).
   - **Gap:** Complex join conditions (e.g., non-equijoins like `ON a.val BETWEEN b.low AND b.high`, or composite conditions using `AND`/`OR`) are not supported or fail during evaluation.

3. **Missing SQL Functions and Constructs**
   - Only 5 basic aggregates are implemented (`COUNT`, `SUM`, `AVG`, `MIN`, `MAX`).
   - **Gap:** There is no support for:
     - Mathematical functions (`ROUND`, `ABS`, `CEIL`, `FLOOR`)
     - String functions (`CONCAT`, `SUBSTRING`, `LENGTH`, `LOWER`, `UPPER`)
     - Conditional control (`CASE WHEN ... THEN ... ELSE END`, `COALESCE`, `IFNULL`)
     - Set operations (`UNION`, `UNION ALL`, `INTERSECT`, `EXCEPT`)
     - Common Table Expressions (CTEs) or Window Functions (`ROW_NUMBER()`, `RANK()`)

4. **Group By Constraints & Semantic Violations**
   - The engine groups rows into a custom nested structure: `{ groupKey, count, rows, groupValues }`.
   - **Gap:** Standard SQL engines require that *all* columns in the `SELECT` list of a grouped query must either appear in the `GROUP BY` clause or be wrapped in aggregate functions. The visualizer tries to enforce this in validation, but the engine bypasses it at runtime, returning `undefined` for columns that are not aggregated or grouped instead of throwing a runtime evaluation error.

5. **Performance & Scale Gaps**
   - The engine creates in-memory Cartesian products for all joins and multi-table operations.
   - **Gap:** For larger datasets, this nested-loop implementation runs in $O(N \times M)$ complexity, which will freeze the browser tab. The engine lacks indexing, query plan optimization, or hash/sort-merge join support.

---

## 3. Query Validator Gaps

The validator ([query-validator.js](file:///home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/core/validator/query-validator.js)) performs static checks before execution. However, it lacks deep type checking and validation for advanced expressions.

### 🔴 Validator Gaps

1. **Basic Type Checking**
   - The validator checks for basic numerical comparisons, but does not perform comprehensive type checking across complex expression trees or function parameters.
   - **Gap:** Queries like `SELECT SUM(name) FROM employees` (summing a string column) do not fail validation but result in runtime `NaN` values.

2. **Subquery Validation is Superficial**
   - **Gap:** The validator does not recursively validate column signatures in correlated subqueries properly against outer scopes, which can lead to runtime reference errors if columns do not exist.

3. **Validation of LIMIT/OFFSET Constraints**
   - **Gap:** Only basic integer parsing is verified. Dynamic expressions in `LIMIT` or `OFFSET` (e.g., `LIMIT 2 + 1`) are not validated or executed.

---

## 4. Architectural & Code Quality Gaps

The visualizer codebase is split into parser, validator, engine, and UI layers, but suffers from high coupling, file bloating, and lack of testing infrastructure.

### 🔴 Code Quality & Architectural Gaps

1. **Monolithic App Controller**
   - [app.js](file:///home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/ui/app.js) is a massive file (1244 lines, ~41 KB) containing state management, view logic, highlighting patterns, event handlers, storage synchronization, and log definitions.
   - **Gap:** Tight coupling between the DOM elements and application flow makes it hard to maintain, test, or migrate to modern frameworks (e.g., React, Vue, Svelte).

2. **Total Lack of Test Coverage**
   - The project has no unit, integration, or visual regression tests.
   - **Gap:** Refactoring the parser or execution engine is extremely risky as regressions in subqueries, joins, or animations cannot be caught automatically.

3. **No Build/Packaging System**
   - The project runs on raw ES6 modules in the browser.
   - **Gap:** Lacks linting, minification, tree-shaking, or bundling. This results in numerous script requests and slow load times if more files are introduced.

---

## 5. UI/UX Gaps

The interface ([index.html](file:///home/abhi.andani@simform.dom/Desktop/sql-visualizer/index.html) and [css/style.css](file:///home/abhi.andani@simform.dom/Desktop/sql-visualizer/css/style.css)) is clean, but lacks the developer-friendly features of modern SQL playgrounds.

### 🔴 UI/UX Gaps

1. **Standard Textarea Editor**
   - The query editor is a simple HTML `<textarea>`.
   - **Gap:** There is no syntax highlighting inside the editor itself (only in the static visualization preview below), no auto-completion of table/column names, and no lint warnings as the user types.

2. **No Interactive Database Schema Explorer**
   - Users must load sample queries or open `data.js` to see what columns exist in the database.
   - **Gap:** Lack of a sidebar detailing tables, columns, types, and primary-key/foreign-key relationships limits usability.

3. **Static Mock Database**
   - The tables are hardcoded in JavaScript memory.
   - **Gap:** Users cannot run `INSERT`, `UPDATE`, `DELETE`, or `CREATE TABLE` to see how write operations alter state, nor can they import custom CSV/JSON data.

4. **Keyboard Navigation Gaps**
   - Stepping through the visualization requires clicking the mouse.
   - **Gap:** No keyboard shortcut support (e.g., `Right Arrow` for Next Step, `Left Arrow` for Prev Step) to improve accessibility.
