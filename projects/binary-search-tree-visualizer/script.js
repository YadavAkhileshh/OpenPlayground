class Node {
    constructor(value) {
        this.value = value;
        this.left = null;
        this.right = null;
        this.x = 0;
        this.y = 0;
    }
}

class BST {
    constructor() {
        this.root = null;
    }

    insert(value) {
        const newNode = new Node(value);
        if (!this.root) {
            this.root = newNode;
            return true;
        }
        return this._insertNode(this.root, newNode);
    }

    _insertNode(node, newNode) {
        if (newNode.value < node.value) {
            if (!node.left) {
                node.left = newNode;
                return true;
            }
            return this._insertNode(node.left, newNode);
        } else if (newNode.value > node.value) {
            if (!node.right) {
                node.right = newNode;
                return true;
            }
            return this._insertNode(node.right, newNode);
        } else {
            return false; // Duplicate value
        }
    }

    delete(value) {
        this.root = this._deleteNode(this.root, value);
    }

    _deleteNode(node, value) {
        if (!node) return null;

        if (value < node.value) {
            node.left = this._deleteNode(node.left, value);
        } else if (value > node.value) {
            node.right = this._deleteNode(node.right, value);
        } else {
            // Node with only one child or no child
            if (!node.left) return node.right;
            if (!node.right) return node.left;

            // Node with two children: Get the inorder successor
            const minNode = this._findMin(node.right);
            node.value = minNode.value;
            node.right = this._deleteNode(node.right, minNode.value);
        }
        return node;
    }

    _findMin(node) {
        while (node.left) {
            node = node.left;
        }
        return node;
    }

    search(value) {
        return this._searchNode(this.root, value);
    }

    _searchNode(node, value) {
        if (!node) return false;
        if (value === node.value) return true;
        if (value < node.value) return this._searchNode(node.left, value);
        return this._searchNode(node.right, value);
    }

    inorderTraversal() {
        const result = [];
        this._inorder(this.root, result);
        return result;
    }

    _inorder(node, result) {
        if (node) {
            this._inorder(node.left, result);
            result.push(node.value);
            this._inorder(node.right, result);
        }
    }

    preorderTraversal() {
        const result = [];
        this._preorder(this.root, result);
        return result;
    }

    _preorder(node, result) {
        if (node) {
            result.push(node.value);
            this._preorder(node.left, result);
            this._preorder(node.right, result);
        }
    }

    postorderTraversal() {
        const result = [];
        this._postorder(this.root, result);
        return result;
    }

    _postorder(node, result) {
        if (node) {
            this._postorder(node.left, result);
            this._postorder(node.right, result);
            result.push(node.value);
        }
    }

    clear() {
        this.root = null;
    }
}

class BSTVisualizer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.bst = new BST();
        this.animationQueue = [];
        this.isAnimating = false;
        this.nodeRadius = 20;
        this.levelHeight = 60;
        this.setupEventListeners();
    }

    setupEventListeners() {
        document.getElementById('insertBtn').addEventListener('click', () => this.handleInsert());
        document.getElementById('deleteBtn').addEventListener('click', () => this.handleDelete());
        document.getElementById('searchBtn').addEventListener('click', () => this.handleSearch());
        document.getElementById('clearBtn').addEventListener('click', () => this.handleClear());
        document.getElementById('inorderBtn').addEventListener('click', () => this.handleTraversal('inorder'));
        document.getElementById('preorderBtn').addEventListener('click', () => this.handleTraversal('preorder'));
        document.getElementById('postorderBtn').addEventListener('click', () => this.handleTraversal('postorder'));
    }

    handleInsert() {
        const value = parseInt(document.getElementById('nodeValue').value);
        if (isNaN(value)) {
            alert('Please enter a valid number');
            return;
        }
        if (this.bst.insert(value)) {
            this.animateInsert(value);
            this.drawTree();
        } else {
            alert('Duplicate value not allowed');
        }
    }

    handleDelete() {
        const value = parseInt(document.getElementById('nodeValue').value);
        if (isNaN(value)) {
            alert('Please enter a valid number');
            return;
        }
        if (this.bst.search(value)) {
            this.animateDelete(value);
            this.bst.delete(value);
            this.drawTree();
        } else {
            alert('Value not found in the tree');
        }
    }

    handleSearch() {
        const value = parseInt(document.getElementById('nodeValue').value);
        if (isNaN(value)) {
            alert('Please enter a valid number');
            return;
        }
        const found = this.bst.search(value);
        if (found) {
            this.animateSearch(value, true);
            alert(`Value ${value} found in the tree`);
        } else {
            this.animateSearch(value, false);
            alert(`Value ${value} not found in the tree`);
        }
    }

    handleClear() {
        this.bst.clear();
        this.drawTree();
        document.getElementById('traversalResult').textContent = '';
    }

    handleTraversal(type) {
        let result;
        switch (type) {
            case 'inorder':
                result = this.bst.inorderTraversal();
                break;
            case 'preorder':
                result = this.bst.preorderTraversal();
                break;
            case 'postorder':
                result = this.bst.postorderTraversal();
                break;
        }
        document.getElementById('traversalResult').textContent = `${type.charAt(0).toUpperCase() + type.slice(1)}: ${result.join(' -> ')}`;
        this.animateTraversal(type);
    }

    drawTree() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        if (this.bst.root) {
            this._calculatePositions(this.bst.root, this.canvas.width / 2, 50, this.canvas.width / 4);
            this._drawNode(this.bst.root);
        }
    }

    _calculatePositions(node, x, y, offset) {
        if (!node) return;
        node.x = x;
        node.y = y;
        if (node.left) {
            this._calculatePositions(node.left, x - offset, y + this.levelHeight, offset / 2);
        }
        if (node.right) {
            this._calculatePositions(node.right, x + offset, y + this.levelHeight, offset / 2);
        }
    }

    _drawNode(node) {
        if (!node) return;

        // Draw edges
        if (node.left) {
            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y);
            this.ctx.lineTo(node.left.x, node.left.y);
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this._drawNode(node.left);
        }
        if (node.right) {
            this.ctx.beginPath();
            this.ctx.moveTo(node.x, node.y);
            this.ctx.lineTo(node.right.x, node.right.y);
            this.ctx.strokeStyle = '#333';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
            this._drawNode(node.right);
        }

        // Draw node
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#4CAF50';
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw value
        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.value.toString(), node.x, node.y);
    }

    animateInsert(value) {
        // Simple animation: flash the new node
        setTimeout(() => {
            this.drawTree();
            // Highlight the new node briefly
            const newNode = this._findNode(this.bst.root, value);
            if (newNode) {
                this._highlightNode(newNode, '#FF9800');
                setTimeout(() => this.drawTree(), 500);
            }
        }, 100);
    }

    animateDelete(value) {
        // Simple animation: flash before deletion
        const nodeToDelete = this._findNode(this.bst.root, value);
        if (nodeToDelete) {
            this._highlightNode(nodeToDelete, '#f44336');
            setTimeout(() => this.drawTree(), 500);
        }
    }

    animateSearch(value, found) {
        const node = this._findNode(this.bst.root, value);
        if (node) {
            this._highlightNode(node, found ? '#2196F3' : '#f44336');
            setTimeout(() => this.drawTree(), 1000);
        }
    }

    animateTraversal(type) {
        const traversal = this.bst[`${type}Traversal`]();
        let index = 0;
        const animateStep = () => {
            if (index < traversal.length) {
                const node = this._findNode(this.bst.root, traversal[index]);
                if (node) {
                    this._highlightNode(node, '#FF9800');
                    setTimeout(() => {
                        this.drawTree();
                        index++;
                        setTimeout(animateStep, 500);
                    }, 500);
                }
            }
        };
        animateStep();
    }

    _findNode(node, value) {
        if (!node) return null;
        if (node.value === value) return node;
        if (value < node.value) return this._findNode(node.left, value);
        return this._findNode(node.right, value);
    }

    _highlightNode(node, color) {
        this.ctx.beginPath();
        this.ctx.arc(node.x, node.y, this.nodeRadius, 0, 2 * Math.PI);
        this.ctx.fillStyle = color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        this.ctx.fillStyle = 'white';
        this.ctx.font = '14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(node.value.toString(), node.x, node.y);
    }
}

// Initialize the visualizer when the page loads
document.addEventListener('DOMContentLoaded', () => {
    const visualizer = new BSTVisualizer('treeCanvas');
    visualizer.drawTree();
});
