

(function(root) {
    'use strict';

    class Tensor {
        /**
         * @param {number|Array} data - The raw numerical values.
         * @param {Object} options - Configuration for the tensor.
         */
        constructor(data, options = {}) {
            this.data = this._preprocess(data);
            this.shape = this._getShape(this.data);
            this.grad = this._zerosLike(this.data);
            this.requiresGrad = options.requiresGrad || false;
            
            // Autograd properties
            this._prev = new Set(options.children || []);
            this._op = options.op || '';
            this._backward = () => {};
        }

        /**
         * Internal helper to ensure data is in Float32 format for precision.
         */
        _preprocess(data) {
            if (typeof data === 'number') return [data];
            return data; 
        }

        _getShape(data) {
            const shape = [];
            let curr = data;
            while (Array.isArray(curr)) {
                shape.push(curr.length);
                curr = curr[0];
            }
            return shape;
        }

        _zerosLike(data) {
            if (!Array.isArray(data)) return 0;
            return data.map(v => this._zerosLike(v));
        }

        /**
         * ADDITION OPERATION
         * Implements: f(a, b) = a + b
         * Gradient: df/da = 1, df/db = 1
         */
        add(other) {
            other = other instanceof Tensor ? other : new Tensor(other);
            const outData = this._elementWise(this.data, other.data, (a, b) => a + b);
            
            const out = new Tensor(outData, {
                children: [this, other],
                op: '+',
                requiresGrad: this.requiresGrad || other.requiresGrad
            });

            out._backward = () => {
                if (this.requiresGrad) {
                    this.grad = this._elementWise(this.grad, out.grad, (g, og) => g + og);
                }
                if (other.requiresGrad) {
                    other.grad = this._elementWise(other.grad, out.grad, (g, og) => g + og);
                }
            };

            return out;
        }

        /**
         * MATRIX MULTIPLICATION (GEMM)
         * Implements: C = A . B
         * Complexity: O(n^3)
         */
        matmul(other) {
            if (this.shape[1] !== other.shape[0]) {
                throw new Error(`Dimension mismatch: ${this.shape[1]} != ${other.shape[0]}`);
            }

            const m = this.shape[0];
            const k = this.shape[1];
            const n = other.shape[1];
            const outData = Array.from({ length: m }, () => new Array(n).fill(0));

            for (let i = 0; i < m; i++) {
                for (let j = 0; j < n; j++) {
                    let sum = 0;
                    for (let l = 0; l < k; l++) {
                        sum += this.data[i][l] * other.data[l][j];
                    }
                    outData[i][j] = sum;
                }
            }

            const out = new Tensor(outData, {
                children: [this, other],
                op: 'matmul',
                requiresGrad: this.requiresGrad || other.requiresGrad
            });

            out._backward = () => {
                if (this.requiresGrad) {
                    // Grad_A = Grad_Out . B^T
                    const bT = other.transpose();
                    const dThis = out.matmul(bT); 
                    this.grad = this._elementWise(this.grad, dThis.data, (g, dg) => g + dg);
                }
                if (other.requiresGrad) {
                    // Grad_B = A^T . Grad_Out
                    const aT = this.transpose();
                    const dOther = aT.matmul(out);
                    other.grad = this._elementWise(other.grad, dOther.data, (g, dg) => g + dg);
                }
            };

            return out;
        }

        /**
         * ACTIVATION: RELU
         * Implements: max(0, x)
         * Derivative: 1 if x > 0 else 0
         */
        relu() {
            const outData = this._map(this.data, x => Math.max(0, x));
            const out = new Tensor(outData, {
                children: [this],
                op: 'relu',
                requiresGrad: this.requiresGrad
            });

            out._backward = () => {
                if (this.requiresGrad) {
                    const dRelu = this._elementWise(this.data, out.grad, (x, og) => (x > 0 ? og : 0));
                    this.grad = this._elementWise(this.grad, dRelu, (g, dg) => g + dg);
                }
            };

            return out;
        }

        /**
         * THE BACKPROPAGATION ENGINE
         * Topological sort + recursive gradient accumulation.
         */
        backward() {
            const topo = [];
            const visited = new Set();
            
            const buildTopo = (v) => {
                if (!visited.has(v)) {
                    visited.add(v);
                    v._prev.forEach(child => buildTopo(child));
                    topo.push(v);
                }
            };

            buildTopo(this);

            // Initialize seed gradient (dl/dl = 1)
            this.grad = this._onesLike(this.data);

            // Backpropagate in reverse topological order
            for (let i = topo.length - 1; i >= 0; i--) {
                topo[i]._backward();
            }
        }

        // --- Helper Kernels ---

        _elementWise(a, b, op) {
            if (!Array.isArray(a)) return op(a, b);
            return a.map((val, i) => this._elementWise(val, b[i], op));
        }

        _map(data, op) {
            if (!Array.isArray(data)) return op(data);
            return data.map(val => this._map(val, op));
        }

        _onesLike(data) {
            if (!Array.isArray(data)) return 1;
            return data.map(v => this._onesLike(v));
        }

        transpose() {
            const rows = this.shape[0];
            const cols = this.shape[1];
            const out = Array.from({ length: cols }, () => new Array(rows));
            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    out[j][i] = this.data[i][j];
                }
            }
            return new Tensor(out);
        }
    }

    // Export to global scope for NeuroForge engine access
    root.NF = { Tensor };

})(window);