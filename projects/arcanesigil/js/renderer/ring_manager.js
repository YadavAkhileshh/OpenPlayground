/* js/renderer/ring_manager.js */

/**
 * Parses the AST tree and builds a radial (ring-based) layout model.
 */
class RingManager {
    constructor() {
        this.rings = []; // Array of arrays containing nodes at that depth
    }

    buildFromAST(ast) {
        this.rings = [];
        if (!ast) return;
        this._traverse(ast, 0);
    }

    _traverse(node, depth) {
        if (!node) return;

        // Abort if tree is too deep (Renderer constraint)
        if (depth >= CONFIG.RENDERER.MAX_RINGS) return;

        if (!this.rings[depth]) {
            this.rings[depth] = [];
        }

        // We wrap the node with visual metadata
        const visualNode = {
            astType: node.type,
            id: window.Utils.generateId(),
            children: [],
            depth: depth,
            parentLineRatio: 0 // Will be populated during layout pass
        };

        this.rings[depth].push(visualNode);

        // Sub-traversal
        const childrenNodes = this._getChildren(node);
        childrenNodes.forEach(child => {
            const returnedVisual = this._traverse(child, depth + 1);
            if (returnedVisual) {
                visualNode.children.push(returnedVisual);
            }
        });

        return visualNode;
    }

    _getChildren(node) {
        const children = [];
        // Dynamically discover children props which are ASTNodes or Arrays
        for (const key in node) {
            if (key === 'type' || key === 'left' && !node.left) continue; // Skip metadata
            const val = node[key];

            if (val instanceof window.ASTNode) {
                children.push(val);
            } else if (Array.isArray(val)) {
                val.forEach(item => {
                    if (item instanceof window.ASTNode) {
                        children.push(item);
                    }
                });
            }
        }
        return children;
    }

    getRings() {
        return this.rings;
    }
}

window.RingManager = RingManager;
