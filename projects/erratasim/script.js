class ErrataSim {
    constructor() {
        this.params = {
            fatigue: 30,
            stress: 40,
            distraction: 25,
            duration: 30
        };
        
        this.stats = {
            totalInteractions: 0,
            errorsInjected: 0,
            misclicks: 0,
            delayedReactions: 0,
            wrongInputs: 0,
            corrections: 0,
            recoveryTimes: []
        };
        
        this.simulation = {
            active: false,
            startTime: 0,
            currentTask: null,
            taskQueue: [],
            taskHistory: []
        };
        
        this.replay = {
            events: [],
            currentIndex: 0,
            playing: false,
            speed: 1
        };
        
        this.heatmap = {
            data: [],
            canvas: null,
            ctx: null
        };
        
        this.timeline = {
            canvas: null,
            ctx: null
        };
        
        this.init();
    }
    
    init() {
        this.bindElements();
        this.attachEventListeners();
        this.initializeCanvases();
        this.updateParameterDisplays();
    }
    
    bindElements() {
        this.elements = {
            fatigueSlider: document.getElementById('fatigue'),
            stressSlider: document.getElementById('stress'),
            distractionSlider: document.getElementById('distraction'),
            durationSlider: document.getElementById('duration'),
            fatigueValue: document.getElementById('fatigue-value'),
            stressValue: document.getElementById('stress-value'),
            distractionValue: document.getElementById('distraction-value'),
            durationValue: document.getElementById('duration-value'),
            startBtn: document.getElementById('start-sim'),
            stopBtn: document.getElementById('stop-sim'),
            resetBtn: document.getElementById('reset-sim'),
            simStatus: document.getElementById('sim-status'),
            taskPrompt: document.getElementById('task-prompt'),
            interactionZone: document.getElementById('interaction-zone'),
            errorLog: document.getElementById('error-log'),
            statTotal: document.getElementById('stat-total'),
            statErrors: document.getElementById('stat-errors'),
            statRate: document.getElementById('stat-rate'),
            statRecovery: document.getElementById('stat-recovery'),
            statMisclicks: document.getElementById('stat-misclicks'),
            statDelays: document.getElementById('stat-delays'),
            statWrong: document.getElementById('stat-wrong'),
            statCorrections: document.getElementById('stat-corrections'),
            heatmapCanvas: document.getElementById('heatmap-canvas'),
            clearHeatmap: document.getElementById('clear-heatmap'),
            testHeatmap: document.getElementById('test-heatmap'),
            timelineCanvas: document.getElementById('timeline-canvas'),
            timelineScrubber: document.getElementById('timeline-scrubber'),
            timelineInfo: document.getElementById('timeline-info'),
            eventDetails: document.getElementById('event-details-content'),
            replayPlay: document.getElementById('replay-play'),
            replayPause: document.getElementById('replay-pause'),
            replayReset: document.getElementById('replay-reset'),
            replaySpeed: document.getElementById('replay-speed'),
            replaySpeedUp: document.getElementById('replay-speed-up')
        };
    }
    
    attachEventListeners() {
        this.elements.fatigueSlider.addEventListener('input', () => this.updateParameter('fatigue'));
        this.elements.stressSlider.addEventListener('input', () => this.updateParameter('stress'));
        this.elements.distractionSlider.addEventListener('input', () => this.updateParameter('distraction'));
        this.elements.durationSlider.addEventListener('input', () => this.updateParameter('duration'));
        
        this.elements.startBtn.addEventListener('click', () => this.startSimulation());
        this.elements.stopBtn.addEventListener('click', () => this.stopSimulation());
        this.elements.resetBtn.addEventListener('click', () => this.resetSimulation());
        
        this.elements.clearHeatmap.addEventListener('click', () => this.clearHeatmap());
        this.elements.testHeatmap.addEventListener('click', () => this.generateTestHeatmap());
        
        this.elements.replayPlay.addEventListener('click', () => this.playReplay());
        this.elements.replayPause.addEventListener('click', () => this.pauseReplay());
        this.elements.replayReset.addEventListener('click', () => this.resetReplay());
        this.elements.replaySpeedUp.addEventListener('click', () => this.changeReplaySpeed());
        
        this.elements.timelineCanvas.addEventListener('click', (e) => this.handleTimelineClick(e));
        this.elements.timelineCanvas.addEventListener('mousemove', (e) => this.handleTimelineHover(e));
        this.elements.heatmapCanvas.addEventListener('click', (e) => this.handleHeatmapClick(e));
    }
    
    initializeCanvases() {
        this.heatmap.canvas = this.elements.heatmapCanvas;
        this.heatmap.ctx = this.heatmap.canvas.getContext('2d');
        this.drawHeatmap();
        
        this.timeline.canvas = this.elements.timelineCanvas;
        this.timeline.ctx = this.timeline.canvas.getContext('2d');
        this.drawTimeline();
    }
    
    updateParameter(param) {
        const value = parseInt(this.elements[param + 'Slider'].value);
        this.params[param] = value;
        this.elements[param + 'Value'].textContent = value + (param === 'duration' ? 's' : '%');
    }
    
    updateParameterDisplays() {
        Object.keys(this.params).forEach(param => this.updateParameter(param));
    }
    
    startSimulation() {
        this.simulation.active = true;
        this.simulation.startTime = Date.now();
        this.simulation.taskQueue = [];
        this.simulation.taskHistory = [];
        
        this.elements.startBtn.disabled = true;
        this.elements.stopBtn.disabled = false;
        this.elements.simStatus.textContent = 'Running';
        this.elements.simStatus.classList.add('running');
        
        this.log('Simulation started', 'info');
        this.generateTasks();
        this.runNextTask();
    }
    
    stopSimulation() {
        this.simulation.active = false;
        
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.simStatus.textContent = 'Stopped';
        this.elements.simStatus.classList.remove('running');
        
        this.log('Simulation stopped by user', 'warning');
        this.finalizeSimulation();
    }
    
    resetSimulation() {
        this.simulation.active = false;
        this.simulation.taskQueue = [];
        this.simulation.taskHistory = [];
        
        this.stats = {
            totalInteractions: 0,
            errorsInjected: 0,
            misclicks: 0,
            delayedReactions: 0,
            wrongInputs: 0,
            corrections: 0,
            recoveryTimes: []
        };
        
        this.replay.events = [];
        this.replay.currentIndex = 0;
        this.replay.playing = false;
        
        this.elements.interactionZone.innerHTML = '';
        this.elements.errorLog.innerHTML = '<div class="log-entry info">System reset. Ready for new simulation.</div>';
        this.elements.taskPrompt.textContent = 'Click START SIMULATION to begin';
        this.elements.simStatus.textContent = 'Ready';
        this.elements.simStatus.classList.remove('running');
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        
        this.updateStatsDisplay();
        this.drawTimeline();
        this.enableReplayControls(false);
    }
    
    generateTasks() {
        const taskTypes = ['button-click', 'text-input', 'multi-button'];
        const taskCount = Math.floor(this.params.duration / 3) + 5;
        
        for (let i = 0; i < taskCount; i++) {
            this.simulation.taskQueue.push({
                id: i,
                type: taskTypes[Math.floor(Math.random() * taskTypes.length)],
                timestamp: Date.now() + (i * 3000)
            });
        }
    }
    
    runNextTask() {
        if (!this.simulation.active || this.simulation.taskQueue.length === 0) {
            if (this.simulation.active) {
                this.finalizeSimulation();
            }
            return;
        }
        
        const task = this.simulation.taskQueue.shift();
        this.simulation.currentTask = task;
        
        const elapsedTime = (Date.now() - this.simulation.startTime) / 1000;
        if (elapsedTime >= this.params.duration) {
            this.finalizeSimulation();
            return;
        }
        
        this.elements.interactionZone.innerHTML = '';
        
        if (task.type === 'button-click') {
            this.createButtonClickTask();
        } else if (task.type === 'text-input') {
            this.createTextInputTask();
        } else if (task.type === 'multi-button') {
            this.createMultiButtonTask();
        }
    }
    
    createButtonClickTask() {
        this.elements.taskPrompt.textContent = 'Click the highlighted button';
        
        const buttonCount = 5;
        const targetIndex = Math.floor(Math.random() * buttonCount);
        
        for (let i = 0; i < buttonCount; i++) {
            const btn = document.createElement('button');
            btn.className = 'interaction-button';
            btn.textContent = `Option ${i + 1}`;
            btn.dataset.index = i;
            
            if (i === targetIndex) {
                btn.classList.add('target');
                btn.dataset.correct = 'true';
            }
            
            btn.addEventListener('click', (e) => this.handleButtonClick(e, i === targetIndex));
            this.elements.interactionZone.appendChild(btn);
        }
        
        this.maybeInjectError('button-click', targetIndex);
    }
    
    createTextInputTask() {
        this.elements.taskPrompt.textContent = 'Type the word: "ACCURACY"';
        
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'interaction-input';
        input.placeholder = 'Type here...';
        input.dataset.expected = 'ACCURACY';
        
        let errorInjected = false;
        
        input.addEventListener('input', () => {
            if (!errorInjected && Math.random() < this.calculateErrorProbability() * 0.3) {
                this.injectTextError(input);
                errorInjected = true;
            }
        });
        
        input.addEventListener('blur', () => {
            this.handleTextInput(input);
        });
        
        this.elements.interactionZone.appendChild(input);
        input.focus();
        
        this.maybeInjectError('text-input', input);
    }
    
    createMultiButtonTask() {
        this.elements.taskPrompt.textContent = 'Click all blue buttons in order';
        
        const sequence = [1, 3, 5];
        let currentStep = 0;
        
        for (let i = 1; i <= 6; i++) {
            const btn = document.createElement('button');
            btn.className = 'interaction-button';
            btn.textContent = `Button ${i}`;
            btn.dataset.number = i;
            
            if (sequence.includes(i)) {
                btn.classList.add('target');
            }
            
            btn.addEventListener('click', () => {
                const expectedNumber = sequence[currentStep];
                if (parseInt(btn.dataset.number) === expectedNumber) {
                    currentStep++;
                    btn.style.opacity = '0.5';
                    btn.disabled = true;
                    
                    if (currentStep === sequence.length) {
                        this.recordInteraction(true, 0);
                        setTimeout(() => this.runNextTask(), 800);
                    }
                } else {
                    this.recordInteraction(false, 0);
                    this.stats.wrongInputs++;
                    btn.classList.add('error-click');
                    setTimeout(() => btn.classList.remove('error-click'), 500);
                }
            });
            
            this.elements.interactionZone.appendChild(btn);
        }
        
        this.maybeInjectError('multi-button', sequence);
    }
    
    maybeInjectError(taskType, data) {
        const errorProbability = this.calculateErrorProbability();
        
        if (Math.random() < errorProbability) {
            const delay = this.calculateDelay();
            
            setTimeout(() => {
                if (!this.simulation.active) return;
                
                const errorType = this.selectErrorType();
                
                if (errorType === 'misclick' && taskType === 'button-click') {
                    this.injectMisclick(data);
                } else if (errorType === 'delay') {
                    this.injectDelay();
                } else if (errorType === 'wrong-input' && taskType !== 'text-input') {
                    this.injectWrongInput();
                }
            }, delay);
        }
    }
    
    calculateErrorProbability() {
        const fatigueWeight = 0.4;
        const stressWeight = 0.35;
        const distractionWeight = 0.25;
        
        const probability = (
            (this.params.fatigue / 100) * fatigueWeight +
            (this.params.stress / 100) * stressWeight +
            (this.params.distraction / 100) * distractionWeight
        );
        
        return Math.min(probability, 0.7);
    }
    
    calculateDelay() {
        const baseDelay = 500;
        const fatigueDelay = (this.params.fatigue / 100) * 2000;
        const stressDelay = (this.params.stress / 100) * 1000;
        
        return baseDelay + fatigueDelay + stressDelay + (Math.random() * 1000);
    }
    
    selectErrorType() {
        const rand = Math.random();
        const stressRatio = this.params.stress / 100;
        const distractionRatio = this.params.distraction / 100;
        
        if (rand < stressRatio * 0.5) {
            return 'misclick';
        } else if (rand < stressRatio * 0.5 + distractionRatio * 0.3) {
            return 'wrong-input';
        } else {
            return 'delay';
        }
    }
    
    injectMisclick(targetIndex) {
        const buttons = this.elements.interactionZone.querySelectorAll('.interaction-button');
        if (buttons.length === 0) return;
        
        let wrongButton;
        do {
            wrongButton = buttons[Math.floor(Math.random() * buttons.length)];
        } while (wrongButton.dataset.correct === 'true' && buttons.length > 1);
        
        const rect = wrongButton.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.addErrorMarker(x, y);
        wrongButton.classList.add('error-click');
        
        setTimeout(() => {
            wrongButton.classList.remove('error-click');
        }, 500);
        
        this.stats.misclicks++;
        this.stats.errorsInjected++;
        this.recordHeatmapData(x, y, 'misclick');
        this.log(`Misclick injected - clicked wrong button`, 'error');
        
        const recoveryStart = Date.now();
        this.recordEvent('misclick', { x, y, target: 'wrong-button' });
        
        setTimeout(() => {
            const correctButton = Array.from(buttons).find(b => b.dataset.correct === 'true');
            if (correctButton) {
                correctButton.click();
                const recoveryTime = Date.now() - recoveryStart;
                this.stats.recoveryTimes.push(recoveryTime);
                this.stats.corrections++;
            }
        }, 800);
    }
    
    injectDelay() {
        this.stats.delayedReactions++;
        this.stats.errorsInjected++;
        this.log(`Delayed reaction injected - ${Math.round(this.calculateDelay())}ms pause`, 'warning');
        this.recordEvent('delay', { duration: this.calculateDelay() });
    }
    
    injectWrongInput() {
        const buttons = this.elements.interactionZone.querySelectorAll('.interaction-button');
        if (buttons.length === 0) return;
        
        const wrongButton = buttons[Math.floor(Math.random() * buttons.length)];
        wrongButton.classList.add('error-click');
        
        setTimeout(() => {
            wrongButton.classList.remove('error-click');
        }, 500);
        
        this.stats.wrongInputs++;
        this.stats.errorsInjected++;
        this.log(`Wrong input injected`, 'error');
        this.recordEvent('wrong-input', { target: 'button' });
    }
    
    injectTextError(input) {
        const currentValue = input.value;
        const errorChars = 'qwertyuiopasdfghjklzxcvbnm';
        const randomChar = errorChars[Math.floor(Math.random() * errorChars.length)];
        
        input.value = currentValue + randomChar;
        input.classList.add('error-input');
        
        setTimeout(() => {
            input.classList.remove('error-input');
        }, 500);
        
        this.stats.errorsInjected++;
        this.stats.wrongInputs++;
        this.log(`Text input error - wrong character typed`, 'error');
        this.recordEvent('text-error', { char: randomChar });
        
        setTimeout(() => {
            input.value = currentValue;
            this.stats.corrections++;
        }, 600);
    }
    
    handleButtonClick(e, isCorrect) {
        const clickTime = Date.now();
        const rect = e.target.getBoundingClientRect();
        const x = rect.left + rect.width / 2;
        const y = rect.top + rect.height / 2;
        
        this.recordHeatmapData(x, y, isCorrect ? 'correct' : 'incorrect');
        
        if (isCorrect) {
            this.recordInteraction(true, 0);
            this.log(`Correct button clicked`, 'success');
            setTimeout(() => this.runNextTask(), 800);
        } else {
            this.recordInteraction(false, 0);
            this.stats.wrongInputs++;
            this.log(`Incorrect button clicked`, 'error');
            e.target.classList.add('error-click');
            setTimeout(() => e.target.classList.remove('error-click'), 500);
        }
    }
    
    handleTextInput(input) {
        const expected = input.dataset.expected;
        const actual = input.value.trim().toUpperCase();
        const isCorrect = actual === expected;
        
        this.recordInteraction(isCorrect, 0);
        
        if (isCorrect) {
            this.log(`Correct text entered: ${actual}`, 'success');
        } else {
            this.log(`Incorrect text entered: ${actual} (expected: ${expected})`, 'error');
            this.stats.wrongInputs++;
        }
        
        setTimeout(() => this.runNextTask(), 800);
    }
    
    recordInteraction(success, recoveryTime) {
        this.stats.totalInteractions++;
        if (recoveryTime > 0) this.stats.recoveryTimes.push(recoveryTime);
        this.updateStatsDisplay();
    }
    
    recordEvent(type, data) {
        this.replay.events.push({
            timestamp: Date.now() - this.simulation.startTime,
            type: type,
            data: data
        });
        
        this.drawTimeline();
    }
    
    recordHeatmapData(x, y, type) {
        const interactionZone = this.elements.interactionZone;
        const zoneRect = interactionZone.getBoundingClientRect();
        
        const relativeX = x - zoneRect.left;
        const relativeY = y - zoneRect.top;
        
        const normalizedX = Math.max(0, Math.min(1, relativeX / zoneRect.width));
        const normalizedY = Math.max(0, Math.min(1, relativeY / zoneRect.height));
        
        const canvasX = normalizedX * this.heatmap.canvas.width;
        const canvasY = normalizedY * this.heatmap.canvas.height;
        
        this.heatmap.data.push({
            x: canvasX,
            y: canvasY,
            type: type,
            intensity: type === 'misclick' ? 3 : type === 'incorrect' ? 2 : 1
        });
        
        this.drawHeatmap();
    }
    
    updateStatsDisplay() {
        this.elements.statTotal.textContent = this.stats.totalInteractions;
        this.elements.statErrors.textContent = this.stats.errorsInjected;
        this.elements.statRate.textContent = (this.stats.totalInteractions > 0 ? ((this.stats.errorsInjected / this.stats.totalInteractions) * 100).toFixed(1) : 0) + '%';
        this.elements.statRecovery.textContent = (this.stats.recoveryTimes.length > 0 ? Math.round(this.stats.recoveryTimes.reduce((a, b) => a + b, 0) / this.stats.recoveryTimes.length) : 0) + 'ms';
        this.elements.statMisclicks.textContent = this.stats.misclicks;
        this.elements.statDelays.textContent = this.stats.delayedReactions;
        this.elements.statWrong.textContent = this.stats.wrongInputs;
        this.elements.statCorrections.textContent = this.stats.corrections;
    }
    
    log(message, type = 'info') {
        const entry = document.createElement('div');
        entry.className = `log-entry ${type}`;
        entry.textContent = message;
        
        this.elements.errorLog.insertBefore(entry, this.elements.errorLog.firstChild);
        
        if (this.elements.errorLog.children.length > 50) {
            this.elements.errorLog.removeChild(this.elements.errorLog.lastChild);
        }
    }
    
    addErrorMarker(x, y) {
        const marker = document.createElement('div');
        marker.className = 'error-marker';
        marker.style.left = x + 'px';
        marker.style.top = y + 'px';
        document.body.appendChild(marker);
        
        setTimeout(() => {
            marker.remove();
        }, 1500);
    }
    
    drawHeatmap() {
        const ctx = this.heatmap.ctx;
        const canvas = this.heatmap.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.heatmap.data.length === 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('Error locations will appear here during simulation', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        this.heatmap.data.forEach(point => {
            const radius = 50;
            const gradient = ctx.createRadialGradient(point.x, point.y, 0, point.x, point.y, radius);
            
            if (point.type === 'misclick' || point.intensity >= 3) {
                gradient.addColorStop(0, 'rgba(239, 68, 68, 1)');
                gradient.addColorStop(0.5, 'rgba(239, 68, 68, 0.6)');
                gradient.addColorStop(1, 'rgba(239, 68, 68, 0)');
            } else if (point.type === 'incorrect' || point.intensity >= 2) {
                gradient.addColorStop(0, 'rgba(245, 158, 11, 0.9)');
                gradient.addColorStop(0.5, 'rgba(245, 158, 11, 0.5)');
                gradient.addColorStop(1, 'rgba(245, 158, 11, 0)');
            } else {
                gradient.addColorStop(0, 'rgba(16, 185, 129, 0.7)');
                gradient.addColorStop(0.5, 'rgba(16, 185, 129, 0.4)');
                gradient.addColorStop(1, 'rgba(16, 185, 129, 0)');
            }
            
            ctx.fillStyle = gradient;
            ctx.fillRect(point.x - radius, point.y - radius, radius * 2, radius * 2);
        });
        
        ctx.fillStyle = '#9ca3af';
        ctx.font = '12px sans-serif';
        ctx.textAlign = 'left';
        ctx.fillText(`${this.heatmap.data.length} error points recorded`, 10, 20);
    }
    
    clearHeatmap() {
        this.heatmap.data = [];
        this.drawHeatmap();
        this.log('Heatmap cleared', 'info');
    }
    
    generateTestHeatmap() {
        this.heatmap.data = [];
        
        const canvas = this.heatmap.canvas;
        const types = ['misclick', 'incorrect', 'correct'];
        
        for (let i = 0; i < 25; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * canvas.height;
            const type = types[Math.floor(Math.random() * types.length)];
            const intensity = type === 'misclick' ? 3 : type === 'incorrect' ? 2 : 1;
            
            this.heatmap.data.push({ x, y, type, intensity });
        }
        
        this.drawHeatmap();
        this.log('Test heatmap data generated (25 points)', 'info');
    }
    
    handleHeatmapClick(e) {
        const rect = this.heatmap.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        const scaleX = this.heatmap.canvas.width / rect.width;
        const scaleY = this.heatmap.canvas.height / rect.height;
        
        const canvasX = x * scaleX;
        const canvasY = y * scaleY;
        
        this.heatmap.data.push({
            x: canvasX,
            y: canvasY,
            type: 'manual',
            intensity: 2
        });
        
        this.drawHeatmap();
        this.log('Manual heatmap point added', 'info');
    }
    
    drawTimeline() {
        const ctx = this.timeline.ctx;
        const canvas = this.timeline.canvas;
        
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#111827';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        if (this.replay.events.length === 0) {
            ctx.fillStyle = '#6b7280';
            ctx.font = '14px sans-serif';
            ctx.textAlign = 'center';
            ctx.fillText('No events recorded yet', canvas.width / 2, canvas.height / 2);
            return;
        }
        
        const maxTime = Math.max(...this.replay.events.map(e => e.timestamp), 1);
        const padding = 40;
        const timelineWidth = canvas.width - (padding * 2);
        const timelineHeight = canvas.height - (padding * 2);
        
        ctx.strokeStyle = '#374151';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(padding, canvas.height - padding);
        ctx.lineTo(canvas.width - padding, canvas.height - padding);
        ctx.stroke();
        
        this.replay.events.forEach(event => {
            const x = padding + (event.timestamp / maxTime) * timelineWidth;
            const y = canvas.height - padding;
            
            ctx.fillStyle = this.getEventColor(event.type);
            ctx.beginPath();
            ctx.arc(x, y, 5, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = this.getEventColor(event.type);
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x, padding);
            ctx.stroke();
        });
        
        const intervals = 5;
        ctx.fillStyle = '#9ca3af';
        ctx.font = '11px sans-serif';
        ctx.textAlign = 'center';
        
        for (let i = 0; i <= intervals; i++) {
            const x = padding + (i / intervals) * timelineWidth;
            const time = ((i / intervals) * maxTime / 1000).toFixed(1);
            ctx.fillText(time + 's', x, canvas.height - 10);
        }
    }
    
    getEventColor(type) {
        const colors = {
            'misclick': '#ef4444',
            'delay': '#f59e0b',
            'wrong-input': '#ef4444',
            'text-error': '#ef4444',
            'correct': '#10b981'
        };
        return colors[type] || '#3b82f6';
    }
    
    handleTimelineClick(e) {
        if (this.replay.events.length === 0) return;
        
        const rect = this.timeline.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const clickRatio = x / rect.width;
        
        this.replay.currentIndex = Math.floor(clickRatio * this.replay.events.length);
        this.replay.currentIndex = Math.max(0, Math.min(this.replay.currentIndex, this.replay.events.length - 1));
        
        this.updateTimelineScrubber(clickRatio);
        this.showEventDetails(this.replay.events[this.replay.currentIndex]);
    }
    
    handleTimelineHover(e) {
        if (this.replay.events.length === 0) return;
        
        const rect = this.timeline.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const padding = 40;
        const timelineWidth = rect.width - (padding * 2);
        
        if (x < padding || x > rect.width - padding) return;
        
        const hoverRatio = (x - padding) / timelineWidth;
        const maxTime = Math.max(...this.replay.events.map(e => e.timestamp), 1);
        const hoverTime = hoverRatio * maxTime;
        
        const nearbyEvent = this.replay.events.find(event => {
            const eventRatio = event.timestamp / maxTime;
            const eventX = padding + (eventRatio * timelineWidth);
            const distance = Math.abs((x - eventX));
            return distance < 10;
        });
        
        if (nearbyEvent) {
            this.showEventDetails(nearbyEvent);
        }
    }
    
    updateTimelineScrubber(ratio) {
        this.elements.timelineScrubber.style.left = (ratio * 100) + '%';
        this.elements.timelineScrubber.classList.add('active');
    }
    
    showEventDetails(event) {
        const details = `
            Type: ${event.type}
            Time: ${(event.timestamp / 1000).toFixed(2)}s
            Data: ${JSON.stringify(event.data, null, 2)}
        `;
        this.elements.eventDetails.textContent = details;
    }
    
    playReplay() {
        if (this.replay.events.length === 0) return;
        
        this.replay.playing = true;
        this.elements.replayPlay.disabled = true;
        this.elements.replayPause.disabled = false;
        
        this.runReplay();
    }
    
    runReplay() {
        if (!this.replay.playing || this.replay.currentIndex >= this.replay.events.length) {
            this.pauseReplay();
            return;
        }
        
        const event = this.replay.events[this.replay.currentIndex];
        const maxTime = Math.max(...this.replay.events.map(e => e.timestamp), 1);
        const ratio = event.timestamp / maxTime;
        
        this.updateTimelineScrubber(ratio);
        this.showEventDetails(event);
        
        this.elements.timelineInfo.textContent = `Playing event ${this.replay.currentIndex + 1} of ${this.replay.events.length}`;
        
        this.replay.currentIndex++;
        
        const nextDelay = this.replay.currentIndex < this.replay.events.length
            ? (this.replay.events[this.replay.currentIndex].timestamp - event.timestamp) / this.replay.speed
            : 1000;
        
        setTimeout(() => this.runReplay(), Math.max(nextDelay, 100));
    }
    
    pauseReplay() {
        this.replay.playing = false;
        this.elements.replayPlay.disabled = false;
        this.elements.replayPause.disabled = true;
        this.elements.timelineInfo.textContent = `Paused at event ${this.replay.currentIndex} of ${this.replay.events.length}`;
    }
    
    resetReplay() {
        this.replay.currentIndex = 0;
        this.replay.playing = false;
        this.elements.replayPlay.disabled = false;
        this.elements.replayPause.disabled = true;
        this.elements.timelineScrubber.classList.remove('active');
        this.elements.timelineInfo.textContent = `Ready to replay ${this.replay.events.length} events`;
        this.elements.eventDetails.textContent = 'Click play to start replay';
    }
    
    changeReplaySpeed() {
        const speeds = [1, 2, 4, 0.5];
        const currentIndex = speeds.indexOf(this.replay.speed);
        const nextIndex = (currentIndex + 1) % speeds.length;
        this.replay.speed = speeds[nextIndex];
        this.elements.replaySpeed.textContent = this.replay.speed + 'x';
    }
    
    enableReplayControls(enable) {
        this.elements.replayPlay.disabled = !enable;
        this.elements.replayPause.disabled = true;
        this.elements.replayReset.disabled = !enable;
        this.elements.replaySpeedUp.disabled = !enable;
    }
    
    finalizeSimulation() {
        this.simulation.active = false;
        
        this.elements.startBtn.disabled = false;
        this.elements.stopBtn.disabled = true;
        this.elements.simStatus.textContent = 'Completed';
        this.elements.simStatus.classList.remove('running');
        
        this.elements.taskPrompt.textContent = 'Simulation complete. Review results below.';
        this.elements.interactionZone.innerHTML = '';
        
        this.log('Simulation completed successfully', 'success');
        this.log(`Final stats - Total: ${this.stats.totalInteractions}, Errors: ${this.stats.errorsInjected}`, 'info');
        
        this.drawTimeline();
        this.enableReplayControls(true);
        this.elements.timelineInfo.textContent = `${this.replay.events.length} events recorded. Click play to review.`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ErrataSim();
});
