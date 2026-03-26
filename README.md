# SQL Execution Visualizer

SQL Execution Visualizer is a browser-based learning and debugging playground that runs SQL-like queries on in-memory mock data and shows the execution one step at a time.

Instead of only showing the final result, the app helps you understand how a query is processed through `FROM`, `WHERE`, `GROUP BY`, `HAVING`, `SELECT`, `ORDER BY`, joins, subqueries, and derived tables.

## What This Project Does
- Parses SQL-like queries into structured execution steps
- Validates table names, columns, aliases, aggregates, and clause order before execution
- Executes queries against mock in-memory datasets
- Visualizes query execution step-by-step
- Highlights the currently executing clause in the query text
- Supports subquery-aware execution previews
- Animates result transitions for filtering, joins, grouping, and rendering
- Provides developer-only instrumentation through a configurable logging system

## Main Features
- Step-by-step query walkthrough with `Next` and `Previous`
- Clause execution highlighting in query order
- Nested highlighting for subqueries
- Multi-table `FROM` and join visualization
- Per-step animation toggle so animation can be turned on or off at any point
- Structured SQL validation errors with line/column suggestions
- Theme persistence and saved query persistence
- Copy current result data from the results panel

## Supported SQL
The current engine supports a focused SQL subset for teaching and visualization, including:
- `SELECT *` and explicit column projection
- column aliases and table aliases
- `DISTINCT`
- `WHERE`
- `GROUP BY`
- `HAVING`
- `ORDER BY`
- `LIMIT` and `OFFSET`
- aggregate functions like `COUNT`, `SUM`, `AVG`, `MIN`, and `MAX`
- arithmetic expressions
- `IN`, `NOT IN`
- `LIKE`, `NOT LIKE`
- `BETWEEN`, `NOT BETWEEN`
- `IS NULL`, `IS NOT NULL`
- `EXISTS`, `NOT EXISTS`
- multi-table `FROM`
- `JOIN`, `INNER JOIN`, `LEFT`, `RIGHT`, `FULL`, and `CROSS JOIN`
- scalar subqueries
- correlated subqueries
- derived tables in `FROM`

For full examples and rules, see [docs/QUERY_SUPPORT.md](./docs/QUERY_SUPPORT.md).

## How The System Is Organized
The project is split into layers so SQL logic and UI behavior stay separate:

- [js/core/parser/query-parser.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/core/parser/query-parser.js): converts SQL text into structured execution steps
- [js/core/validator/query-validator.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/core/validator/query-validator.js): validates semantics before execution
- [js/core/engine/query-engine.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/core/engine/query-engine.js): executes query steps against in-memory data
- [js/core/data/data.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/core/data/data.js): mock database tables and schema
- [js/ui/app.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/ui/app.js): main app controller and step/highlight orchestration
- [js/ui/renderer/table-renderer.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/ui/renderer/table-renderer.js): result rendering
- [js/ui/animation/animation-engine.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/ui/animation/animation-engine.js): visual transitions and animation logic
- [js/services/storage.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/services/storage.js): local storage helpers
- [js/services/dev-logger.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/services/dev-logger.js): developer logging and instrumentation flags
- [js/config/constants.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/config/constants.js): shared config and constants

## Execution Flow
At a high level, each query goes through this pipeline:

1. User enters a query in the editor.
2. The parser converts the SQL into structured steps.
3. The validator checks whether the query is semantically valid.
4. The engine executes the query clause by clause.
5. The app expands UI display steps for subqueries and source previews where needed.
6. The renderer shows the intermediate or final dataset.
7. The highlight system marks the active clause in the query text.
8. The animation layer either animates the transition or renders it instantly.

## Project Structure
```text
sql-visualizer/
├── index.html
├── css/
│   └── style.css
├── docs/
│   ├── README.md
│   ├── QUERY_SUPPORT.md
│   └── PROJECT_NOTE.md
├── js/
│   ├── core/
│   │   ├── parser/
│   │   ├── validator/
│   │   ├── engine/
│   │   └── data/
│   ├── ui/
│   │   ├── renderer/
│   │   ├── animation/
│   │   └── app.js
│   ├── services/
│   │   ├── storage.js
│   │   └── dev-logger.js
│   ├── config/
│   │   └── constants.js
│   └── main.js
└── chat.md
```

## Developer Logging
The app includes a developer-only logging system for tracing parsing, validation, execution, highlighting, rendering, and animation behavior.

Logging is controlled from:
- [js/services/dev-logger.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/services/dev-logger.js)
- [js/ui/app.js](/home/abhi.andani@simform.dom/Desktop/sql-visualizer/js/ui/app.js)

The logger supports:
- category-level flags
- module-prefixed structured console logs
- execution order logging
- a global runtime switch in the app controller

## Documentation
- [docs/README.md](./docs/README.md): docs entry point
- [docs/QUERY_SUPPORT.md](./docs/QUERY_SUPPORT.md): supported query types, examples, and validation rules
- [docs/PROJECT_NOTE.md](./docs/PROJECT_NOTE.md): detailed architecture and system behavior

## Notes
- This is a visual SQL teaching engine, not a full SQL database.
- Some advanced SQL features are still intentionally out of scope or only partially supported.
- `script.js` is currently left as a legacy file and is not part of the active module-based app flow.
