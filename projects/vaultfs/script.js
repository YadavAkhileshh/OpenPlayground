const DISK_SIZE = 200;
let disk = Array(DISK_SIZE).fill(null);
let fileTable = {};

function renderDisk() {
    const grid = document.getElementById("diskGrid");
    grid.innerHTML = "";

    disk.forEach((block, index) => {
        const div = document.createElement("div");
        div.classList.add("block");

        if (block !== null) {
            div.classList.add("used");
        }

        grid.appendChild(div);
    });

    renderFileTable();
}

function createFile() {
    const name = document.getElementById("fileName").value;
    const size = parseInt(document.getElementById("fileSize").value);
    const type = document.getElementById("allocationType").value;

    if (!name || !size) return;

    if (type === "contiguous") {
        allocateContiguous(name, size);
    } else if (type === "linked") {
        allocateLinked(name, size);
    } else {
        allocateIndexed(name, size);
    }

    renderDisk();
}

function allocateContiguous(name, size) {
    let start = -1;
    let count = 0;

    for (let i = 0; i < DISK_SIZE; i++) {
        if (disk[i] === null) {
            if (start === -1) start = i;
            count++;
            if (count === size) break;
        } else {
            start = -1;
            count = 0;
        }
    }

    if (count === size) {
        fileTable[name] = [];
        for (let i = start; i < start + size; i++) {
            disk[i] = name;
            fileTable[name].push(i);
        }
    }
}

function allocateLinked(name, size) {
    fileTable[name] = [];
    for (let i = 0; i < DISK_SIZE && size > 0; i++) {
        if (disk[i] === null) {
            disk[i] = name;
            fileTable[name].push(i);
            size--;
        }
    }
}

function allocateIndexed(name, size) {
    const indexBlock = disk.findIndex(b => b === null);
    if (indexBlock === -1) return;

    disk[indexBlock] = name + "_index";
    fileTable[name] = [indexBlock];

    for (let i = 0; i < DISK_SIZE && size > 0; i++) {
        if (disk[i] === null) {
            disk[i] = name;
            fileTable[name].push(i);
            size--;
        }
    }
}

function deleteFile() {
    const name = document.getElementById("fileName").value;
    if (!fileTable[name]) return;

    fileTable[name].forEach(index => {
        disk[index] = null;
    });

    delete fileTable[name];
    renderDisk();
}

function defragment() {
    const newDisk = disk.filter(b => b !== null);
    while (newDisk.length < DISK_SIZE) {
        newDisk.push(null);
    }

    disk = newDisk;
    renderDisk();
}

function renderFileTable() {
    document.getElementById("fileTable").textContent =
        JSON.stringify(fileTable, null, 2);
}

renderDisk();