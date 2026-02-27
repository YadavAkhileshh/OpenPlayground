import { updateConnections } from './connectionManager.js';

let board = document.getElementById("board");
let nodeCount = 0;

export function createNode(text = "New Idea") {
    const node = document.createElement("div");
    node.classList.add("node");
    node.textContent = text;
    node.style.left = Math.random() * 500 + "px";
    node.style.top = Math.random() * 300 + "px";
    node.dataset.id = nodeCount++;

    board.appendChild(node);

    enableDrag(node);
    updateConnections();
}

function enableDrag(node) {
    node.addEventListener("mousedown", () => {
        node.classList.add("dragging");

        document.onmousemove = (e) => {
            node.style.left = e.pageX + "px";
            node.style.top = e.pageY + "px";
            updateConnections();
        };

        document.onmouseup = () => {
            node.classList.remove("dragging");
            document.onmousemove = null;
        };
    });
}

export function clearNodes() {
    board.innerHTML = "";
    document.getElementById("connectionLayer").innerHTML = "";
}