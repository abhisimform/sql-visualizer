# SQL Execution Visualizer: Architectural Audit

This document reviews the structural layout, module divisions, data flow patterns, state management, and dependencies in the **SQL Execution Visualizer** codebase.

---

## 1. System Block Diagram & Layering

The codebase is structured as a single-page module-based application. Its architecture is divided into the following layers:

```
┌────────────────────────────────────────────────────────┐
│                        Viewport                        │
│   (index.html, css/style.css, table-renderer.js)       │
└───────────▲────────────────────────────────▲───────────┘
            │                                │
            │ updates view                   │ triggers events
            │                                │
┌───────────┴────────────────────────────────┴───────────┐
│                     App Controller                     │
│                       (app.js)                         │
└───────────▲────────────────────────────────┬───────────┘
            │                                │
            │ runs pipeline                  │ reads input
            │                                │
┌───────────┴───────────┐        ┌───────────▼───────────┐
│        Parser         │        │       Validator       │
│   (query-parser.js)   │        │  (query-validator.js) │
└───────────┬───────────┘        └───────────┬───────────┘
            │                                │
            │ AST steps                      │ validates AST
            │                                │
            └────────────────► ┌─────────────▼─────────┐
                               │   Execution Engine    │
                               │   (query-engine.js)   │
                               └─────────────┬─────────┘
                                             │
                                             │ accesses
                                             ▼
                               ┌───────────────────────┐
                               │     In-Memory DB      │
                               │ (database.js, data.js)│
                               └───────────────────────┘
```

### Module Responsibilities

1. **Bootstrap (`js/main.js`)**: Registers DOM listeners, instantiates the `QueryVisualizerApp`, and calls `init()`.
2. **App Controller (`js/ui/app.js`)**: The orchestration controller. Coordinates query execution, manages step indices, constructs UI display steps (flattening subquery loops), handles rendering triggers, manages highlight logic, and updates sidebar items.
3. **Parser (`js/core/parser/query-parser.js`)**: Syntactically analyzes raw text queries. Splits sections based on keyword locations and extracts expressions into lightweight JSON step representations.
4. **Validator (`js/core/validator/query-validator.js`)**: Semantic compiler layer. Enforces relational schema checks, ambiguous references, clause sequences, and aggregate syntax violations.
5. **Execution Engine (`js/core/engine/query-engine.js`)**: Processes step arrays sequentially against database structures. Appends relational metadata bindings (`__sqlMeta`) to rows so columns can be correctly resolved in subsequent join or group operations.
6. **Table Renderer (`js/ui/renderer/table-renderer.js`)**: Converts active step states (flat arrays or group-by cards) into virtual-dom style strings or tables, delegating transition requests to the animation engine.
7. **Animation Engine (`js/ui/animation/animation-engine.js`)**: Performs grid transitions, fading filtered rows, shifting reordered tables, or visualising table joins row-by-row.
8. **Mock Database (`js/core/data/database.js`)**: Emulates relational tables containing rows representing entities like Employees, Roles, Orders, or Shipments.

---

## 2. Data Flow Lifecycle

Each time a user runs a query, it executes the following synchronous pipeline:

1. **Extraction & Normalize**:
   - `app.js` retrieves text from the editor.
   - `QueryParser.parse(query)` normalizes spacing, finds clause keyword boundaries (`FROM`, `WHERE`, etc.), and returns a raw AST-like sequence of clauses.

2. **Step Expansion**:
   - The AST is fed into `QueryEngine.expandExecutionSteps()`.
   - Comma-separated tables or `JOIN` commands are expanded into standalone steps.
   - `HAVING` select-alias references are resolved down to base expressions (e.g. rewriting `HAVING total_sal > 500` to `HAVING SUM(salary) > 500`).

3. **Static Validation**:
   - `validateQuery(ast, schema, metadata)` verifies the query against `QUERY_SCHEMA`.
   - If semantic errors (e.g., table/column does not exist) or syntax violations occur, the pipeline stops, returns structured error objects, and skips execution.

4. **UI Display Step Generation**:
   - `app.js` runs `buildDisplaySteps(expandedSteps)`.
   - For subqueries (e.g., `WHERE x IN (SELECT ...)`), it registers separate subquery display states.
   - This results in a flattened sequence of step metadata ready for rendering.

5. **Stepped Execution**:
   - As the user clicks `Next Step`, `executeStep(dataset, step, scopes)` is executed by the engine.
   - Intermediate datasets are cached, and metadata bindings (`__sqlMeta`) are attached to preserve table source mapping for multi-table scopes.

6. **Render & Animate**:
   - `app.js` notifies `TableRenderer.renderTransition()`.
   - The renderer compares previous dataset snapshots with current states and executes DOM animations (filters, joins, groups) or falls back to standard table output.

---

## 3. Key Architectural Strengths

- **Decoupled Engine Core**: The `QueryEngine` is completely separated from the DOM and styling. It could be run headlessly in a Node.js console, making it easy to test or reuse.
- **Relational Lineage Mapping**: Using an internal `__sqlMeta` binding on rows is a clever way to keep table sources distinguishable (e.g. tracking `e.salary` and `d.budget` on the same merged object) without modifying user data.
- **Detailed Logging Configuration**: The inclusion of a multi-flag logger ([dev-logger.js](file:///home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/services/dev-logger.js)) allows debugging specific database flows (like `engine.joins` or `highlight.sequence`) without bloating the console with irrelevant messages.

---

## 4. Key Architectural Weaknesses & Couplings

- **Monolithic State in UI (`app.js`)**: State variables (like `executionSteps`, `steps`, `stepIndex`, `currentData`, `visibleData`, `queryError`, `previewState`) live directly inside the UI class. If the UI is rewritten, the application state must be rewritten as well.
- **Hardcoded Schema Dependency**: The validator depends directly on a static JavaScript schema (`QUERY_SCHEMA` from `database.js`). If a user wishes to query dynamic tables, the validation logic fails because it cannot fetch schemas dynamically.
- **DOM Manipulations in Animation Engine**: The animation engine queries raw DOM elements and classnames directly. This creates a tight coupling between the styles in `style.css` and the JS file, making it prone to breakage if HTML classes are altered.
