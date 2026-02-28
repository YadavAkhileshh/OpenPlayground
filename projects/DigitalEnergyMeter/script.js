// Real-time Energy Meter System
class EnergyMeter {
    constructor() {
        this.currentEnergy = 500; // units
        this.maxEnergy = 1000;
        this.drainRate = 5; // units per second
        this.isPaused = false;
        this.drainTimer = null;
        this.chartData = [];
        this.logEntries = [];
        
        // DOM Elements
        this.energyFill = document.getElementById('energyFill');
        this.energyValue = document.getElementById('energyValue');
        this.energyNumber = document.getElementById('energyNumber');
        this.drainRateElement = document.getElementById('drainRate');
        this.energyStatus = document.getElementById('energyStatus');
        this.timeLeft = document.getElementById('timeLeft');
        this.drainSlider = document.getElementById('drainSlider');
        this.drainValue = document.getElementById('drainValue');
        this.currentDrain = document.getElementById('currentDrain');
        this.currentLevel = document.getElementById('currentLevel');
        this.activityChart = document.getElementById('activityChart');
        this.logContainer = document.getElementById('logContainer');
        
        // Buttons
        this.chargeBtn = document.getElementById('chargeBtn');
        this.pauseBtn = document.getElementById('pauseBtn');
        this.resetBtn = document.getElementById('resetBtn');
        
        this.init();
    }
    
    init() {
        this.updateDisplay();
        this.startDrain();
        this.setupEventListeners();
        this.createChart();
        this.addLog('System initialized. Starting with 500 units.');
    }
    
    startDrain() {
        clearInterval(this.drainTimer);
        
        this.drainTimer = setInterval(() => {
            if (!this.isPaused) {
                this.drainEnergy();
            }
        }, 1000); // Update every second
    }
    
    drainEnergy() {
        if (this.currentEnergy <= 0) {
            this.currentEnergy = 0;
            this.addLog('⚠️ Energy depleted! System shutting down...');
            this.updateStatus('Critical');
            return;
        }
        
        // Drain energy
        const drainAmount = this.drainRate;
        this.currentEnergy = Math.max(0, this.currentEnergy - drainAmount);
        
        // Add to chart data
        this.addChartData(this.currentEnergy);
        
        // Update display
        this.updateDisplay();
        
        // Add log entry every 5 seconds
        if (Math.random() < 0.2) { // 20% chance per second
            this.addLog(`Energy drained by ${drainAmount} units. Current: ${this.currentEnergy}`);
        }
    }
    
    updateDisplay() {
        const percentage = (this.currentEnergy / this.maxEnergy) * 100;
        
        // Update energy fill height
        this.energyFill.style.height = `${percentage}%`;
        
        // Update values
        this.energyValue.textContent = `${Math.round(percentage)}%`;
        this.energyNumber.textContent = Math.round(this.currentEnergy);
        
        // Update status
        this.updateStatus();
        
        // Update time left
        this.updateTimeLeft();
        
        // Update current level
        this.currentLevel.textContent = this.getLevelText(percentage);
        
        // Update drain rate display
        this.drainRateElement.textContent = `${this.drainRate}/sec`;
        this.currentDrain.textContent = `${this.drainRate}/sec`;
    }
    
    updateStatus() {
        const percentage = (this.currentEnergy / this.maxEnergy) * 100;
        let status = 'Stable';
        let statusColor = '#667eea';
        
        if (percentage > 70) {
            status = 'Optimal';
            statusColor = '#56ab2f';
        } else if (percentage > 40) {
            status = 'Stable';
            statusColor = '#667eea';
        } else if (percentage > 20) {
            status = 'Low';
            statusColor = '#ff9a9e';
        } else {
            status = 'Critical';
            statusColor = '#ff4757';
        }
        
        this.energyStatus.textContent = status;
        this.energyStatus.style.color = statusColor;
    }
    
    updateTimeLeft() {
        if (this.drainRate <= 0 || this.isPaused) {
            this.timeLeft.textContent = '∞';
            return;
        }
        
        const secondsLeft = Math.floor(this.currentEnergy / this.drainRate);
        const minutes = Math.floor(secondsLeft / 60);
        const seconds = secondsLeft % 60;
        
        if (secondsLeft > 3600) { // More than 1 hour
            this.timeLeft.textContent = '∞';
        } else if (minutes > 0) {
            this.timeLeft.textContent = `${minutes}:${seconds.toString().padStart(2, '0')}`;
        } else {
            this.timeLeft.textContent = `${seconds}s`;
        }
    }
    
    getLevelText(percentage) {
        if (percentage > 70) return 'High';
        if (percentage > 40) return 'Medium';
        if (percentage > 20) return 'Low';
        return 'Critical';
    }
    
    addLog(message) {
        const timestamp = new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit', second:'2-digit'});
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = `[${timestamp}] ${message}`;
        
        this.logContainer.prepend(logEntry);
        
        // Keep only last 10 entries
        const entries = this.logContainer.querySelectorAll('.log-entry');
        if (entries.length > 10) {
            entries[entries.length - 1].remove();
        }
    }
    
    createChart() {
        // Initialize chart data
        for (let i = 0; i < 20; i++) {
            this.chartData.push({
                time: i,
                value: this.currentEnergy
            });
        }
        
        this.updateChart();
    }
    
    updateChart() {
        // Add current energy to chart
        this.chartData.shift(); // Remove oldest
        this.chartData.push({
            time: this.chartData.length,
            value: this.currentEnergy
        });
        
        // Clear chart
        this.activityChart.innerHTML = '';
        
        // Create new chart
        const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
        svg.setAttribute('width', '100%');
        svg.setAttribute('height', '100%');
        
        const points = this.chartData.map((data, index) => {
            const x = (index / (this.chartData.length - 1)) * 100;
            const y = 100 - (data.value / this.maxEnergy) * 100;
            return `${x}%,${y}%`;
        }).join(' ');
        
        const polyline = document.createElementNS('http://www.w3.org/2000/svg', 'polyline');
        polyline.setAttribute('points', points);
        polyline.setAttribute('fill', 'none');
        polyline.setAttribute('stroke', '#667eea');
        polyline.setAttribute('stroke-width', '2');
        
        svg.appendChild(polyline);
        this.activityChart.appendChild(svg);
    }
    
    addChartData(value) {
        this.updateChart();
    }
    
    chargeEnergy() {
        const chargeAmount = 100;
        this.currentEnergy = Math.min(this.maxEnergy, this.currentEnergy + chargeAmount);
        
        this.updateDisplay();
        this.addLog(`⚡ Charged ${chargeAmount} units. Current: ${this.currentEnergy}`);
        this.showNotification('Energy Charged!', '+100 units');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            this.pauseBtn.innerHTML = '<i class="fas fa-play"></i><span>Resume</span>';
            this.addLog('⏸️ Drain paused');
            this.showNotification('Drain Paused', 'Energy consumption stopped');
        } else {
            this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause Drain</span>';
            this.addLog('▶️ Drain resumed');
            this.showNotification('Drain Resumed', 'Energy consumption active');
        }
    }
    
    resetSystem() {
        this.currentEnergy = 500;
        this.drainRate = 5;
        this.isPaused = false;
        
        this.drainSlider.value = 5;
        this.drainValue.textContent = '5';
        
        this.pauseBtn.innerHTML = '<i class="fas fa-pause"></i><span>Pause Drain</span>';
        
        this.updateDisplay();
        this.addLog('🔄 System reset to initial state');
        this.showNotification('System Reset', 'All values restored');
    }
    
    updateDrainRate(value) {
        this.drainRate = parseInt(value);
        this.drainValue.textContent = value;
        this.currentDrain.textContent = `${value}/sec`;
        
        this.updateDisplay();
        
        if (value > 0 && !this.isPaused) {
            this.addLog(`⚡ Drain rate changed to ${value}/sec`);
        }
    }
    
    showNotification(title, message) {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = 'notification';
        notification.innerHTML = `
            <div class="notification-title">${title}</div>
            <div class="notification-message">${message}</div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            padding: 15px 20px;
            border-radius: 10px;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
            border-left: 4px solid #667eea;
            z-index: 1000;
            animation: slideInRight 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
        
        // Add CSS animations
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideInRight {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                @keyframes slideOutRight {
                    from {
                        transform: translateX(0);
                        opacity: 1;
                    }
                    to {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }
    
    setupEventListeners() {
        // Slider event
        this.drainSlider.addEventListener('input', (e) => {
            this.updateDrainRate(e.target.value);
        });
        
        // Button events
        this.chargeBtn.addEventListener('click', () => this.chargeEnergy());
        this.pauseBtn.addEventListener('click', () => this.togglePause());
        this.resetBtn.addEventListener('click', () => this.resetSystem());
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case ' ':
                    e.preventDefault();
                    this.togglePause();
                    break;
                case 'r':
                case 'R':
                    if (e.ctrlKey) this.resetSystem();
                    break;
                case '+':
                case '=':
                    e.preventDefault();
                    this.chargeEnergy();
                    break;
            }
        });
    }
}

// Initialize the system when page loads
document.addEventListener('DOMContentLoaded', () => {
    const energyMeter = new EnergyMeter();
    
    // Make it globally accessible for debugging
    window.energyMeter = energyMeter;
    
    console.log('Energy Meter System Ready!');
    console.log('Keyboard shortcuts:');
    console.log('- SPACE: Toggle pause');
    console.log('- CTRL+R: Reset system');
    console.log('- +/=: Quick charge');
});