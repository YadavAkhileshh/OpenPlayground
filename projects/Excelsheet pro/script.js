/**
 * EXCEL SHEET PRO - Core Engine
 */

const app = {
    config: {
        rows: 50,
        cols: 15,
        alphabet: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        storageKey: "excel_pro_v2"
    },

    // Central Data Structure
    state: {
        activeSheet: "Sheet1",
        sheets: {
            "Sheet1": {} // Format: { "A1": { raw: "", style: {} } }
        },
        selection: "A1"
    },

    init() {
        this.loadData();
        this.renderTabs();
        this.buildGrid();
        this.attachGlobalEvents();
        console.log("ExcelSheet Pro Initialized");
    },

    /** --- Core UI Builders --- */

    buildGrid() {
        const container = document.getElementById('grid-canvas');
        container.innerHTML = ''; // Clear
        
        // Define grid template
        container.style.gridTemplateColumns = `var(--row-header-width) repeat(${this.config.cols}, 100px)`;

        // 1. Corner
        const corner = this.createEl('div', 'header corner');
        container.appendChild(corner);

        // 2. Col Headers
        for (let i = 0; i < this.config.cols; i++) {
            const ch = this.createEl('div', 'header col-header');
            ch.innerText = this.config.alphabet[i];
            container.appendChild(ch);
        }

        // 3. Rows & Cells
        for (let r = 1; r <= this.config.rows; r++) {
            const rh = this.createEl('div', 'header row-header');
            rh.innerText = r;
            container.appendChild(rh);

            for (let c = 0; c < this.config.cols; c++) {
                const cellId = `${this.config.alphabet[c]}${r}`;
                const cell = this.createCellUI(cellId);
                container.appendChild(cell);
            }
        }
    },

    createCellUI(id) {
        const div = this.createEl('div', 'cell');
        div.id = `cell-container-${id}`;
        div.dataset.id = id;

        const input = this.createEl('input');
        input.id = `input-${id}`;
        
        // Load initial data
        const cellData = this.getSafeData(id);
        input.value = this.calc.evaluate(cellData.raw, id);
        this.applyStyles(input, cellData.style);

        // Events
        input.addEventListener('focus', () => this.handleFocus(id));
        input.addEventListener('input', (e) => this.handleInput(id, e.target.value));
        input.addEventListener('blur', () => this.syncGrid());

        div.appendChild(input);
        return div;
    },

    /** --- Event Handlers --- */

    handleFocus(id) {
        // Deselect old
        if (this.state.selection) {
            document.getElementById(`cell-container-${this.state.selection}`)?.classList.remove('selected');
        }

        this.state.selection = id;
        document.getElementById(`cell-container-${id}`).classList.add('selected');
        document.getElementById('cell-address').innerText = id;

        // Show RAW formula in input while editing
        const data = this.getSafeData(id);
        const input = document.getElementById(`input-${id}`);
        input.value = data.raw;
        document.getElementById('formula-input').value = data.raw;
    },

    handleInput(id, value) {
        // Update State
        const sheet = this.state.sheets[this.state.activeSheet];
        if (!sheet[id]) sheet[id] = { raw: "", style: {} };
        sheet[id].raw = value;

        // Sync Formula Bar
        document.getElementById('formula-input').value = value;
    },

    syncGrid() {
        // Re-calculate everything when someone finishes typing
        const sheet = this.state.sheets[this.state.activeSheet];
        Object.keys(sheet).forEach(id => {
            const input = document.getElementById(`input-${id}`);
            if (input && document.activeElement !== input) {
                input.value = this.calc.evaluate(sheet[id].raw, id);
            }
        });
        this.saveData();
    },

    /** --- Formula Parser --- */
    calc: {
        evaluate(val, selfId) {
            if (!val || !val.toString().startsWith('=')) return val;
            
            try {
                let formula = val.substring(1).toUpperCase();

                // SUM/AVG/COUNT support
                formula = formula.replace(/(SUM|AVG|COUNT|MAX)\(([A-Z]\d+):([A-Z]\d+)\)/g, (m, fn, start, end) => {
                    const range = app.calc.getRange(start, end);
                    if (fn === 'SUM') return range.reduce((a, b) => a + b, 0);
                    if (fn === 'AVG') return range.length ? (range.reduce((a, b) => a + b, 0) / range.length) : 0;
                    if (fn === 'COUNT') return range.length;
                    if (fn === 'MAX') return Math.max(...range);
                });

                // Single Cell Reference support
                formula = formula.replace(/[A-Z]\d+/g, (ref) => {
                    if (ref === selfId) return 0; // Recursive loop safety
                    const cellVal = app.getSafeData(ref).raw;
                    const res = app.calc.evaluate(cellVal, ref);
                    return isNaN(parseFloat(res)) ? 0 : parseFloat(res);
                });

                // Math eval
                return eval(formula);
            } catch (e) {
                return "#ERR!";
            }
        },

        getRange(start, end) {
            const sCol = app.config.alphabet.indexOf(start[0]);
            const sRow = parseInt(start.substring(1));
            const eCol = app.config.alphabet.indexOf(end[0]);
            const eRow = parseInt(end.substring(1));

            let vals = [];
            for (let r = sRow; r <= eRow; r++) {
                for (let c = sCol; c <= eCol; c++) {
                    const id = `${app.config.alphabet[c]}${r}`;
                    const raw = app.getSafeData(id).raw;
                    const computed = app.calc.evaluate(raw, id);
                    if (!isNaN(parseFloat(computed))) vals.push(parseFloat(computed));
                }
            }
            return vals;
        }
    },

    /** --- Helpers --- */
    getSafeData(id) {
        const sheet = this.state.sheets[this.state.activeSheet];
        return sheet[id] || { raw: "", style: {} };
    },

    createEl(tag, className) {
        const el = document.createElement(tag);
        if (className) el.className = className;
        return el;
    },

    applyStyles(el, style) {
        if (!style) return;
        el.style.fontWeight = style.bold ? 'bold' : 'normal';
        el.style.fontStyle = style.italic ? 'italic' : 'normal';
        el.style.textDecoration = style.underline ? 'underline' : 'none';
        if (style.bg) el.parentElement.style.backgroundColor = style.bg;
        if (style.color) el.style.color = style.color;
    },

    format(type, val) {
        const id = this.state.selection;
        const data = this.getSafeData(id);
        const sheet = this.state.sheets[this.state.activeSheet];
        
        if (!sheet[id]) sheet[id] = { raw: "", style: {} };
        
        if (type === 'bold') sheet[id].style.bold = !sheet[id].style.bold;
        if (type === 'italic') sheet[id].style.italic = !sheet[id].style.italic;
        if (type === 'underline') sheet[id].style.underline = !sheet[id].style.underline;
        if (type === 'bg') sheet[id].style.bg = val;
        if (type === 'color') sheet[id].style.color = val;

        this.applyStyles(document.getElementById(`input-${id}`), sheet[id].style);
        this.saveData();
    },

    sheets: {
        create() {
            const name = prompt("Enter Sheet Name:");
            if (name && !app.state.sheets[name]) {
                app.state.sheets[name] = {};
                app.state.activeSheet = name;
                app.renderTabs();
                app.buildGrid();
            }
        },
        switch(name) {
            app.state.activeSheet = name;
            app.renderTabs();
            app.buildGrid();
        }
    },

    renderTabs() {
        const container = document.getElementById('tabs-container');
        container.innerHTML = "";
        Object.keys(this.state.sheets).forEach(name => {
            const tab = app.createEl('div', `tab-item ${app.state.activeSheet === name ? 'active' : ''}`);
            tab.innerText = name;
            tab.onclick = () => app.sheets.switch(name);
            container.appendChild(tab);
        });
    },

    actions: {
        exportCSV() {
            let csv = "";
            const sheet = app.state.sheets[app.state.activeSheet];
            for (let r = 1; r <= app.config.rows; r++) {
                let row = [];
                for (let c = 0; c < app.config.cols; c++) {
                    const id = `${app.config.alphabet[c]}${r}`;
                    const raw = sheet[id] ? sheet[id].raw : "";
                    row.push(`"${app.calc.evaluate(raw, id)}"`);
                }
                csv += row.join(",") + "\n";
            }
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = "spreadsheet.csv";
            a.click();
        },
        clearAll() {
            if (confirm("Clear all data in this sheet?")) {
                app.state.sheets[app.state.activeSheet] = {};
                app.buildGrid();
                app.saveData();
            }
        }
    },

    storage: {
        exportJSON() {
            const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(app.state));
            const a = document.createElement('a');
            a.setAttribute("href", dataStr);
            a.setAttribute("download", "excel_backup.json");
            a.click();
        }
    },

    saveData() { localStorage.setItem(this.config.storageKey, JSON.stringify(this.state)); },
    loadData() {
        const saved = localStorage.getItem(this.config.storageKey);
        if (saved) this.state = JSON.parse(saved);
    },

    attachGlobalEvents() {
        // Sync formula bar input back to cell
        document.getElementById('formula-input').addEventListener('input', (e) => {
            const id = this.state.selection;
            const input = document.getElementById(`input-${id}`);
            if (input) {
                input.value = e.target.value;
                this.handleInput(id, e.target.value);
            }
        });
    }
};

app.init();