const canvas = document.getElementById("canvas");
const svg = document.getElementById("connections");

let nodes = [];
let connections = [];
let connectStart = null;
let scale = 1;

function addNode(x = 300, y = 200, text = "New Idea", color = null) {

  const node = document.createElement("div");
  node.className = "node";
  node.contentEditable = true;
  node.innerText = text;

  node.style.left = x + "px";
  node.style.top = y + "px";

  if (color) node.style.background = color;

  canvas.appendChild(node);
  nodes.push(node);

  node.onmousedown = (e) => dragNode(e, node);
  node.onclick = (e) => selectNode(e, node);

  saveState();
}

function dragNode(e, node) {

  let offsetX = e.offsetX;
  let offsetY = e.offsetY;

  function move(ev) {
    node.style.left = (ev.pageX / scale - offsetX) + "px";
    node.style.top = (ev.pageY / scale - offsetY) + "px";
    redrawLines();
  }

  document.addEventListener("mousemove", move);

  document.addEventListener("mouseup", () => {
    document.removeEventListener("mousemove", move);
    saveState();
  }, { once: true });
}

function connectMode() {
  connectStart = null;
  alert("Click two nodes to connect them");
}

function selectNode(e, node) {

  if (!connectStart) {
    connectStart = node;
  } else {
    if (connectStart !== node) {
      connectNodes(connectStart, node);
      connectStart = null;
    }
  }
}

function connectNodes(a, b) {
  connections.push({ from: a, to: b });
  redrawLines();
  saveState();
}
