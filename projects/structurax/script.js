const canvas = document.getElementById("memoryCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 400;

let memoryBlocks = [];
let structureData = [];
let heapCounter = 0;

function insertValue() {
    const value = document.getElementById("valueInput").value;
    const type = document.getElementById("structureType").value;

    if (!value) return;

    const address = "0x" + (heapCounter++).toString(16).padStart(4, "0");

    memoryBlocks.push({ address, value });

    if (type === "array") {
        structureData.push(address);
    }
    else if (type === "linkedlist") {
        structureData.push({ address, next: null });
        if (structureData.length > 1) {
            structureData[structureData.length - 2].next = address;
        }
    }
    else if (type === "stack") {
        structureData.push(address);
    }
    else if (type === "queue") {
        structureData.push(address);
    }

    updateHeapUsage();
    drawMemory();
}

function removeValue() {
    const type = document.getElementById("structureType").value;

    if (structureData.length === 0) return;

    let removed;

    if (type === "stack") {
        removed = structureData.pop();
    }
    else if (type === "queue") {
        removed = structureData.shift();
    }
    else {
        removed = structureData.pop();
    }

    memoryBlocks = memoryBlocks.filter(block =>
        block.address !== (removed.address || removed)
    );

    updateHeapUsage();
    drawMemory();
}

function resetMemory() {
    memoryBlocks = [];
    structureData = [];
    heapCounter = 0;
    updateHeapUsage();
    drawMemory();
}

function updateHeapUsage() {
    document.getElementById("heapUsage").innerText =
        memoryBlocks.length + " Blocks";
}

function drawMemory() {
    ctx.clearRect(0,0,canvas.width,canvas.height);

    memoryBlocks.forEach((block, index) => {
        const x = 50 + index * 120;
        const y = 200;

        ctx.fillStyle = "#22d3ee";
        ctx.fillRect(x, y, 100, 60);

        ctx.fillStyle = "black";
        ctx.fillText(block.address, x + 10, y + 20);
        ctx.fillText(block.value, x + 10, y + 40);
    });

    // Draw pointer arrows for linked list
    structureData.forEach((node, index) => {
        if (node.next) {
            const fromIndex = memoryBlocks.findIndex(b => b.address === node.address);
            const toIndex = memoryBlocks.findIndex(b => b.address === node.next);

            const x1 = 50 + fromIndex * 120 + 100;
            const x2 = 50 + toIndex * 120;

            ctx.beginPath();
            ctx.moveTo(x1, 230);
            ctx.lineTo(x2, 230);
            ctx.strokeStyle = "#facc15";
            ctx.stroke();
        }
    });
}

drawMemory();