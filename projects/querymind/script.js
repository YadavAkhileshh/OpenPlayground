let database = {
    users: [
        {id:1, name:"Alice", age:25},
        {id:2, name:"Bob", age:30},
        {id:3, name:"Charlie", age:22}
    ],
    orders: [
        {id:101, userId:1, total:250},
        {id:102, userId:2, total:150},
        {id:103, userId:1, total:300}
    ]
};

function executeQuery() {
    const query = document.getElementById("queryInput").value.trim();
    const planOutput = document.getElementById("planOutput");
    const resultTable = document.getElementById("resultTable");

    try {
        const parsed = parseQuery(query);
        const plan = buildExecutionPlan(parsed);
        planOutput.textContent = JSON.stringify(plan, null, 2);

        const result = executePlan(plan);
        renderTable(result, resultTable);

    } catch (err) {
        planOutput.textContent = "Error: " + err.message;
    }
}

function parseQuery(query) {
    const tokens = query.replace(/;/g,"").split(/\s+/);

    if(tokens[0].toUpperCase() !== "SELECT")
        throw new Error("Only SELECT supported");

    const fields = tokens[1] === "*" ? "*" : tokens[1].split(",");
    const table = tokens[3];

    return { type:"SELECT", fields, table };
}

function buildExecutionPlan(parsed) {
    return {
        operation: "TableScan",
        table: parsed.table,
        projection: parsed.fields
    };
}

function executePlan(plan) {
    let rows = database[plan.table];

    if(plan.projection !== "*") {
        rows = rows.map(row => {
            let obj = {};
            plan.projection.forEach(f => obj[f] = row[f]);
            return obj;
        });
    }

    return rows;
}

function renderTable(data, container) {
    container.innerHTML = "";

    if(!data || data.length === 0) return;

    const table = document.createElement("table");
    const header = document.createElement("tr");

    Object.keys(data[0]).forEach(key => {
        const th = document.createElement("th");
        th.textContent = key;
        header.appendChild(th);
    });

    table.appendChild(header);

    data.forEach(row => {
        const tr = document.createElement("tr");
        Object.values(row).forEach(val => {
            const td = document.createElement("td");
            td.textContent = val;
            tr.appendChild(td);
        });
        table.appendChild(tr);
    });

    container.appendChild(table);
}