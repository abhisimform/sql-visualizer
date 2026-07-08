# SQL Query Support Guide

This document describes what the current SQL visualizer can run today, based on the parser, validator, and execution engine in the codebase.

## Supported Query Families

### 1. Basic `SELECT ... FROM`

```sql
SELECT * FROM employees;
SELECT id, name, salary FROM employees;
SELECT name AS employee_name, salary AS pay FROM employees;
```

Supported:
- `SELECT *`
- explicit column lists
- column aliases with `AS`
- table aliases with and without `AS`
- `SELECT DISTINCT ...`

### 2. `WHERE` filtering

```sql
SELECT * FROM employees WHERE city = 'Rajkot';
SELECT * FROM employees WHERE salary >= 50000;
SELECT * FROM employees WHERE dept != 'HR';
SELECT * FROM employees WHERE name LIKE 'A%';
SELECT * FROM employees WHERE salary BETWEEN 30000 AND 50000;
SELECT * FROM employees WHERE city IS NOT NULL;
SELECT * FROM employees WHERE salary >= 40000 AND city = 'Ahmedabad';
SELECT * FROM employees WHERE city = 'Rajkot' OR city = 'Surat';
```

Supported operators:
- `=`
- `!=`
- `>`
- `<`
- `>=`
- `<=`
- `LIKE`
- `NOT LIKE`
- `BETWEEN`
- `NOT BETWEEN`
- `IS NULL`
- `IS NOT NULL`
- `IN`
- `NOT IN`
- `EXISTS`
- `NOT EXISTS`
- top-level `AND`
- top-level `OR`

### 3. `ORDER BY`

```sql
SELECT id, name, salary FROM employees ORDER BY salary;
SELECT id, name, salary FROM employees ORDER BY salary DESC;
SELECT id, name, salary AS sal FROM employees ORDER BY sal;
```

Supported:
- one or more order expressions
- `ASC`
- `DESC`
- ordering by selected aliases

### 4. `LIMIT` and `OFFSET`

```sql
SELECT * FROM employees LIMIT 5;
SELECT * FROM employees OFFSET 10;
SELECT * FROM employees ORDER BY salary DESC LIMIT 5 OFFSET 2;
```

### 5. Aggregate queries

```sql
SELECT COUNT(*) AS total_employees FROM employees;
SELECT SUM(salary) AS total_salary FROM employees;
SELECT AVG(salary) AS avg_salary FROM employees;
SELECT MIN(salary) AS min_salary, MAX(salary) AS max_salary FROM employees;
```

Supported aggregate functions:
- `COUNT(*)`
- `COUNT(column)`
- `SUM(column)`
- `AVG(column)`
- `MIN(column)`
- `MAX(column)`

### 6. `GROUP BY`

```sql
SELECT dept, COUNT(*) AS total FROM employees GROUP BY dept;
SELECT dept, SUM(salary) AS total_sal FROM employees GROUP BY dept;
SELECT city, AVG(salary) AS avg_sal FROM employees GROUP BY city;
```

Rules enforced:
- non-aggregated selected columns must appear in `GROUP BY`
- grouped output is rendered as group cards in the UI

### 7. `HAVING`

```sql
SELECT dept, SUM(salary) AS total_sal
FROM employees
GROUP BY dept
HAVING SUM(salary) > 100000;

SELECT dept AS department, SUM(salary) AS total_sal
FROM employees
GROUP BY dept
HAVING total_sal > 100000;
```

Supported:
- `HAVING` after `GROUP BY`
- aggregate expressions in `HAVING`
- `HAVING` on a `SELECT` alias such as `total_sal`

### 8. Arithmetic expressions

```sql
SELECT name, salary + 5000 AS revised_salary FROM employees;
SELECT name, salary - 2000 AS net_salary FROM employees;
SELECT name, salary * 2 AS doubled_salary FROM employees;
SELECT name, salary / 12 AS monthly_salary FROM employees;
```

Supported operators:
- `+`
- `-`
- `*`
- `/`

### 9. Table aliases

```sql
SELECT e.id, e.name, e.salary
FROM employees AS e;

SELECT e.name, e.city
FROM employees e
WHERE e.salary >= 50000;
```

### 10. Multi-table `FROM`

```sql
SELECT *
FROM employees e, departments d;
```

Supported behavior:
- comma-separated tables
- internally treated as a cross join
- alias-aware column resolution
- ambiguity detection when the same column exists in multiple sources

### 11. `JOIN`

```sql
SELECT *
FROM employees AS e
JOIN departments AS d ON d.id = e.dept_id;

SELECT e.name, d.name
FROM employees e
INNER JOIN departments d ON d.id = e.dept_id;

SELECT e.name, d.name
FROM employees e
LEFT JOIN departments d ON d.id = e.dept_id;
```

Supported join types:
- `JOIN`
- `INNER JOIN`
- `LEFT JOIN`
- `LEFT OUTER JOIN`
- `RIGHT JOIN`
- `RIGHT OUTER JOIN`
- `FULL JOIN`
- `FULL OUTER JOIN`
- `CROSS JOIN`

Join notes:
- non-cross joins require an `ON` condition
- joined results are step-animated in the visualizer when animation is enabled

### 12. Subqueries in conditions

```sql
SELECT *
FROM employees
WHERE dept_id IN (
  SELECT id
  FROM departments
);

SELECT *
FROM employees
WHERE salary > (
  SELECT AVG(salary)
  FROM employees
);

SELECT *
FROM employees e
WHERE EXISTS (
  SELECT id
  FROM departments d
  WHERE d.id = e.dept_id
);
```

Supported:
- scalar subqueries
- `IN (subquery)`
- `NOT IN (subquery)`
- correlated subqueries through outer alias visibility

Runtime rule:
- scalar subqueries must return exactly one row
- correlated subqueries execute in the engine with outer alias scope
- nested step preview is shown for non-correlated subqueries; correlated subqueries stay attached to the parent step so outer aliases like `e.dept_id` keep working

### 13. Derived tables in `FROM`

```sql
SELECT id, emp_name, sal
FROM (
  SELECT id, name AS emp_name, salary AS sal
  FROM employees
) AS sub
WHERE sal >= 50000;
```

Supported:
- `FROM (SELECT ...) AS alias`
- outer query can reference subquery output columns

## Supported Validation

The system also validates queries before execution and returns structured errors for:
- missing `SELECT`
- missing `FROM`
- clause order mistakes
- invalid table names
- invalid column names
- invalid aliases
- ambiguous columns
- duplicate select aliases
- aggregate misuse with `GROUP BY`
- `HAVING` without `GROUP BY`
- invalid function names
- invalid numeric usage in `LIMIT` and `OFFSET`
- incompatible type comparisons such as number vs string

## Example Query Catalog

### Simple filters

```sql
SELECT * FROM employees WHERE city = 'Rajkot';
SELECT * FROM employees WHERE salary >= 50000;
SELECT * FROM employees WHERE name LIKE 'A%';
SELECT * FROM employees WHERE salary BETWEEN 30000 AND 50000;
SELECT * FROM employees WHERE city IS NOT NULL;
SELECT name, city FROM customers WHERE city = 'Ahmedabad';
```

### Sorting and paging

```sql
SELECT * FROM employees ORDER BY salary DESC;
SELECT * FROM employees ORDER BY salary DESC LIMIT 5;
SELECT * FROM employees ORDER BY salary DESC LIMIT 5 OFFSET 5;
```

### Grouping and aggregates

```sql
SELECT dept, COUNT(*) AS total FROM employees GROUP BY dept;
SELECT dept, AVG(salary) AS avg_sal FROM employees GROUP BY dept;
SELECT dept, SUM(salary) AS total_sal FROM employees GROUP BY dept HAVING total_sal > 100000;
```

### Joins

```sql
SELECT e.name, d.name
FROM employees e
JOIN departments d ON d.id = e.dept_id;

SELECT e.name, d.name
FROM employees e
LEFT JOIN departments d ON d.id = e.dept_id;
```

### Subqueries

```sql
SELECT DISTINCT dept FROM employees;

SELECT *
FROM employees
WHERE dept_id IN (
  SELECT id FROM departments
);

SELECT *
FROM employees
WHERE salary > (
  SELECT AVG(salary) FROM employees
);

SELECT *
FROM employees e
WHERE EXISTS (
  SELECT id FROM departments d WHERE d.id = e.dept_id
);
```

### Derived tables

```sql
SELECT emp_name, sal
FROM (
  SELECT name AS emp_name, salary AS sal
  FROM employees
) AS sub
ORDER BY sal DESC;
```

### 14. Scalar Functions

```sql
SELECT LOWER(name) AS lower_name, UPPER(city) AS upper_city FROM employees;
SELECT ROUND(salary / 12, 2) AS monthly_salary FROM employees;
```

Supported functions:
- `LOWER(expression)`: Converts string values to lowercase.
- `UPPER(expression)`: Converts string values to uppercase.
- `ROUND(expression, decimals)`: Rounds numeric values to specified decimal places (defaults to 0).

### 15. Conditional `CASE WHEN` Projection

```sql
SELECT name,
  CASE WHEN salary > 50000 THEN 'High'
       WHEN salary > 30000 THEN 'Medium'
       ELSE 'Low'
  END AS salary_tier
FROM employees;
```

Supported:
- Multi-condition evaluation matching standard SQL precedence (first truthy WHEN clause executes).
- Optional `ELSE` fallback (returns `NULL` if not specified and no conditions match).

### 16. Parenthesized & Precedent Conditions

```sql
SELECT * FROM employees WHERE (age > 30 AND city = 'Rajkot') OR salary > 50000;
```

Supported:
- Arbitrarily nested parenthesized expressions.
- Correct operator precedence (AND executes before OR).
- Full standard SQL Three-Valued Logic (3VL) for comparisons involving `NULL` values (resolving to UNKNOWN/null).

## Current Limitations

These query types are not supported yet or are only partially supported:
- `UNION` and `UNION ALL`
- `INSERT`, `UPDATE`, `DELETE`
- `CREATE`, `ALTER`, `DROP`
- window functions
- multi-column join conditions with advanced boolean grouping

## Important SQL Rule Reminder

Some queries may still fail because they are invalid SQL, even though similar queries are supported.

Example:

```sql
SELECT id, name, salary AS sal
FROM employees
GROUP BY salary;
```

This is rejected because `id` and `name` are neither grouped nor aggregated.
