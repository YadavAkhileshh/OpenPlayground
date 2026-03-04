class Node {
    constructor(sum, left = null, right = null) {
        this.sum = sum;
        this.left = left;
        this.right = right;
    }
}

let versions = [];
let n = 0;

function build(arr, l, r) {
    if (l === r) return new Node(arr[l]);

    const mid = Math.floor((l + r) / 2);
    const left = build(arr, l, mid);
    const right = build(arr, mid + 1, r);
    return new Node(left.sum + right.sum, left, right);
}

function update(prevNode, l, r, idx, val) {
    if (l === r) return new Node(val);

    const mid = Math.floor((l + r) / 2);
    let left = prevNode.left;
    let right = prevNode.right;

    if (idx <= mid)
        left = update(prevNode.left, l, mid, idx, val);
    else
        right = update(prevNode.right, mid + 1, r, idx, val);

    return new Node(left.sum + right.sum, left, right);
}

function query(node, l, r, ql, qr) {
    if (qr < l || ql > r) return 0;
    if (ql <= l && r <= qr) return node.sum;

    const mid = Math.floor((l + r) / 2);
    return query(node.left, l, mid, ql, qr) +
           query(node.right, mid + 1, r, ql, qr);
}

function buildTree() {
    const input = document.getElementById("arrayInput").value.trim();
    if (!input) return;

    const arr = input.split(" ").map(Number);
    n = arr.length;

    const root = build(arr, 0, n - 1);
    versions = [root];

    updateVersionSelect();
    renderTree(root);
    document.getElementById("output").innerText = "Version 0 built.";
}

function updateValueAt() {
    const idx = parseInt(document.getElementById("updateIndex").value);
    const val = parseInt(document.getElementById("updateValue").value);

    if (isNaN(idx) || isNaN(val)) return;

    const newRoot = update(
        versions[versions.length - 1],
        0, n - 1,
        idx,
        val
    );

    versions.push(newRoot);
    updateVersionSelect();
    renderTree(newRoot);

    document.getElementById("output").innerText =
        `New version ${versions.length - 1} created.`;
}

function rangeQuery() {
    const l = parseInt(document.getElementById("queryL").value);
    const r = parseInt(document.getElementById("queryR").value);
    const version = parseInt(document.getElementById("versionSelect").value);

    if (isNaN(l) || isNaN(r)) return;

    const result = query(versions[version], 0, n - 1, l, r);

    document.getElementById("output").innerText =
        `Version ${version} → Sum [${l}, ${r}] = ${result}`;
}

function updateVersionSelect() {
    const select = document.getElementById("versionSelect");
    select.innerHTML = "";

    versions.forEach((_, i) => {
        const option = document.createElement("option");
        option.value = i;
        option.text = `Version ${i}`;
        select.appendChild(option);
    });
}

function renderTree(node, depth = 0) {
    const container = document.getElementById("treeContainer");
    container.innerHTML = "";

    function dfs(n, d) {
        if (!n) return;

        const div = document.createElement("div");
        div.className = "node";
        div.style.marginLeft = d * 25 + "px";
        div.innerText = `Sum: ${n.sum}`;
        container.appendChild(div);

        dfs(n.left, d + 1);
        dfs(n.right, d + 1);
    }

    dfs(node, 0);
}