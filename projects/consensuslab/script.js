const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let nodes = [];
let leader = null;
let logs = [];

class Node {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
        this.state = "Follower";
        this.alive = true;
        this.term = 0;
        this.votes = 0;
    }
}

function initNodes(count = 5) {
    nodes = [];
    const radius = 200;
    const centerX = 450;
    const centerY = 250;

    for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI / count) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);
        nodes.push(new Node(i, x, y));
    }

    drawNetwork();
}

function log(message) {
    logs.push(message);
    const logBox = document.getElementById("logBox");
    logBox.innerHTML += message + "<br>";
    logBox.scrollTop = logBox.scrollHeight;
}

function startElection() {
    if (leader) {
        log("Leader already exists.");
        return;
    }

    const candidate = nodes.find(n => n.alive);

    if (!candidate) {
        log("No alive nodes.");
        return;
    }

    candidate.state = "Candidate";
    candidate.term++;
    candidate.votes = 1;

    log(`Node ${candidate.id} started election.`);

    nodes.forEach(n => {
        if (n !== candidate && n.alive) {
            if (Math.random() > 0.3) {
                candidate.votes++;
                log(`Node ${n.id} voted for ${candidate.id}`);
            }
        }
    });

    if (candidate.votes > nodes.length / 2) {
        candidate.state = "Leader";
        leader = candidate;
        log(`Node ${candidate.id} became Leader.`);
    } else {
        candidate.state = "Follower";
        log(`Election failed.`);
    }

    drawNetwork();
}

function simulateFailure() {
    const aliveNodes = nodes.filter(n => n.alive);

    if (aliveNodes.length === 0) return;

    const target = aliveNodes[Math.floor(Math.random() * aliveNodes.length)];
    target.alive = false;

    if (leader && leader.id === target.id) {
        log(`Leader ${target.id} failed.`);
        leader = null;
    } else {
        log(`Node ${target.id} failed.`);
    }

    drawNetwork();
}

function resetSystem() {
    leader = null;
    logs = [];
    document.getElementById("logBox").innerHTML = "";
    initNodes();
}

function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 30, 0, 2 * Math.PI);

        if (!node.alive) {
            ctx.fillStyle = "#f85149";
        } else if (node.state === "Leader") {
            ctx.fillStyle = "#2ea043";
        } else if (node.state === "Candidate") {
            ctx.fillStyle = "#d29922";
        } else {
            ctx.fillStyle = "#58a6ff";
        }

        ctx.fill();
        ctx.fillStyle = "black";
        ctx.fillText(node.id, node.x - 5, node.y + 5);
    });

    // Draw network connections
    for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.strokeStyle = "#30363d";
            ctx.stroke();
        }
    }
}

initNodes();