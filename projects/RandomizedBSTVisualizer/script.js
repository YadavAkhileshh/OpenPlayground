class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.size = 1;
    }
}

class RandomizedBST {
    constructor() {
        this.root = null;
    }

    getSize(node) {
        return node ? node.size : 0;
    }

    updateSize(node) {
        if (node)
            node.size = 1 + this.getSize(node.left) + this.getSize(node.right);
    }

    rotateRight(y) {
        let x = y.left;
        y.left = x.right;
        x.right = y;
        this.updateSize(y);
        this.updateSize(x);
        return x;
    }

    rotateLeft(x) {
        let y = x.right;
        x.right = y.left;
        y.left = x;
        this.updateSize(x);
        this.updateSize(y);
        return y;
    }

    insertRandom(node, value) {
        if (!node) return new Node(value);

        if (Math.random() < 1 / (node.size + 1))
            return this.insertAtRoot(node, value);

        if (value < node.value)
            node.left = this.insertRandom(node.left, value);
        else if (value > node.value)
            node.right = this.insertRandom(node.right, value);

        this.updateSize(node);
        return node;
    }

    insertAtRoot(node, value) {
        if (!node) return new Node(value);

        if (value < node.value) {
            node.left = this.insertAtRoot(node.left, value);
            node = this.rotateRight(node);
        } else {
            node.right = this.insertAtRoot(node.right, value);
            node = this.rotateLeft(node);
        }
        return node;
    }

    insert(value) {
        this.root = this.insertRandom(this.root, value);
    }

    delete(node, value) {
        if (!node) return null;

        if (value < node.value)
            node.left = this.delete(node.left, value);
        else if (value > node.value)
            node.right = this.delete(node.right, value);
        else
            return this.join(node.left, node.right);

        this.updateSize(node);
        return node;
    }

    join(left, right) {
        if (!left) return right;
        if (!right) return left;

        if (Math.random() < left.size / (left.size + right.size)) {
            left.right = this.join(left.right, right);
            this.updateSize(left);
            return left;
        } else {
            right.left = this.join(left, right.left);
            this.updateSize(right);
            return right;
        }
    }

    search(node, value) {
        if (!node) return false;
        if (node.value === value) return true;
        return value < node.value
            ? this.search(node.left, value)
            : this.search(node.right, value);
    }

    inorder(node, result = []) {
        if (!node) return result;
        this.inorder(node.left, result);
        result.push(node.value);
        this.inorder(node.right, result);
        return result;
    }
}

const bst = new RandomizedBST();
const svg = document.getElementById("tree");

function insertNode() {
    const value = parseInt(document.getElementById("valueInput").value);
    if (!isNaN(value)) {
        bst.insert(value);
        drawTree();
    }
}

function deleteNode() {
    const value = parseInt(document.getElementById("valueInput").value);
    if (!isNaN(value)) {
        bst.root = bst.delete(bst.root, value);
        drawTree();
    }
}

function searchNode() {
    const value = parseInt(document.getElementById("valueInput").value);
    if (!isNaN(value)) {
        const found = bst.search(bst.root, value);
        document.getElementById("output").innerText =
            found ? "Value Found ✅" : "Value Not Found ❌";
    }
}

function inorderTraversal() {
    const result = bst.inorder(bst.root);
    document.getElementById("output").innerText =
        "Inorder: " + result.join(", ");
}

function drawTree() {
    svg.innerHTML = "";
    drawNode(bst.root, 500, 50, 200);
}

function drawNode(node, x, y, gap) {
    if (!node) return;

    if (node.left) {
        drawEdge(x, y, x - gap, y + 80);
        drawNode(node.left, x - gap, y + 80, gap / 1.7);
    }

    if (node.right) {
        drawEdge(x, y, x + gap, y + 80);
        drawNode(node.right, x + gap, y + 80, gap / 1.7);
    }

    const circle = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    circle.setAttribute("cx", x);
    circle.setAttribute("cy", y);
    circle.setAttribute("r", 20);
    circle.setAttribute("class", "node");
    svg.appendChild(circle);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", x);
    text.setAttribute("y", y);
    text.setAttribute("class", "text");
    text.textContent = node.value;
    svg.appendChild(text);
}

function drawEdge(x1, y1, x2, y2) {
    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("x1", x1);
    line.setAttribute("y1", y1);
    line.setAttribute("x2", x2);
    line.setAttribute("y2", y2);
    line.setAttribute("class", "edge");
    svg.appendChild(line);
}