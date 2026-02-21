// Constants for completely custom Red-Black Tree implementation
const RB_RED = 0;
const RB_BLACK = 1;

class RedBlackNode {
    /**
     * @param {number} key - The price level
     * @param {Object} value - The PriceLevel object
     */
    constructor(key, value) {
        this.key = key;
        this.value = value;
        this.color = RB_RED; // New nodes are always red initially
        this.left = null;
        this.right = null;
        this.parent = null;
    }

    /**
     * Helper to get sibling of node
     */
    sibling() {
        if (this.parent === null) return null;
        if (this === this.parent.left) return this.parent.right;
        return this.parent.left;
    }

    /**
     * Helper to get uncle of node
     */
    uncle() {
        if (this.parent === null || this.parent.parent === null) return null;
        return this.parent.sibling();
    }
}

// Global exposure for non-module usage
window.RB_RED = RB_RED;
window.RB_BLACK = RB_BLACK;
window.RedBlackNode = RedBlackNode;
