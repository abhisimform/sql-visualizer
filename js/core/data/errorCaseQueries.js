export const ERROR_CASE_QUERIES = [
  {
    id: 1,
    title: "Aggregate in WHERE",
    wrong_query: `SELECT dept_id, COUNT(*) FROM EMPLOYEES WHERE COUNT(*) > 2 GROUP BY dept_id;`,
    why_it_fails: "Aggregate functions like COUNT() cannot be used in WHERE because WHERE runs before grouping.",
    corrected_query: `SELECT dept_id, COUNT(*) FROM EMPLOYEES GROUP BY dept_id HAVING COUNT(*) > 2;`,
    concept: "Use HAVING for aggregate filtering"
  },
  {
    id: 2,
    title: "Missing GROUP BY for non-aggregated column",
    wrong_query: `SELECT dept_id, COUNT(*) FROM EMPLOYEES;`,
    why_it_fails: "dept_id is non-aggregated, so it should be grouped when used with COUNT().",
    corrected_query: `SELECT dept_id, COUNT(*) FROM EMPLOYEES GROUP BY dept_id;`,
    concept: "GROUP BY"
  },
  {
    id: 3,
    title: "Using alias in WHERE",
    wrong_query: `SELECT salary * 12 AS yearly_salary FROM EMPLOYEES WHERE yearly_salary > 500000;`,
    why_it_fails: "WHERE executes before SELECT alias creation, so yearly_salary alias is not available there.",
    corrected_query: `SELECT salary * 12 AS yearly_salary FROM EMPLOYEES WHERE salary * 12 > 500000;`,
    concept: "Execution order"
  },
  {
    id: 4,
    title: "Ambiguous column name",
    wrong_query: `SELECT id, name FROM EMPLOYEES JOIN DEPARTMENTS ON EMPLOYEES.dept_id = DEPARTMENTS.id;`,
    why_it_fails: "Both tables may contain column names like id or name, making them ambiguous.",
    corrected_query: `SELECT EMPLOYEES.id, EMPLOYEES.name, DEPARTMENTS.name AS department_name FROM EMPLOYEES JOIN DEPARTMENTS ON EMPLOYEES.dept_id = DEPARTMENTS.id;`,
    concept: "Qualified column references"
  },
  {
    id: 5,
    title: "Wrong join column",
    wrong_query: `SELECT * FROM EMPLOYEES e JOIN DEPARTMENTS d ON e.id = d.id;`,
    why_it_fails: "The relationship is not EMPLOYEES.id = DEPARTMENTS.id. It should use dept_id to departments.id.",
    corrected_query: `SELECT * FROM EMPLOYEES e JOIN DEPARTMENTS d ON e.dept_id = d.id;`,
    concept: "Foreign key join"
  },
  {
    id: 6,
    title: "Filtering NULL with equals",
    wrong_query: `SELECT * FROM EMPLOYEES WHERE manager_id = NULL;`,
    why_it_fails: "NULL is not compared using =. SQL uses IS NULL / IS NOT NULL.",
    corrected_query: `SELECT * FROM EMPLOYEES WHERE manager_id IS NULL;`,
    concept: "NULL handling"
  },
  {
    id: 7,
    title: "HAVING without grouping intention",
    wrong_query: `SELECT * FROM EMPLOYEES HAVING salary > 30000;`,
    why_it_fails: "HAVING is meant for grouped results or aggregates. For normal row filtering use WHERE.",
    corrected_query: `SELECT * FROM EMPLOYEES WHERE salary > 30000;`,
    concept: "WHERE vs HAVING"
  },
  {
    id: 8,
    title: "ORDER BY unknown alias",
    wrong_query: `SELECT name, salary FROM EMPLOYEES ORDER BY yearly_salary DESC;`,
    why_it_fails: "yearly_salary alias was never selected or defined.",
    corrected_query: `SELECT name, salary * 12 AS yearly_salary FROM EMPLOYEES ORDER BY yearly_salary DESC;`,
    concept: "Aliases"
  },
  {
    id: 9,
    title: "INNER JOIN when LEFT JOIN is needed",
    wrong_query: `SELECT p.name, r.rating FROM PRODUCTS p JOIN REVIEWS r ON p.id = r.product_id;`,
    why_it_fails: "It does not fail syntactically, but it hides products that have no reviews.",
    corrected_query: `SELECT p.name, r.rating FROM PRODUCTS p LEFT JOIN REVIEWS r ON p.id = r.product_id;`,
    concept: "Choosing correct join type"
  },
  {
    id: 10,
    title: "NOT IN with nullable subquery risk",
    wrong_query: `SELECT * FROM CUSTOMERS WHERE id NOT IN (SELECT referred_by_customer_id FROM CUSTOMERS);`,
    why_it_fails: "If subquery contains NULL, NOT IN can behave unexpectedly.",
    corrected_query: `SELECT * FROM CUSTOMERS c WHERE NOT EXISTS (SELECT 1 FROM CUSTOMERS c2 WHERE c2.referred_by_customer_id = c.id);`,
    concept: "NOT IN vs NOT EXISTS"
  }
];