class WaveletNode {
    constructor(low, high, data) {
        this.low = low;
        this.high = high;
        this.bitmap = [];
        this.left = null;
        this.right = null;

        if (low === high || data.length === 0) return;

        const mid = Math.floor((low + high) / 2);
        const leftArr = [];
        const rightArr = [];

        for (let num of data) {
            if (num <= mid) {
                this.bitmap.push(0);
                leftArr.push(num);
            } else {
                this.bitmap.push(1);
                rightArr.push(num);
            }
        }

        this.left = new WaveletNode(low, mid, leftArr);
        this.right = new WaveletNode(mid + 1, high, rightArr);
    }
}

let root = null;

function buildTree() {
    const input = document.getElementById("arrayInput").value.trim();
    if (!input) return;

    const arr = input.split(" ").map(Number);
    const minVal = Math.min(...arr);
    const maxVal = Math.max(...arr);

    root = new WaveletNode(minVal, maxVal, arr);

    document.getElementById("output").innerText =
        `Wavelet Tree Built (Range: ${minVal} - ${maxVal})`;

    renderTree(root);
}

function renderTree(node, depth = 0) {
    if (!node) return;

    const container = document.getElementById("treeContainer");

    const div = document.createElement("div");
    div.className = "node";
    div.style.marginLeft = depth * 30 + "px";

    div.innerHTML = `
        <div><strong>Range:</strong> [${node.low}, ${node.high}]</div>
        <div class="bitmap">Bitmap: ${node.bitmap.join(" ")}</div>
    `;

    container.appendChild(div);

    renderTree(node.left, depth + 1);
    renderTree(node.right, depth + 1);
}

function clearTree() {
    root = null;
    document.getElementById("treeContainer").innerHTML = "";
    document.getElementById("output").innerText = "";
}