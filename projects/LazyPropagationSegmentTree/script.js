let arr = [];
let segTree = [];
let lazy = [];
let n;

function buildTree() {
  arr = document.getElementById("arrayInput").value
    .split(",")
    .map(x => parseInt(x.trim()));

  n = arr.length;
  segTree = new Array(4 * n).fill(0);
  lazy = new Array(4 * n).fill(0);

  build(1, 0, n - 1);
  render();
}

function build(node, start, end) {
  if (start === end) {
    segTree[node] = arr[start];
  } else {
    let mid = Math.floor((start + end) / 2);
    build(2 * node, start, mid);
    build(2 * node + 1, mid + 1, end);
    segTree[node] = segTree[2 * node] + segTree[2 * node + 1];
  }
}

function rangeUpdate() {
  const l = parseInt(document.getElementById("l").value);
  const r = parseInt(document.getElementById("r").value);
  const val = parseInt(document.getElementById("val").value);

  update(1, 0, n - 1, l, r, val);
  render();
}

function update(node, start, end, l, r, val) {
  if (lazy[node] !== 0) {
    segTree[node] += (end - start + 1) * lazy[node];
    if (start !== end) {
      lazy[2 * node] += lazy[node];
      lazy[2 * node + 1] += lazy[node];
    }
    lazy[node] = 0;
  }

  if (start > r || end < l) return;

  if (start >= l && end <= r) {
    segTree[node] += (end - start + 1) * val;
    if (start !== end) {
      lazy[2 * node] += val;
      lazy[2 * node + 1] += val;
    }
    return;
  }

  let mid = Math.floor((start + end) / 2);
  update(2 * node, start, mid, l, r, val);
  update(2 * node + 1, mid + 1, end, l, r, val);
  segTree[node] = segTree[2 * node] + segTree[2 * node + 1];
}

function rangeQuery() {
  const l = parseInt(document.getElementById("l").value);
  const r = parseInt(document.getElementById("r").value);

  const result = query(1, 0, n - 1, l, r);
  document.getElementById("result").textContent =
    `Range Sum: ${result}`;
}

function query(node, start, end, l, r) {
  if (lazy[node] !== 0) {
    segTree[node] += (end - start + 1) * lazy[node];
    if (start !== end) {
      lazy[2 * node] += lazy[node];
      lazy[2 * node + 1] += lazy[node];
    }
    lazy[node] = 0;
  }

  if (start > r || end < l) return 0;

  if (start >= l && end <= r) return segTree[node];

  let mid = Math.floor((start + end) / 2);
  return (
    query(2 * node, start, mid, l, r) +
    query(2 * node + 1, mid + 1, end, l, r)
  );
}

function render() {
  const treeDiv = document.getElementById("treeDisplay");
  const lazyDiv = document.getElementById("lazyDisplay");

  treeDiv.innerHTML = "";
  lazyDiv.innerHTML = "";

  segTree.slice(1, 2 * n).forEach(val => {
    const span = document.createElement("span");
    span.textContent = val;
    treeDiv.appendChild(span);
  });

  lazy.slice(1, 2 * n).forEach(val => {
    const span = document.createElement("span");
    span.textContent = val;
    lazyDiv.appendChild(span);
  });
}
