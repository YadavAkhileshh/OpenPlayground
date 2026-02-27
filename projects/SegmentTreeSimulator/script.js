let arr = [];
let tree = [];

function buildTree() {
  const input = document.getElementById("arrayInput").value;
  arr = input.split(",").map(Number);

  const n = arr.length;
  tree = new Array(4 * n).fill(0);

  build(1, 0, n - 1);
  renderTree();
}

function build(node, start, end) {
  if (start === end) {
    tree[node] = arr[start];
  } else {
    const mid = Math.floor((start + end) / 2);
    build(2 * node, start, mid);
    build(2 * node + 1, mid + 1, end);
    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }
}

function renderTree() {
  const container = document.getElementById("treeContainer");
  container.innerHTML = "";

  for (let i = 1; i < tree.length; i++) {
    if (tree[i] !== 0) {
      const div = document.createElement("div");
      div.className = "node";
      div.id = "node-" + i;
      div.textContent = tree[i];
      container.appendChild(div);
    }
  }
}

function rangeQuery() {
  const l = parseInt(document.getElementById("l").value);
  const r = parseInt(document.getElementById("r").value);

  clearHighlights();
  const result = query(1, 0, arr.length - 1, l, r);

  document.getElementById("result").textContent =
    "Range Sum = " + result;
}

function query(node, start, end, l, r) {
  if (r < start || end < l) return 0;

  if (l <= start && end <= r) {
    highlight(node);
    return tree[node];
  }

  const mid = Math.floor((start + end) / 2);

  const leftSum = query(2 * node, start, mid, l, r);
  const rightSum = query(2 * node + 1, mid + 1, end, l, r);

  return leftSum + rightSum;
}

function updateValueFunc() {
  const index = parseInt(document.getElementById("updateIndex").value);
  const value = parseInt(document.getElementById("updateValue").value);

  update(1, 0, arr.length - 1, index, value);
  arr[index] = value;

  renderTree();
}

function update(node, start, end, idx, val) {
  if (start === end) {
    tree[node] = val;
  } else {
    const mid = Math.floor((start + end) / 2);

    if (idx <= mid)
      update(2 * node, start, mid, idx, val);
    else
      update(2 * node + 1, mid + 1, end, idx, val);

    tree[node] = tree[2 * node] + tree[2 * node + 1];
  }
}

function highlight(node) {
  const el = document.getElementById("node-" + node);
  if (el) el.classList.add("highlight");
}

function clearHighlights() {
  document.querySelectorAll(".node").forEach(n =>
    n.classList.remove("highlight")
  );
}
