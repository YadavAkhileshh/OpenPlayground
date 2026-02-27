export function updateConnections() {
    const svg = document.getElementById("connectionLayer");
    svg.innerHTML = "";

    const nodes = document.querySelectorAll(".node");

    if(nodes.length < 2) return;

    const first = nodes[0];

    nodes.forEach(node => {
        if(node !== first) {
            const line = document.createElementNS("http://www.w3.org/2000/svg","line");

            line.setAttribute("x1", first.offsetLeft);
            line.setAttribute("y1", first.offsetTop);
            line.setAttribute("x2", node.offsetLeft);
            line.setAttribute("y2", node.offsetTop);
            line.setAttribute("stroke", "#ff6f91");
            line.setAttribute("stroke-width", "2");

            svg.appendChild(line);
        }
    });
}