function saveState() {

  const data = {
    nodes: nodes.map(n => ({
      x: n.style.left,
      y: n.style.top,
      text: n.innerText,
      color: n.style.background
    })),

    connections: connections.map(c => ({
      from: nodes.indexOf(c.from),
      to: nodes.indexOf(c.to)
    }))
  };

  localStorage.setItem("mindmap", JSON.stringify(data));
}

function loadState() {

  const data = JSON.parse(localStorage.getItem("mindmap"));
  if (!data) return;

  canvas.innerHTML = "";
  svg.innerHTML = "";

  nodes = [];
  connections = [];

  data.nodes.forEach(n => {
    addNode(parseInt(n.x), parseInt(n.y), n.text, n.color);
  });

  data.connections.forEach(c => {
    connectNodes(nodes[c.from], nodes[c.to]);
  });
}

loadState();
