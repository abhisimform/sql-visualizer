# SQL Execution Visualizer: Documentation Center

Welcome to the documentation center for the SQL Execution Visualizer project. Here you will find guides on system design, supported queries, architectural reviews, and roadmap milestones.

---

## 📚 Available Documentation

### 🛠️ Core Guides
- 📖 [Project Architecture Overview (PROJECT_NOTE.md)](./PROJECT_NOTE.md)  
  *Detailed breakdown of the core layers: Parser, Validator, Engine, Renderer, and Animation Engine.*
- 🔍 [Supported Query Catalog & Reference (QUERY_SUPPORT.md)](./QUERY_SUPPORT.md)  
  *Detailed reference of supported SQL statements, functions, operators, and current execution limits.*

### 📊 System Audit & Analysis
- 🚨 [Gap Analysis Report (GAP_ANALYSIS.md)](./GAP_ANALYSIS.md)  
  *Comprehensive review of technical debt, parser constraints, SQL semantic compliance gaps, and UI limitations.*
- 🏗️ [Architectural Audit & Data Flow (ARCHITECTURAL_AUDIT.md)](./ARCHITECTURAL_AUDIT.md)  
  *Deep dive into module responsibilities, step expansion lifecycle, row metadata lineage (`__sqlMeta`), and couplings.*

### 🚀 Future Planning
- 🗺️ [Improvement Roadmap (IMPROVEMENT_ROADMAP.md)](./IMPROVEMENT_ROADMAP.md)  
  *A phased, three-part milestone plan covering short-term code cleaning, medium-term Monaco editor integration, and long-term feature additions.*

---

## 🧬 Architectural Summary

The system is designed around a multi-stage compilation and execution pipeline:

```text
Query Text (Editor)
       │
       ▼
1. QueryParser.parse() ─────────► Raw AST Steps
                                        │
                                        ▼
2. QueryEngine.expandSteps() ───► Expanded Joins & Alias Rewrites
                                        │
                                        ▼
3. validateQuery() ─────────────► Schema & Type Verifications
                                        │
                                        ▼
4. app.js (Stepping Controller) ► Flat Display Steps (with subqueries)
                                        │
                                        ▼
5. QueryEngine.executeStep() ───► Scoped Rows (with __sqlMeta)
                                        │
                                        ▼
6. TableRenderer & Animations ──► Final Intermediate Visualization
```

For questions or details on implementing new SQL constructs, please check [PROJECT_NOTE.md](./PROJECT_NOTE.md) and [QUERY_SUPPORT.md](./QUERY_SUPPORT.md) first.
