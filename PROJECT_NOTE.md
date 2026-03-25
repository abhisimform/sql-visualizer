# Project Notes

## Overview
SQL Execution Visualizer is a browser-based playground that lets users run SQL-like queries on mock in-memory datasets and step through execution one clause at a time.

## Implemented Features
- Modular JavaScript structure with separate files for app flow, parsing, execution, rendering, storage, constants, and seed data.
- Query step visualizer that highlights SQL clauses in execution order.
- Correct repeated-clause highlighting, including multiple JOIN steps.
- Support for multiple tables with aliases.
- Support for JOIN variants including INNER JOIN, JOIN, LEFT JOIN, LEFT OUTER JOIN, RIGHT JOIN, RIGHT OUTER JOIN, FULL JOIN, FULL OUTER JOIN, and CROSS JOIN.
- Validation and semantic error handling for unsupported or invalid queries.
- Dataset rendering with responsive table containers and overflow-safe layout.
- Grouped result rendering for grouped datasets.
- Copy current result data action from the results panel.
- Persistent query saving using local storage.
- Light and dark theme toggle with theme persistence.
- Improved panel layout for a better editor/results balance.
- Softer light theme and refined table/panel UI styling.

## UI / UX Improvements
- Responsive two-panel workspace layout.
- Safer table container so wide tables stay inside the results area.
- Separate results-panel actions area with row count and copy button.
- Icon-based copy button for compact controls.
- Improved query display chips and active-step highlighting.

## Current Project Structure
- `index.html`: page structure and UI shell.
- `style.css`: full visual styling, layout, themes, and responsive rules.
- `js/main.js`: app bootstrap.
- `js/app.js`: main app controller and step navigation.
- `js/query-parser.js`: query parsing logic.
- `js/query-engine.js`: query execution engine.
- `js/query-validator.js`: query validation rules.
- `js/table-renderer.js`: result table rendering and copy action.
- `js/storage.js`: local storage helpers.
- `js/constants.js`: shared constants.
- `js/data.js`: mock database and schema.

## Notes
- The app is designed so UI changes stay mostly isolated in `index.html`, `style.css`, and `js/table-renderer.js` without affecting execution logic.
- Query execution and display concerns are intentionally separated to make future refactors easier.
