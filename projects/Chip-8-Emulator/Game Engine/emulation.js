
(function(root) {
    'use strict';

    const { Tensor } = root.NF;

    /* =========================================
       1. BASE LAYER CLASS
       ========================================= */
    class Layer {
        constructor() {
            this.parameters = [];
        }
        
        forward(input) {
            throw new Error("Forward pass not implemented");
        }

        getParameters() {
            return this.parameters;
        }

        zeroGrad() {
            this.parameters.forEach(p => {
                p.grad = p._zerosLike(p.data);
            });
        }
    }

    /* =========================================
       2. DENSE (FULLY CONNECTED) LAYER
       ========================================= */
    class Dense extends Layer {
        /**
         * @param {number} inSize - Input features
         * @param {number} outSize - Output neurons
         */
        constructor(inSize, outSize) {
            super();
            // Xavier/Glorot Initialization for stability
            const scale = Math.sqrt(2.0 / (inSize + outSize));
            
            const wData = Array.from({ length: inSize }, () => 
                Array.from({ length: outSize }, () => (Math.random() * 2 - 1) * scale)
            );
            
            const bData = [new Array(outSize).fill(0)];

            this.weights = new Tensor(wData, { requiresGrad: true });
            this.bias = new Tensor(bData, { requiresGrad: true });
            
            this.parameters = [this.weights, this.bias];
        }

        forward(input) {
            // Formula: Y = XW + B
            return input.matmul(this.weights).add(this.bias);
        }
    }

    /* =========================================
       3. SEQUENTIAL MODEL CONTAINER
       ========================================= */
    class Sequential {
        constructor() {
            this.layers = [];
        }

        add(layer) {
            this.layers.push(layer);
        }

        forward(input) {
            let out = input;
            for (const layer of this.layers) {
                out = layer.forward(out);
            }
            return out;
        }

        getParameters() {
            return this.layers.flatMap(l => l.getParameters());
        }

        zeroGrad() {
            this.layers.forEach(l => l.zeroGrad());
        }
    }

    /* =========================================
       4. OPTIMIZERS
       ========================================= */
    class SGD {
        /**
         * @param {Array} parameters - List of Tensors to optimize
         * @param {number} lr - Learning Rate
         */
        constructor(parameters, lr = 0.01) {
            this.parameters = parameters;
            this.lr = lr;
        }

        step() {
            // Update rule: W = W - (lr * Grad)
            this.parameters.forEach(p => {
                p.data = this._updateData(p.data, p.grad, this.lr);
            });
        }

        _updateData(data, grad, lr) {
            if (!Array.isArray(data)) {
                return data - (lr * grad);
            }
            return data.map((v, i) => this._updateData(v, grad[i], lr));
        }
    }

    /* =========================================
       5. LOSS FUNCTIONS (Criterion)
       ========================================= */
    const Loss = {
        /**
         * Mean Squared Error
         * L = (1/n) * sum((pred - target)^2)
         */
        mse(pred, target) {
            const diff = pred.add(target.map(x => -x));
            const squared = diff._map(diff.data, x => x * x);
            
            // Average the squared differences
            let sum = 0;
            let count = 0;
            const flatten = (arr) => {
                arr.forEach(v => {
                    if (Array.isArray(v)) flatten(v);
                    else { sum += v; count++; }
                });
            };
            flatten(squared);

            const out = new Tensor([sum / count], {
                children: [pred],
                op: 'mse_loss',
                requiresGrad: true
            });

            out._backward = () => {
                if (pred.requiresGrad) {
                    // dL/dPred = (2/n) * (pred - target)
                    const gradData = diff._map(diff.data, x => (2 / count) * x);
                    pred.grad = pred._elementWise(pred.grad, gradData, (g, dg) => g + dg);
                }
            };

            return out;
        }
    };

    // Export to global NF namespace
    root.NF.Dense = Dense;
    root.NF.Sequential = Sequential;
    root.NF.SGD = SGD;
    root.NF.Loss = Loss;

})(window);