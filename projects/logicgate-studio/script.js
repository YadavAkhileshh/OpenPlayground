const canvas = document.getElementById("circuitCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 1000;
canvas.height = 500;

let gates = [];
let wires = [];
let gateCounter = 0;

class Gate {
    constructor(type, x, y) {
        this.id = gateCounter++;
        this.type = type;
        this.x = x;
        this.y = y;
        this.inputs = [];
        this.output = 0;
        this.delay = 50;
    }

    evaluate() {
        switch (this.type) {
            case "INPUT":
                return this.output;
            case "AND":
                return this.inputs.every(v => v === 1) ? 1 : 0;
            case "OR":
                return this.inputs.some(v => v === 1) ? 1 : 0;
            case "NOT":
                return this.inputs[0] === 1 ? 0 : 1;
            case "XOR":
                return this.inputs.reduce((a,b)=>a^b,0);
            default:
                return 0;
        }
    }
}

function addGate(type) {
    const x = Math.random() * 800 + 50;
    const y = Math.random() * 300 + 100;
    gates.push(new Gate(type, x, y));
    drawCircuit();
}

canvas.addEventListener("click", (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const clickedGate = gates.find(g =>
        x > g.x - 30 && x < g.x + 30 &&
        y > g.y - 20 && y < g.y + 20
    );

    if (clickedGate) {
        if (clickedGate.type === "INPUT") {
            clickedGate.output = clickedGate.output === 1 ? 0 : 1;
            propagateSignals();
        }
    }
});

function connectGates(fromId, toId) {
    wires.push({ from: fromId, to: toId });
}

function propagateSignals() {
    gates.forEach(g => {
        g.inputs = wires
            .filter(w => w.to === g.id)
            .map(w => gates.find(gt => gt.id === w.from).output);
    });

    gates.forEach(g => {
        if (g.type !== "INPUT") {
            g.output = g.evaluate();
        }
    });

    drawCircuit();
}

function generateTruthTable() {
    const inputs = gates.filter(g => g.type === "INPUT");

    if (inputs.length === 0) return;

    let consoleText = "";

    const combinations = Math.pow(2, inputs.length);

    for (let i = 0; i < combinations; i++) {
        const binary = i.toString(2).padStart(inputs.length, "0");

        binary.split("").forEach((bit, index) => {
            inputs[index].output = Number(bit);
        });

        propagateSignals();

        const outputs = gates
            .filter(g => g.type !== "INPUT")
            .map(g => g.output)
            .join(" ");

        consoleText += `${binary} -> ${outputs}\n`;
    }

    document.getElementById("console").textContent = consoleText;
}

function resetCircuit() {
    gates = [];
    wires = [];
    gateCounter = 0;
    drawCircuit();
}

function drawCircuit() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    wires.forEach(w => {
        const from = gates.find(g => g.id === w.from);
        const to = gates.find(g => g.id === w.to);

        ctx.beginPath();
        ctx.moveTo(from.x + 30, from.y);
        ctx.lineTo(to.x - 30, to.y);
        ctx.strokeStyle = "#facc15";
        ctx.stroke();
    });

    gates.forEach(g => {
        ctx.fillStyle = g.output === 1 ? "#22c55e" : "#3b82f6";
        ctx.fillRect(g.x - 30, g.y - 20, 60, 40);

        ctx.fillStyle = "black";
        ctx.fillText(g.type, g.x - 20, g.y + 5);
    });
}