export function saveMap() {
    const nodes = [];
    document.querySelectorAll(".node").forEach(node => {
        nodes.push({
            text: node.textContent,
            left: node.style.left,
            top: node.style.top
        });
    });

    localStorage.setItem("mindmap", JSON.stringify(nodes));
}

export function loadMap() {
    const saved = JSON.parse(localStorage.getItem("mindmap"));
    if(!saved) return;

    document.getElementById("board").innerHTML = "";

    saved.forEach(data => {
        const node = document.createElement("div");
        node.classList.add("node");
        node.textContent = data.text;
        node.style.left = data.left;
        node.style.top = data.top;
        document.getElementById("board").appendChild(node);
    });
}