const container = document.getElementById("treeContainer");
const output = document.getElementById("traversalOutput");

class Node {
  constructor(value) {
    this.value = value;
    this.left = null;
    this.right = null;
  }
}

let root = null;

// Insert into BST
function insert(node, value) {
  if (!node) return new Node(value);

  if (value < node.value) {
    node.left = insert(node.left, value);
  } else {
    node.right = insert(node.right, value);
  }

  return node;
}

// Traversals
function preorder(node, res = []) {
  if (!node) return res;
  res.push(node.value);
  preorder(node.left, res);
  preorder(node.right, res);
  return res;
}

function inorder(node, res = []) {
  if (!node) return res;
  inorder(node.left, res);
  res.push(node.value);
  inorder(node.right, res);
  return res;
}

function postorder(node, res = []) {
  if (!node) return res;
  postorder(node.left, res);
  postorder(node.right, res);
  res.push(node.value);
  return res;
}

// Render tree (simple recursive UI)
function renderTree(node, parentEl) {
  if (!node) return;

  const el = document.createElement("div");
  el.className = "node";
  el.textContent = node.value;
  parentEl.appendChild(el);

  const children = document.createElement("div");
  children.style.display = "flex";
  children.style.justifyContent = "center";
  children.style.width = "100%";
  parentEl.appendChild(children);

  if (node.left || node.right) {
    const left = document.createElement("div");
    const right = document.createElement("div");
    left.style.margin = "0 20px";
    right.style.margin = "0 20px";

    children.appendChild(left);
    children.appendChild(right);

    renderTree(node.left, left);
    renderTree(node.right, right);
  }
}

// Refresh UI
function updateTree() {
  container.innerHTML = "";
  renderTree(root, container);
}

// Insert event
document.getElementById("insertBtn").onclick = () => {
  const val = Number(document.getElementById("nodeValue").value);
  if (!val && val !== 0) return;

  root = insert(root, val);
  updateTree();

  document.getElementById("nodeValue").value = "";
};

// Show traversal
function showTraversal(type) {
  if (!root) return;

  let result = [];
  if (type === "pre") result = preorder(root);
  if (type === "in") result = inorder(root);
  if (type === "post") result = postorder(root);

  output.textContent = `${type.toUpperCase()} ORDER: ${result.join(" → ")}`;
}