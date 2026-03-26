# Project Notes

## Overview
SQL Execution Visualizer is a browser-based playground that lets users run SQL-like queries on mock in-memory datasets and step through execution one clause at a time.

## System Purpose
This project is a mini SQL teaching and debugging environment.

It is designed to:
- parse SQL-like input into structured execution steps
- validate the query before running it
- execute each clause against in-memory mock tables
- render the current dataset after each step
- animate key transitions like filtering, grouping, and joins
- help users understand execution order instead of only final output

The system is not a full SQL database. It is a visual execution engine built for learning, demos, and controlled experimentation.

## Core Architecture
The app is organized into a few clear layers.

### 1. App Controller
Main file:
- `js/ui/app.js`

Responsibility:
- coordinates the full query lifecycle
- reads the query from the editor
- runs parse -> validate -> execute flow
- manages next/previous step navigation
- controls keyword/source highlighting in the query display
- controls animation on/off behavior per step
- manages nested preview steps for subqueries and source-loading previews

Think of this as the orchestration layer between UI and SQL logic.

### 2. Parser
Main file:
- `js/core/parser/query-parser.js`

Responsibility:
- converts raw SQL text into a lightweight AST-like execution step list
- identifies clauses like `SELECT`, `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `ORDER BY`, `LIMIT`, and `OFFSET`
- parses expressions such as:
  - columns
  - literals
  - arithmetic expressions
  - aggregate functions
  - list expressions
  - subqueries
  - derived tables in `FROM (...) AS alias`
- parses condition operators such as:
  - `=`, `!=`, `>`, `<`, `>=`, `<=`
  - `IN`, `NOT IN`
  - `LIKE`, `NOT LIKE`
  - `BETWEEN`, `NOT BETWEEN`
  - `IS NULL`, `IS NOT NULL`
  - `EXISTS`, `NOT EXISTS`
- parses `DISTINCT`

The parser does not execute anything. It only converts text into structured data the rest of the system can use.

### 3. Validator
Main file:
- `js/core/validator/query-validator.js`

Responsibility:
- checks whether a parsed query is valid before execution
- validates:
  - required clauses
  - clause ordering
  - table existence
  - column existence
  - alias resolution
  - ambiguous columns
  - duplicate select aliases
  - aggregate misuse
  - `HAVING` misuse
  - type mismatches
  - subquery semantics
- returns structured error objects instead of raw JS exceptions

Error shape:
```js
{
  type: "SemanticError",
  message: "Alias 'e' not found",
  location: { line: 1, column: 10 },
  suggestion: "Use a valid table alias from the FROM or JOIN clause"
}
```

This layer is what makes the system feel closer to a real SQL engine.

### 4. Execution Engine
Main file:
- `js/core/engine/query-engine.js`

Responsibility:
- executes validated steps against in-memory tables from `js/core/data/data.js`
- loads rows from one or more tables
- applies filtering, grouping, aggregation, projection, sorting, and pagination
- evaluates joins and derived tables
- resolves columns with alias-aware scope rules
- supports scalar and set subqueries
- supports correlated subqueries at runtime
- tracks structured execution errors safely

The engine is the heart of the SQL behavior.

### 5. Renderer
Main file:
- `js/ui/renderer/table-renderer.js`

Responsibility:
- renders the current dataset for the active execution step
- renders grouped results differently from flat rows
- renders error states
- updates the row/group count
- supports copy-to-clipboard for the current result set
- chooses whether to animate transitions or render instantly

This layer turns engine output into visible UI.

### 6. Animation Layer
Main file:
- `js/ui/animation/animation-engine.js`

Responsibility:
- animates row filtering/reordering transitions
- animates grouping behavior
- animates join visualization
- keeps animation concerns separate from query execution

This is purely presentation logic. It does not change SQL behavior.

### 7. Data Layer
Main file:
- `js/core/data/data.js`

Responsibility:
- stores mock tables such as `EMPLOYEES`, `DEPARTMENTS`, `CUSTOMERS`, `ORDERS`, and others
- exposes a `DATABASE` object used by the execution engine
- exposes a `QUERY_SCHEMA` object used by the validator

This is the in-memory database for the project.

### 8. Shared Constants and Utilities
Main files:
- `js/config/constants.js`
- `js/services/storage.js`

Responsibility:
- shared SQL keyword definitions
- highlight mappings
- local-storage keys
- theme persistence
- saved query persistence

## Execution Flow
At a high level, the app works like this:

1. User writes a query in the editor.
2. `app.js` sends it to the parser.
   More precisely: `js/ui/app.js` sends it to the parser.
3. The parser returns execution steps.
4. The engine expands some steps internally:
   - comma-separated `FROM` sources
   - join sources
   - derived table handling
   - some alias rewrites for `HAVING`
5. The validator checks the expanded steps.
6. If validation passes, the app prepares step navigation.
7. The user clicks `Next Step`.
8. The engine executes one step at a time.
9. The renderer displays the current dataset.
10. The animation layer optionally animates the transition.

## Query Highlighting Model
The query display is not just syntax highlighting. It is execution highlighting.

It currently supports:
- keyword highlighting by execution step
- repeated clause highlighting
- nested subquery step highlighting for non-correlated subqueries
- source highlighting for specific tables like `employees e` or `departments d`
- source-load preview highlighting for multi-table `FROM`

Important detail:
- correlated subqueries are executed with outer alias scope
- because of that, correlated subqueries are not preview-executed independently when that would break alias context

## Implemented SQL Features
- single-table queries
- multi-table queries
- table aliases
- `SELECT *`
- explicit column projection
- select aliases
- `DISTINCT`
- `WHERE`
- `GROUP BY`
- `HAVING`
- `ORDER BY`
- `LIMIT`
- `OFFSET`
- aggregate functions:
  - `COUNT`
  - `SUM`
  - `AVG`
  - `MIN`
  - `MAX`
- arithmetic expressions
- `IN`, `NOT IN`
- `LIKE`, `NOT LIKE`
- `BETWEEN`, `NOT BETWEEN`
- `IS NULL`, `IS NOT NULL`
- `EXISTS`, `NOT EXISTS`
- scalar subqueries
- correlated subqueries
- derived tables
- join variants:
  - `JOIN`
  - `INNER JOIN`
  - `LEFT JOIN`
  - `LEFT OUTER JOIN`
  - `RIGHT JOIN`
  - `RIGHT OUTER JOIN`
  - `FULL JOIN`
  - `FULL OUTER JOIN`
  - `CROSS JOIN`

## Implemented UI Features
- step-by-step query execution
- previous/next navigation
- per-step animation toggle
- dark/light theme toggle
- query persistence in local storage
- current dataset row count
- copy current result data
- error rendering inside results panel
- grouped result cards
- animated join and grouping previews

## Files and Roles
- `index.html`: page structure and UI shell
- `css/style.css`: themes, layout, table styles, highlight styles, animation-stage styling
- `js/main.js`: app bootstrap
- `js/ui/app.js`: overall controller, execution stepping, highlighting, UI coordination
- `js/core/parser/query-parser.js`: SQL text to structured steps
- `js/core/engine/query-engine.js`: clause execution logic
- `js/core/validator/query-validator.js`: validation and error generation
- `js/ui/renderer/table-renderer.js`: result rendering and copy action
- `js/ui/animation/animation-engine.js`: transition and visualization animation logic
- `js/services/storage.js`: theme/query persistence helpers
- `js/services/dev-logger.js`: developer-only structured instrumentation and log controls
- `js/config/constants.js`: keywords, mappings, storage keys
- `js/core/data/data.js`: mock data and schema
- `docs/QUERY_SUPPORT.md`: supported query families, examples, and current limitations
- `docs/README.md`: documentation entry point

## Current Structure
- `index.html`: root HTML shell
- `css/`: visual styles
- `docs/`: project documentation
- `js/core/`: parser, validator, engine, and in-memory data
- `js/ui/`: app orchestration, rendering, and animation
- `js/services/`: side-effect utilities like storage and developer logging
- `js/config/`: shared configuration and constants
- `js/main.js`: browser entry point

## Design Principles
- Keep parser, validator, engine, renderer, and animation logic separate.
- Avoid throwing raw JS errors for user-facing SQL mistakes.
- Prefer structured error objects with helpful suggestions.
- Preserve step-by-step explainability even when adding new SQL features.
- Keep UI behavior independent from core execution behavior wherever possible.
- Treat visualization as a first-class feature, not just a result table.

## UI / UX Improvements
- Responsive two-panel workspace layout.
- Safer table container so wide tables stay inside the results area.
- Separate results-panel actions area with row count and copy button.
- Icon-based copy button for compact controls.
- Improved query display chips and active-step highlighting.

## Notes
- The app is designed so UI changes stay mostly isolated in `index.html`, `css/style.css`, `js/ui/renderer/table-renderer.js`, and `js/ui/animation/animation-engine.js` without forcing changes in SQL execution logic.
- Query execution and display concerns are intentionally separated to make future refactors easier.
- `docs/QUERY_SUPPORT.md` should be updated whenever SQL capability changes.
- If a feature seems broken in the UI but works in the engine, check `js/ui/app.js` first because nested-step preview and highlight logic live there.
