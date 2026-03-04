

class AppController {
    constructor() {
        this.visualizer = new Visualizer();
        this.model = null;
        this.optimizer = null;
        this.currentDataset = 'circle';
        
        // Data State
        this.trainData = [];
        this.trainLabels = [];
        
        // Training State
        this.isTraining = false;
        this.epoch = 0;
        this.learningRate = 0.03;
        
        this.init();
    }

    init() {
        this.buildModel();
        this.generateData();
        this.bindEvents();
        this.updateUI();
    }
    buildModel() {
        this.model = new NF.Sequential();
        
        // Hidden Layer 1: 2 Inputs to 6 Neurons
        this.model.add(new NF.Dense(2, 6));
        
        // Hidden Layer 2: 6 Neurons to 4 Neurons
        this.model.add(new NF.Dense(6, 4));
        
        // Output Layer: 4 Neurons to 1 Output
        this.model.add(new NF.Dense(4, 1));

        this.optimizer = new NF.SGD(this.model.getParameters(), this.learningRate);
        this.visualizer.renderNetworkGraph(this.model);
    }

    /**
     * GENERATES MATHEMATICAL DATASETS
     * Implements logic for non-linear separable data.
     */
    generateData() {
        this.trainData = [];
        this.trainLabels = [];
        const numSamples = 200;

        for (let i = 0; i < numSamples; i++) {
            let x, y, label;

            if (this.currentDataset === 'circle') {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                label = (x * x + y * y > 0.4) ? 1 : -1;
            } else if (this.currentDataset === 'xor') {
                x = Math.random() * 2 - 1;
                y = Math.random() * 2 - 1;
                label = (x * y > 0) ? 1 : -1;
            } else if (this.currentDataset === 'spiral') {
                const angle = (i / numSamples) * Math.PI * 2 * 2;
                const radius = (i / numSamples);
                const noise = (Math.random() - 0.5) * 0.1;
                
                if (i % 2 === 0) {
                    x = radius * Math.cos(angle) + noise;
                    y = radius * Math.sin(angle) + noise;
                    label = 1;
                } else {
                    x = -radius * Math.cos(angle) + noise;
                    y = -radius * Math.sin(angle) + noise;
                    label = -1;
                }
            }

            this.trainData.push([x, y]);
            this.trainLabels.push([label]);
        }
        
        this.visualizer.drawDataPoints(this.trainData, this.trainLabels.flat());
    }

    /**
     * MAIN TRAINING LOOP (RECURSIVE)
     * Performs Forward Pass -> Loss Calculation -> Backward Pass -> Optimizer Step
     */
    async trainStep() {
        if (!this.isTraining) return;

        // 1. Convert data to Tensors
        const xTensor = new NF.Tensor(this.trainData);
        const yTensor = new NF.Tensor(this.trainLabels);

        // 2. Forward Pass
        this.model.zeroGrad();
        const pred = this.model.forward(xTensor);

        // 3. Loss Calculation (MSE)
        const loss = NF.Loss.mse(pred, yTensor);

        // 4. Backward Pass (The Math Engine Magic)
        loss.backward();

        // 5. Update Weights
        this.optimizer.step();

        // 6. Update UI
        this.epoch++;
        this.updateStats(loss.data[0]);
        
        if (this.epoch % 5 === 0) {
            this.visualizer.drawDecisionBoundary(this.model);
        }

        // Keep loop running
        requestAnimationFrame(() => this.trainStep());
    }

    bindEvents() {
        // Play / Pause
        document.getElementById('btn-play-pause').onclick = (e) => {
            this.isTraining = !this.isTraining;
            const icon = e.currentTarget.querySelector('i');
            icon.className = this.isTraining ? 'ri-pause-fill' : 'ri-play-fill';
            if (this.isTraining) this.trainStep();
        };

        // Dataset Selection
        document.querySelectorAll('.ds-item').forEach(item => {
            item.onclick = () => {
                document.querySelector('.ds-item.active').classList.remove('active');
                item.classList.add('active');
                this.currentDataset = item.dataset.ds;
                this.reset();
            };
        });

        // Hyperparameters
        document.getElementById('inp-lr').oninput = (e) => {
            this.learningRate = parseFloat(e.target.value);
            this.optimizer.lr = this.learningRate;
        };
    }

    reset() {
        this.epoch = 0;
        this.isTraining = false;
        document.querySelector('.btn-play i').className = 'ri-play-fill';
        this.buildModel();
        this.generateData();
        this.updateStats(0);
        this.visualizer.drawDecisionBoundary(this.model);
    }

    updateStats(loss) {
        document.getElementById('stat-epoch').innerText = this.epoch;
        document.getElementById('stat-loss').innerText = loss.toFixed(4);
    }

    log(msg, type = "") {
        const logBox = document.getElementById('log-output');
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        const time = new Date().toLocaleTimeString().split(' ')[0];
        entry.innerHTML = `<span class="timestamp">[${time}]</span> ${msg}`;
        logBox.prepend(entry);
    }
}

// Start App
window.onload = () => {
    window.app = new AppController();
};