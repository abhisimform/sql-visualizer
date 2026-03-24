const originalData = [
  { name: "Amit", age: 20, city: "Ahmedabad", salary: 25000, dept: "IT" },
  { name: "Bhavya", age: 30, city: "Surat", salary: 40000, dept: "HR" },
  { name: "Chirag", age: 40, city: "Ahmedabad", salary: 55000, dept: "IT" },
  { name: "Dhruv", age: 22, city: "Vadodara", salary: 28000, dept: "Sales" },
  { name: "Esha", age: 28, city: "Surat", salary: 35000, dept: "HR" },
  { name: "Farhan", age: 35, city: "Ahmedabad", salary: 60000, dept: "Sales" },
  { name: "Gauri", age: 26, city: "Rajkot", salary: 32000, dept: "IT" },
  { name: "Harsh", age: 31, city: "Surat", salary: 45000, dept: "Sales" },
  { name: "Isha", age: 29, city: "Rajkot", salary: 38000, dept: "HR" },
  { name: "Jatin", age: 33, city: "Vadodara", salary: 42000, dept: "IT" },
  { name: "Kavya", age: 24, city: "Surat", salary: 30000, dept: "Sales" },
  { name: "Lalit", age: 37, city: "Rajkot", salary: 65000, dept: "HR" },
  { name: "Meera", age: 27, city: "Vadodara", salary: 34000, dept: "IT" },
  { name: "Nikhil", age: 32, city: "Surat", salary: 47000, dept: "Sales" },
  { name: "Ojas", age: 23, city: "Ahmedabad", salary: 29000, dept: "IT" },
  { name: "Priya", age: 36, city: "Vadodara", salary: 58000, dept: "HR" },
  { name: "Rohan", age: 25, city: "Rajkot", salary: 31000, dept: "Sales" },
  { name: "Sana", age: 34, city: "Ahmedabad", salary: 54000, dept: "IT" },
  { name: "Tanish", age: 30, city: "Vadodara", salary: 40000, dept: "Sales" },
  { name: "Usha", age: 28, city: "Rajkot", salary: 36000, dept: "HR" }
];

let data = [];
let step = 0;

let parsedSteps = [];
let stepIndex = 0;

function startExecution() {
  const query = document.getElementById("queryInput").value;

  parsedSteps = parseQuery(query);
  stepIndex = 0;

  renderQuery(query);
  data = [];
  renderTable([]);

  // Reset button states
  updateNavButtons();
}

const steps = ["FROM", "WHERE", "SELECT", "ORDER"];

function highlight(id) {
  document.querySelectorAll(".query span").forEach(el => {
    el.classList.remove("active");
  });

  const el = document.getElementById(id);
  if (el) {
    el.classList.add("active"); // only if it exists
  } else {
    console.warn(`Keyword not found for highlighting: ${id}`);
  }
}

function renderTable(dataset) {
  const table = document.getElementById("table");
  table.innerHTML = "";

  if (dataset.length === 0) {
    document.getElementById("rowCount").innerText = "Rows: 0";
    return;
  }

  if (dataset[0].rows) {
    document.getElementById("rowCount").innerText =
      `Groups: ${dataset.length}`;

    dataset.forEach(group => {
      const groupDiv = document.createElement("div");
      groupDiv.style.border = "1px solid #334155";
      groupDiv.style.margin = "10px 0";
      groupDiv.style.padding = "10px";
      groupDiv.style.borderRadius = "8px";
      groupDiv.style.background = "#020617";

      groupDiv.innerHTML = `
  <div style="cursor:pointer;" onclick="this.nextElementSibling.classList.toggle('hidden')">
    <strong>📦 Group: ${group.groupKey} (Count: ${group.count})</strong>
  </div>
`;

      // Inner table
      const innerTable = document.createElement("table");

      if (group.rows.length > 0) {
        const headers = Object.keys(group.rows[0]);

        let headerRow = "<tr>";
        headers.forEach(h => headerRow += `<th>${h}</th>`);
        headerRow += "</tr>";

        innerTable.innerHTML += headerRow;

        group.rows.forEach(row => {
          let rowHtml = "<tr>";
          headers.forEach(h => rowHtml += `<td>${row[h]}</td>`);
          rowHtml += "</tr>";
          innerTable.innerHTML += rowHtml;
        });
      }

      groupDiv.appendChild(innerTable);
      table.appendChild(groupDiv);
    });

    return;
  }

  const headers = Object.keys(dataset[0]);

  let headerRow = "<tr>";
  headers.forEach(h => headerRow += `<th>${h}</th>`);
  headerRow += "</tr>";

  table.innerHTML += headerRow;

  dataset.forEach(row => {
    let rowHtml = "<tr>";
    headers.forEach(h => rowHtml += `<td>${row[h]}</td>`);
    rowHtml += "</tr>";
    table.innerHTML += rowHtml;
  });

  document.getElementById("rowCount").innerText = `Rows: ${dataset.length}`;
}

function updateNavButtons() {
  const prevBtn = document.querySelector("button[onclick='prevStep()']");
  const nextBtn = document.querySelector("button[onclick='nextStep()']");

  prevBtn.disabled = stepIndex === 0;
  nextBtn.disabled = stepIndex >= parsedSteps.length;
}

function prevStep() {
  if (stepIndex <= 1) {
    // Reset to empty before first step
    data = [];
    renderTable([]);
    stepIndex = 0;
    document.querySelectorAll(".query span").forEach(el => el.classList.remove("active"));
    updateNavButtons();
    return;
  }

  stepIndex -= 2; // Go back 1 step (because nextStep() will increment)
  nextStep();
  updateNavButtons();
}

function nextStep() {
  if (stepIndex >= parsedSteps.length) return;

  const step = parsedSteps[stepIndex];

  highlight(step.type.replace(" ", "_"));

  if (step.type === "FROM") {
    data = [...originalData];
  }

  if (step.type === "WHERE" && step.value) {
    const condition = step.value;

    const whereCondition = condition.split("GROUP BY")[0].trim();

    data = data.filter(row => {
      try {
        let safeCondition = whereCondition
          .replace(/\bAND\b/gi, "&&")
          .replace(/\bOR\b/gi, "||");

        safeCondition = safeCondition.replace(/\b[a-zA-Z_]\w*\b/g, match => {
          if (!isNaN(match)) return match;
          if (match.startsWith("'") || match.startsWith('"')) return match;
          return "row." + match;
        });

        return eval(safeCondition);
      } catch (e) {
        console.error("Error evaluating WHERE condition:", whereCondition, e);
        return true; // fallback: keep row
      }
    });
  }

  if (step.type === "SELECT") {

    // If grouped data
    if (data.length && data[0].rows) {

      data = data.map(group => {
        let obj = {};

        step.value.forEach(col => {
          if (col === "count(*)") {
            obj["count"] = group.count;
          } else if (col === "group") {
            obj["group"] = group.groupKey;
          }
        });

        return obj;
      });

    } else {
      // Normal SELECT
      data = data.map(row => {
        let obj = {};
        step.value.forEach(col => obj[col] = row[col]);
        return obj;
      });
    }
  }

  if (step.type === "ORDER_BY") {
    const { col, direction } = step.value;
    data.sort((a, b) => {
      if (typeof a[col] === "number") {
        return direction === "DESC"
          ? b[col] - a[col]
          : a[col] - b[col];
      }
      return direction === "DESC"
        ? b[col].localeCompare(a[col])
        : a[col].localeCompare(b[col]);
    });
  }

  if (step.type === "GROUP BY") {
    data = groupData(data, step.value);
  }

  if (step.type === "HAVING" && step.value) {
    const condition = step.value;

    data = data.filter(group => {
      try {
        return eval(condition.replace(/COUNT\(\*\)/g, group.count));
      } catch (e) {
        console.error("Error evaluating HAVING condition:", condition, e);
        return true; // fallback: keep group
      }
    });
  }

  renderTable(data);
  stepIndex++;

  updateNavButtons();
}

function groupData(data, column) {
  const groups = {};

  data.forEach(row => {
    const key = row[column];

    if (!groups[key]) {
      groups[key] = [];
    }

    groups[key].push(row);
  });

  return Object.entries(groups).map(([key, rows]) => ({
    groupKey: key,
    rows: rows,
    count: rows.length
  }));
}

function parseQuery(query) {
  const rawQuery = query;
  query = query.replace(/\n/g, " ");

  const selectMatch = query.match(/SELECT (.*?) FROM/i);
  const fromMatch = query.match(/FROM (.*?)( WHERE| ORDER BY|$)/i);
  const whereMatch = query.match(/WHERE (.*?)( ORDER BY|$)/i);
  const orderMatch = query.match(/ORDER BY (.*)$/i);
  const groupMatch = query.match(/GROUP BY (.*?)( HAVING| ORDER BY|$)/i);
  const havingMatch = query.match(/HAVING (.*?)( ORDER BY|$)/);

  const steps = [];

  if (fromMatch) {
    steps.push({ type: "FROM", value: fromMatch[1].trim() });
  }

  if (whereMatch) {
    steps.push({ type: "WHERE", value: whereMatch[1].trim() });
  }

  if (groupMatch) {
    steps.push({ type: "GROUP BY", value: groupMatch[1].trim().toLowerCase() });
  }

  if (havingMatch) {
    steps.push({ type: "HAVING", value: havingMatch[1].trim() });
  }

  if (selectMatch) {
    steps.push({
      type: "SELECT",
      value: selectMatch[1]
        .split(",")
        .map(s => s.trim().toLowerCase())
    });
  }

  if (orderMatch) {
    const orderParts = orderMatch[1].trim().split(" ");

    steps.push({
      type: "ORDER_BY",
      value: {
        col: orderParts[0].toLowerCase(),
        direction: orderParts[1]?.toUpperCase() || "ASC"
      }
    });
  }

  return steps;
}

function renderQuery(query) {
  const container = document.getElementById("queryDisplay");

  const keywords = ["SELECT", "FROM", "WHERE", "GROUP BY", "HAVING", "ORDER BY"];

  let formatted = query;

  keywords.forEach(key => {
    const regex = new RegExp(key, "gi");
    formatted = formatted.replace(regex, `<span id="${key.replace(" ", "_")}">${key}</span>`);
  });

  container.innerHTML = formatted;
}

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

function saveQuery() {
  const query = document.getElementById('queryInput').value;
  localStorage.setItem('userQuery', query);
}

document.getElementById('queryInput').addEventListener('keyup', debounce(saveQuery, 500));

window.addEventListener('load', () => {
  const savedQuery = localStorage.getItem('userQuery');
  if (savedQuery) {
    document.getElementById('queryInput').value = savedQuery;
  }
});

renderTable(originalData);
