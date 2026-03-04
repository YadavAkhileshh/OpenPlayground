/**
 * Decision-Tree-Guess Logic
 * Implements a mutable Binary Tree for the game AI.
 */

// --- Node Class ---
class Node {
    constructor(val) {
        this.val = val; // Question or Object Name
        this.yes = null; // Left Child
        this.no = null;  // Right Child
        this.isObject = true; // Is it a leaf?
        this.id = Math.random().toString(36).substr(2, 9); // For visualizer
    }
}

// --- Game Engine ---
class AkinatorGame {
    constructor() {
        this.root = new Node("Is it a living thing?");
        // Initialize simple tree 
        this.root.isObject = false;
        this.root.yes = new Node("Dog");
        this.root.no = new Node("Rock");

        this.currentNode = this.root;
        this.parentNode = null;
        this.lastDirection = null; // 'yes' or 'no'
        
        this.ui = {
            questionText: document.getElementById('question-text'),
            nodeCount: document.getElementById('node-count'),
            treeContainer: document.getElementById('tree-container'),
            views: {
                question: document.getElementById('question-view'),
                learning: document.getElementById('learning-view'),
                result: document.getElementById('result-view')
            },
            learning: {
                objInput: document.getElementById('new-object'),
                qInput: document.getElementById('new-question'),
                oldGuess: document.getElementById('old-guess-display'),
                objLabel: document.getElementById('new-obj-label')
            }
        };

        this.renderTree();
        this.updateStats();
    }

    // --- Core Gameplay ---

    answer(isYes) {
        if (this.currentNode.isObject) {
            // It was a guess
            if (isYes) {
                this.showResult("I knew it! I'm a genius.", true);
            } else {
                this.startLearning();
            }
        } else {
            // It was a question, traverse
            this.parentNode = this.currentNode;
            this.lastDirection = isYes ? 'yes' : 'no';
            this.currentNode = isYes ? this.currentNode.yes : this.currentNode.no;
            
            this.updateUI();
            this.renderTree(); // Highlight current path
        }
    }

    updateUI() {
        if (this.currentNode.isObject) {
            this.ui.questionText.innerText = `Is it a ${this.currentNode.val}?`;
        } else {
            this.ui.questionText.innerText = this.currentNode.val;
        }
    }

    showView(viewName) {
        Object.values(this.ui.views).forEach(el => {
            el.classList.add('hidden');
            el.classList.remove('active');
        });
        this.ui.views[viewName].classList.remove('hidden');
        this.ui.views[viewName].classList.add('active');
    }

    showResult(msg, isWin) {
        document.getElementById('result-msg').innerText = msg;
        document.querySelector('#result-view .icon-wrapper').className = 
            `icon-wrapper ${isWin ? 'success' : 'warning'}`;
        document.querySelector('#result-view i').className = 
            isWin ? 'fas fa-magic' : 'fas fa-check';
            
        this.showView('result');
    }

    restart() {
        this.currentNode = this.root;
        this.parentNode = null;
        this.showView('question');
        this.updateUI();
        this.renderTree();
    }

    // --- Learning Module ---

    startLearning() {
        this.showView('learning');
        this.ui.learning.oldGuess.innerText = this.currentNode.val;
        
        // Reset Inputs
        this.ui.learning.objInput.value = '';
        this.ui.learning.qInput.value = '';
        
        // Live update label
        this.ui.learning.objInput.oninput = (e) => {
            this.ui.learning.objLabel.innerText = e.target.value || "your object";
        };
    }

    learn() {
        const newObjName = this.ui.learning.objInput.value.trim();
        const newQuestion = this.ui.learning.qInput.value.trim();
        const isYesForNew = document.querySelector('input[name="new-ans"]:checked').value === 'yes';

        if (!newObjName || !newQuestion) {
            alert("Please fill in all fields so I can learn!");
            return;
        }

        // Logic to splice tree
        const oldNode = this.currentNode;
        const newNode = new Node(newObjName);
        
        // Create a new internal node
        const questionNode = new Node(newQuestion);
        questionNode.isObject = false;

        if (isYesForNew) {
            questionNode.yes = newNode;
            questionNode.no = oldNode;
        } else {
            questionNode.yes = oldNode;
            questionNode.no = newNode;
        }

        // Link parent to new question node
        if (this.parentNode) {
            this.parentNode[this.lastDirection] = questionNode;
        } else {
            // We replaced the root (edge case if root was object, though in this logic root starts as question)
            this.root = questionNode;
        }

        this.updateStats();
        this.showResult("Thanks! I've updated my brain.", true);
    }

    // --- Visualizer & Utils ---

    countNodes(node = this.root) {
        if (!node) return 0;
        return 1 + this.countNodes(node.yes) + this.countNodes(node.no);
    }

    updateStats() {
        this.ui.nodeCount.innerText = this.countNodes();
    }

    renderTree() {
        this.ui.treeContainer.innerHTML = '';
        this.ui.treeContainer.appendChild(this.createTreeHTML(this.root));
    }

    createTreeHTML(node) {
        if (!node) return document.createTextNode('');

        const wrapper = document.createElement('div');
        wrapper.className = 'tree-node';

        const content = document.createElement('span');
        content.className = `node-content ${node.isObject ? 'node-leaf' : 'node-branch'}`;
        
        // Highlight active node
        if (node === this.currentNode) content.classList.add('active');
        
        // Truncate long text
        const text = node.val.length > 20 ? node.val.substring(0, 18) + '..' : node.val;
        content.innerText = text; // + (node.isObject ? '' : ' ?');
        
        // Add icon
        const icon = document.createElement('i');
        icon.className = node.isObject ? 'fas fa-cube' : 'fas fa-code-branch';
        icon.style.marginRight = '5px';
        content.prepend(icon);

        wrapper.appendChild(content);

        if (!node.isObject) {
            const childrenContainer = document.createElement('div');
            childrenContainer.style.paddingLeft = '10px';
            
            // Add Yes/No Labels
            // We recursively add children
            if (node.yes) childrenContainer.appendChild(this.createTreeHTML(node.yes));
            if (node.no) childrenContainer.appendChild(this.createTreeHTML(node.no));
            
            wrapper.appendChild(childrenContainer);
        }

        return wrapper;
    }
}

// Start Game
const game = new AkinatorGame();