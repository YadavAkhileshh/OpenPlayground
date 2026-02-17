class VirtualCPU {
    constructor() {
        this.init();
    }

    init() {
        this.registers = {};
        for (let i = 1; i <= 8; i++) {
            this.registers["R" + i] = 0;
        }

        this.memory = new Array(256).fill(0);
        this.pc = 0;
        this.flags = { Z: false, N: false };
        this.program = [];
        this.labels = {};
        this.running = false;
    }

    reset() {
        this.init();
        log("CPU Reset");
        render();
    }

    loadProgram(code) {
        this.program = [];
        this.labels = {};
        this.pc = 0;

        const lines = code.split("\n");

        lines.forEach(line => {
            line = line.trim();
            if (!line) return;

            if (line.endsWith(":")) {
                const label = line.replace(":", "");
                this.labels[label] = this.program.length;
            } else {
                this.program.push(line);
            }
        });
    }

    getValue(token) {
        if (token in this.registers) {
            return this.registers[token];
        }
        return parseInt(token);
    }

    step() {
        if (this.pc >= this.program.length) {
            log("Program finished.");
            return;
        }

        const instruction = this.program[this.pc];
        const parts = instruction.replace(",", "").split(" ");
        const op = parts[0];

        switch (op) {
            case "MOV":
                this.registers[parts[1]] = this.getValue(parts[2]);
                break;

            case "ADD":
                this.registers[parts[1]] += this.getValue(parts[2]);
                break;

            case "SUB":
                this.registers[parts[1]] -= this.getValue(parts[2]);
                break;

            case "CMP":
                const v1 = this.getValue(parts[1]);
                const v2 = this.getValue(parts[2]);
                this.flags.Z = (v1 === v2);
                this.flags.N = (v1 < v2);
                break;

            case "JMP":
                this.pc = this.labels[parts[1]];
                render();
                return;

            case "JE":
                if (this.flags.Z) {
                    this.pc = this.labels[parts[1]];
                    render();
                    return;
                }
                break;

            case "JNE":
                if (!this.flags.Z) {
                    this.pc = this.labels[parts[1]];
                    render();
                    return;
                }
                break;

            case "PRINT":
                log("OUTPUT: " + this.getValue(parts[1]));
                break;

            default:
                log("Unknown instruction: " + op);
        }

        this.pc++;
        render();
    }

    async run() {
        this.running = true;

        while (this.pc < this.program.length && this.running) {
            this.step();
            await new Promise(res => setTimeout(res, 300));
        }

        this.running = false;
    }
}

/* =========================
   UI + Wiring
========================= */

const cpu = new VirtualCPU();

const runBtn = document.getElementById("runBtn");
const stepBtn = document.getElementById("stepBtn");
const resetBtn = document.getElementById("resetBtn");

function log(msg) {
    const logBox = document.getElementById("log");
    logBox.textContent += msg + "\n";
    logBox.scrollTop = logBox.scrollHeight;
}

function render() {
    // Registers
    const regDiv = document.getElementById("registers");
    regDiv.innerHTML = "";

    for (let r in cpu.registers) {
        regDiv.innerHTML += `
            <div class="register">
                <strong>${r}</strong>: ${cpu.registers[r]}
            </div>
        `;
    }

    // Flags
    const flagsDiv = document.getElementById("flags");
    flagsDiv.innerHTML = `
        <div>Z: ${cpu.flags.Z}</div>
        <div>N: ${cpu.flags.N}</div>
    `;

    // PC
    document.getElementById("pc").textContent = cpu.pc;
}

/* =========================
   Button Events
========================= */

runBtn.onclick = () => {
    cpu.reset();
    cpu.loadProgram(document.getElementById("code").value);
    document.getElementById("log").textContent = "";
    cpu.run();
};

stepBtn.onclick = () => {
    if (cpu.program.length === 0) {
        cpu.loadProgram(document.getElementById("code").value);
        document.getElementById("log").textContent = "";
    }
    cpu.step();
};

resetBtn.onclick = () => {
    cpu.reset();
    document.getElementById("log").textContent = "";
};

render();
