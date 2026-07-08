# SQL Execution Visualizer: Improvement Roadmap

This roadmap outlines recommended upgrades for the **SQL Execution Visualizer** project. It is structured into short-term, medium-term, and long-term milestones.

---

## Phase 1: Short-Term Enhancements (Immediate / Code Health)

These tasks address immediate gaps in code structure, validation constraints, and basic user interactions without requiring rewrites of the core parser or engine.

### 1. Code-Split the App Controller
- **Problem**: `app.js` is over 1,200 lines and mixes DOM manipulation, storage synchronization, and pipeline state.
- **Action**: Extract state management into a dedicated `QueryState` or `QuerySession` class. Let `app.js` act strictly as a controller coordinating the UI.

### 2. Implement Keypress Stepping
- **Problem**: Users must click buttons to navigate steps, which slows down walkthroughs.
- **Action**: Add keyboard listeners to `index.html`:
  - `Right Arrow` / `Space` $\rightarrow$ Next Step.
  - `Left Arrow` $\rightarrow$ Previous Step.
  - `Enter` (while focused on text field with Ctrl/Cmd) $\rightarrow$ Run Query.

### 3. Add Unit Testing Framework
- **Problem**: No automated tests exist, making updates to the parser, validator, or engine risky.
- **Action**: Introduce a lightweight testing framework (like Vitest, Jest, or standard Web Test Runner) and create unit tests for:
  - Condition parsing and operator matching.
  - Join row merging correctness (including Left, Right, and Full Joins).
  - Ambiguity detection in the query validator.

### 4. Enhance Validator Type Checking
- **Problem**: The validator does not block summing string columns or performing invalid calculations.
- **Action**: Update `query-validator.js` to verify type requirements:
  - `SUM` and `AVG` arguments must resolve to numerical columns.
  - Date functions (if added) must resolve to date columns.

---

## Phase 2: Medium-Term Features (UX & Optimization)

These tasks focus on upgrading the user interface and optimizing intermediate dataset execution.

### 1. Introduce Monaco or CodeMirror Editor
- **Problem**: Writing SQL in a basic textarea feels clunky and lacks helpful editor tools.
- **Action**: Embed [Monaco Editor](https://microsoft.github.io/monaco-editor/) or [CodeMirror](https://codemirror.net/). Configure it to support:
  - Basic SQL syntax highlighting.
  - Autocomplete for table names and columns using the static `QUERY_SCHEMA`.
  - Inline error markers (squiggles) showing exactly where validation errors occur.

### 2. Interactive Schema & Relationship Diagram
- **Problem**: Users cannot see how tables relate to each other without looking at the sample queries.
- **Action**: Create a visual "Schema Sidebar" displaying table schemas.
  - Implement a collapsible panel showcasing tables, column names, and data types.
  - Show relational connections (Primary/Foreign Key lines) based on relationships defined in `joinPaths.js`.

### 3. Query Plan & Cost Estimation Preview
- **Problem**: The app visualizes execution steps, but does not teach users about query cost or performance.
- **Action**: Add a "Query Optimizer" simulation tab.
  - Analyze the step sequence and estimate the number of operations (e.g. Cartesian product size, filter size).
  - Highlight potential performance bottlenecks, such as missing indexes on joins or unnecessary nested cross-joins.

### 4. NULL Optimization and 3VL Compliance
- **Problem**: Engine comparisons do not follow standard SQL three-valued logic.
- **Action**: Rewrite comparison methods in `query-engine.js` to adhere to SQL specs:
  - Ensure operations like `null == X` evaluate to `null` (UNKNOWN) rather than JS boolean states, and filter them out accordingly unless using `IS NULL`.

---

## Phase 3: Long-Term Milestones (Extended SQL & Write State)

These milestones expand the visualizer into a broader database engine tool.

### 1. Support `CASE WHEN ... THEN ... ELSE END`
- **Action**: Update parser and expression execution to handle conditional expressions, allowing users to project custom columns dynamically.

### 2. Support `UNION` / `UNION ALL` / `INTERSECT` / `EXCEPT`
- **Action**: Add set operations to the engine. Visualize these steps as Venn diagrams or table concatenations in the results area.

### 3. Write Operation Walkthroughs (`INSERT`, `UPDATE`, `DELETE`)
- **Action**: Allow users to run data manipulation queries.
  - Visualize how rows are appended, mutated, or removed from tables in real-time.
  - Reset database state to mock defaults via a single-click restore option.

### 4. Custom CSV/JSON Import
- **Action**: Let users upload their own CSV files.
  - Dynamically infer schemas from files and load them into the visual database instance so they can experiment on their own datasets.
