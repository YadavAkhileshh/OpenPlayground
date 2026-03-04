const canvas = document.getElementById("networkCanvas");
const ctx = canvas.getContext("2d");

canvas.width = 900;
canvas.height = 500;

let nodes = [];
let edges = [];
let adjacency = {};
let packetPath = [];
let animIndex = 0;

class Node {
    constructor(id, x, y) {
        this.id = id;
        this.x = x;
        this.y = y;
    }
}

function generateNetwork(count = 6) {
    nodes = [];
    edges = [];
    adjacency = {};

    const radius = 200;
    const centerX = 450;
    const centerY = 250;

    for (let i = 0; i < count; i++) {
        const angle = (2 * Math.PI / count) * i;
        const x = centerX + radius * Math.cos(angle);
        const y = centerY + radius * Math.sin(angle);

        nodes.push(new Node(i, x, y));
        adjacency[i] = {};
    }

    // Randomly connect nodes
    for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
            if (Math.random() > 0.4) {
                const weight = Math.floor(Math.random() * 20) + 1;
                edges.push({ from: i, to: j, weight });
                adjacency[i][j] = weight;
                adjacency[j][i] = weight;
            }
        }
    }

    drawNetwork();
}

function dijkstra(start, end) {
    const dist = {};
    const prev = {};
    const visited = new Set();

    nodes.forEach(n => dist[n.id] = Infinity);
    dist[start] = 0;

    while (visited.size < nodes.length) {
        let u = Object.keys(dist)
            .filter(n => !visited.has(Number(n)))
            .reduce((a,b)=> dist[a] < dist[b] ? a : b);

        u = Number(u);
        visited.add(u);

        for (let neighbor in adjacency[u]) {
            let alt = dist[u] + adjacency[u][neighbor];
            if (alt < dist[neighbor]) {
                dist[neighbor] = alt;
                prev[neighbor] = u;
            }
        }
    }

    let path = [];
    let u = end;
    while (u !== undefined) {
        path.unshift(u);
        u = prev[u];
    }

    document.getElementById("cost").innerText = dist[end];
    return path;
}

function routePacket() {
    packetPath = dijkstra(0, nodes.length - 1);
    animIndex = 0;
    animatePacket();
}

function animatePacket() {
    if (animIndex >= packetPath.length - 1) return;

    drawNetwork();

    const fromNode = nodes[packetPath[animIndex]];
    const toNode = nodes[packetPath[animIndex + 1]];

    ctx.beginPath();
    ctx.moveTo(fromNode.x, fromNode.y);
    ctx.lineTo(toNode.x, toNode.y);
    ctx.strokeStyle = "#facc15";
    ctx.lineWidth = 4;
    ctx.stroke();

    animIndex++;
    setTimeout(animatePacket, 800);
}

function simulateFailure() {
    if (edges.length === 0) return;

    const removed = edges.pop();
    delete adjacency[removed.from][removed.to];
    delete adjacency[removed.to][removed.from];

    drawNetwork();
}

function drawNetwork() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    edges.forEach(edge => {
        const from = nodes[edge.from];
        const to = nodes[edge.to];

        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.strokeStyle = "#30363d";
        ctx.stroke();

        ctx.fillStyle = "#c9d1d9";
        ctx.fillText(edge.weight,
            (from.x + to.x)/2,
            (from.y + to.y)/2
        );
    });

    nodes.forEach(node => {
        ctx.beginPath();
        ctx.arc(node.x, node.y, 25, 0, 2 * Math.PI);
        ctx.fillStyle = "#58a6ff";
        ctx.fill();
        ctx.fillStyle = "black";
        ctx.fillText(node.id, node.x - 5, node.y + 5);
    });
}

generateNetwork();