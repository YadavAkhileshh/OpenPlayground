class QubitSimulator {
    constructor() {
        this.state = [1, 0]; // Initial state |0⟩
        this.canvas = document.getElementById('blochCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.init();
        this.updateDisplay();
        this.drawBlochSphere();
    }

    init() {
        // Event listeners for gates
        document.getElementById('hadamard').addEventListener('click', () => this.applyGate('H'));
        document.getElementById('pauliX').addEventListener('click', () => this.applyGate('X'));
        document.getElementById('pauliY').addEventListener('click', () => this.applyGate('Y'));
        document.getElementById('pauliZ').addEventListener('click', () => this.applyGate('Z'));
        document.getElementById('measure').addEventListener('click', () => this.measure());
        document.getElementById('reset').addEventListener('click', () => this.reset());
    }

    applyGate(gate) {
        let newState;
        switch(gate) {
            case 'H':
                newState = this.hadamardGate(this.state);
                break;
            case 'X':
                newState = this.pauliXGate(this.state);
                break;
            case 'Y':
                newState = this.pauliYGate(this.state);
                break;
            case 'Z':
                newState = this.pauliZGate(this.state);
                break;
        }
        this.state = newState;
        this.updateDisplay();
        this.drawBlochSphere();
    }

    hadamardGate(state) {
        const H = [[1/Math.sqrt(2), 1/Math.sqrt(2)], [1/Math.sqrt(2), -1/Math.sqrt(2)]];
        return this.matrixMultiply(H, state);
    }

    pauliXGate(state) {
        const X = [[0, 1], [1, 0]];
        return this.matrixMultiply(X, state);
    }

    pauliYGate(state) {
        const Y = [[0, -1], [1, 0]];
        return this.matrixMultiply(Y, state.map(x => [x]));
    }

    pauliZGate(state) {
        const Z = [[1, 0], [0, -1]];
        return this.matrixMultiply(Z, state);
    }

    matrixMultiply(matrix, vector) {
        const result = [];
        for (let i = 0; i < matrix.length; i++) {
            let sum = 0;
            for (let j = 0; j < vector.length; j++) {
                sum += matrix[i][j] * vector[j];
            }
            result.push(sum);
        }
        return result;
    }

    measure() {
        const prob0 = Math.pow(this.state[0], 2);
        const prob1 = Math.pow(this.state[1], 2);
        const random = Math.random();
        let result;

        if (random < prob0) {
            result = 0;
            this.state = [1, 0];
        } else {
            result = 1;
            this.state = [0, 1];
        }

        alert(`Measurement result: ${result}`);
        this.updateDisplay();
        this.drawBlochSphere();
    }

    reset() {
        this.state = [1, 0];
        this.updateDisplay();
        this.drawBlochSphere();
    }

    updateDisplay() {
        const prob0 = Math.pow(this.state[0], 2) * 100;
        const prob1 = Math.pow(this.state[1], 2) * 100;

        document.getElementById('prob0').style.width = `${prob0}%`;
        document.getElementById('prob0').textContent = `${prob0.toFixed(1)}%`;

        document.getElementById('prob1').style.width = `${prob1}%`;
        document.getElementById('prob1').textContent = `${prob1.toFixed(1)}%`;

        document.getElementById('stateVector').textContent = `[${this.state[0].toFixed(3)}, ${this.state[1].toFixed(3)}]`;
    }

    drawBlochSphere() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = 120;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        // Draw circle
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.ctx.strokeStyle = '#333';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();

        // Draw axes
        this.ctx.beginPath();
        this.ctx.moveTo(centerX - radius, centerY);
        this.ctx.lineTo(centerX + radius, centerY);
        this.ctx.moveTo(centerX, centerY - radius);
        this.ctx.lineTo(centerX, centerY + radius);
        this.ctx.strokeStyle = '#666';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();

        // Labels
        this.ctx.fillStyle = '#333';
        this.ctx.font = '12px Arial';
        this.ctx.fillText('|0⟩', centerX - 10, centerY - radius - 10);
        this.ctx.fillText('|1⟩', centerX - 10, centerY + radius + 20);
        this.ctx.fillText('|+⟩', centerX + radius + 10, centerY + 5);
        this.ctx.fillText('|-⟩', centerX - radius - 20, centerY + 5);

        // Calculate Bloch vector (simplified 2D representation)
        const theta = Math.acos(this.state[0]);
        const phi = Math.atan2(this.state[1], this.state[0]);

        const x = radius * Math.sin(theta) * Math.cos(phi);
        const y = radius * Math.sin(theta) * Math.sin(phi);

        // Draw state vector
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.lineTo(centerX + x, centerY + y);
        this.ctx.strokeStyle = '#ff6b6b';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();

        // Draw point at end of vector
        this.ctx.beginPath();
        this.ctx.arc(centerX + x, centerY + y, 5, 0, 2 * Math.PI);
        this.ctx.fillStyle = '#ff6b6b';
        this.ctx.fill();
    }
}

// Initialize the simulator when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new QubitSimulator();
});
