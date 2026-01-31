// Open Source License Checker
// Vanilla JS, HTML, CSS

const scanBtn = document.getElementById('scanBtn');
const exportBtn = document.getElementById('exportBtn');
const filterInput = document.getElementById('filterInput');
const toggleThemeBtn = document.getElementById('toggleThemeBtn');
const summary = document.getElementById('summary');
const licenseTable = document.getElementById('licenseTable').getElementsByTagName('tbody')[0];

document.body.classList.toggle('dark', localStorage.getItem('oslc_theme') === 'dark');

toggleThemeBtn.onclick = () => {
    document.body.classList.toggle('dark');
    localStorage.setItem('oslc_theme', document.body.classList.contains('dark') ? 'dark' : 'light');
};

// Demo data for UI preview
const demoLicenses = [
    { file: 'package.json', license: 'MIT', type: 'File', details: 'MIT License for main project' },
    { file: 'node_modules/react', license: 'MIT', type: 'Dependency', details: 'React library' },
    { file: 'node_modules/express', license: 'MIT', type: 'Dependency', details: 'Express library' },
    { file: 'LICENSE', license: 'MIT', type: 'File', details: 'Project root license' },
    { file: 'node_modules/lodash', license: 'MIT', type: 'Dependency', details: 'Lodash library' },
    { file: 'node_modules/some-lib', license: 'Apache-2.0', type: 'Dependency', details: 'Some-lib library' },
    { file: 'node_modules/other-lib', license: 'GPL-3.0', type: 'Dependency', details: 'Other-lib library' },
];

function renderTable(licenses) {
    licenseTable.innerHTML = '';
    licenses.forEach(l => {
        const tr = document.createElement('tr');
        tr.innerHTML = `<td>${l.file}</td><td>${l.license}</td><td>${l.type}</td><td>${l.details}</td>`;
        licenseTable.appendChild(tr);
    });
}

function renderSummary(licenses) {
    const counts = {};
    licenses.forEach(l => { counts[l.license] = (counts[l.license] || 0) + 1; });
    summary.innerHTML = `<b>Detected Licenses:</b> ` +
        Object.entries(counts).map(([lic, n]) => `${lic}: ${n}`).join(', ');
}

scanBtn.onclick = () => {
    // In a real app, scan project files and dependencies for licenses
    alert('Scanning for licenses is not supported in browser-only mode. Use a backend or WASM parser for real data.');
};

exportBtn.onclick = () => {
    const data = demoLicenses;
    const csv = [
        ['File/Dependency', 'License', 'Type', 'Details'],
        ...data.map(l => [l.file, l.license, l.type, l.details])
    ].map(row => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'license-report.csv';
    a.click();
    URL.revokeObjectURL(url);
};

filterInput.oninput = () => {
    const q = filterInput.value.toLowerCase();
    const filtered = demoLicenses.filter(l =>
        l.file.toLowerCase().includes(q) ||
        l.license.toLowerCase().includes(q)
    );
    renderTable(filtered);
    renderSummary(filtered);
};

// On load
renderTable(demoLicenses);
renderSummary(demoLicenses);
