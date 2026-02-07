const form = document.getElementById("job-form");
const tableBody = document.getElementById("application-table");

const searchInput = document.getElementById("search");
const filterStatus = document.getElementById("filter-status");
const sortBtn = document.getElementById("sort-btn");
const clearAllBtn = document.getElementById("clear-all");

let applications = JSON.parse(localStorage.getItem("applications")) || [];
let editIndex = -1;
let sortAscending = true;

// SAVE TO LOCAL STORAGE
function saveData() {
    localStorage.setItem("applications", JSON.stringify(applications));
}

// RENDER TABLE
function renderTable() {
    let filtered = [...applications];

    // SEARCH
    const term = searchInput.value.toLowerCase();
    if (term) {
        filtered = filtered.filter(
            (a) =>
                a.company.toLowerCase().includes(term) ||
                a.position.toLowerCase().includes(term)
        );
    }

    // FILTER STATUS
    if (filterStatus.value !== "All") {
        filtered = filtered.filter((a) => a.status === filterStatus.value);
    }

    // SORT BY DATE
    filtered.sort((a, b) => {
        return sortAscending
            ? new Date(a.date) - new Date(b.date)
            : new Date(b.date) - new Date(a.date);
    });

    tableBody.innerHTML = "";

    filtered.forEach((app, i) => {
        tableBody.innerHTML += `
            <tr>
                <td>${app.company}</td>
                <td>${app.position}</td>
                <td>${app.date}</td>
                <td>${app.status}</td>
                <td>
                    <button class="action-btn edit-btn" onclick="editApplication(${i})">✏️</button>
                    <button class="action-btn delete-btn" onclick="deleteApplication(${i})">🗑️</button>
                </td>
            </tr>
        `;
    });
}

// ADD / UPDATE
form.addEventListener("submit", function (e) {
    e.preventDefault();

    const company = document.getElementById("company").value.trim();
    const position = document.getElementById("position").value.trim();
    const date = document.getElementById("date").value;
    const status = document.getElementById("status").value;

    const appData = { company, position, date, status };

    if (editIndex > -1) {
        applications[editIndex] = appData;
        editIndex = -1;
    } else {
        applications.push(appData);
    }

    saveData();
    form.reset();
    renderTable();
});

// EDIT
function editApplication(i) {
    const app = applications[i];

    document.getElementById("company").value = app.company;
    document.getElementById("position").value = app.position;
    document.getElementById("date").value = app.date;
    document.getElementById("status").value = app.status;

    editIndex = i;
}

// DELETE
function deleteApplication(i) {
    if (confirm("Are you sure you want to delete this application?")) {
        applications.splice(i, 1);
        saveData();
        renderTable();
    }
}

// CLEAR ALL
clearAllBtn.addEventListener("click", () => {
    if (confirm("Delete all applications?")) {
        applications = [];
        saveData();
        renderTable();
    }
});

searchInput.addEventListener("input", renderTable);
filterStatus.addEventListener("change", renderTable);
sortBtn.addEventListener("click", () => {
    sortAscending = !sortAscending;
    renderTable();
});

// INITIAL RENDER
renderTable();
