class QuantumSpeedTest {
    constructor() {
        this.isTesting = false;
        this.currentPhase = null;
        this.testResults = {
            ping: null,
            download: null,
            upload: null,
            jitter: null
        };
        this.particles = [];
        this.settings = this.loadSettings();
        
        // Initialize
        this.initElements();
        this.init();
        this.initParticles();
        this.startAnimations();
    }
    
    initElements() {
        // Core elements
        this.startBtn = document.getElementById('startTestBtn');
        this.stopBtn = document.getElementById('stopTestBtn');
        this.statusDot = document.getElementById('statusDot');
        this.statusText = document.getElementById('statusText');
        this.ringProgress = document.getElementById('ringProgress');
        this.speedValue = document.getElementById('speedValue');
        this.speedUnit = document.getElementById('speedUnit');
        this.speedLabel = document.getElementById('speedLabel');
        this.timelineProgress = document.getElementById('timelineProgress');
        this.processorLoad = document.getElementById('processorLoad');
        this.networkLoad = document.getElementById('networkLoad');
        
        // Results
        this.pingValue = document.getElementById('pingValue');
        this.downloadValue = document.getElementById('downloadValue');
        this.uploadValue = document.getElementById('uploadValue');
        this.jitterValue = document.getElementById('jitterValue');
        
        // Quality badges
        this.pingQuality = document.getElementById('pingQuality');
        this.downloadQuality = document.getElementById('downloadQuality');
        this.uploadQuality = document.getElementById('uploadQuality');
        this.jitterQuality = document.getElementById('jitterQuality');
        
        // Graphs
        this.pingGraph = document.getElementById('pingGraph');
        this.downloadGraph = document.getElementById('downloadGraph');
        this.uploadGraph = document.getElementById('uploadGraph');
        this.jitterGraph = document.getElementById('jitterGraph');
        
        // Info
        this.serverInfo = document.getElementById('serverInfo');
        this.currentTime = document.getElementById('currentTime');
        this.networkType = document.getElementById('networkType');
        
        // Modals
        this.settingsModal = document.getElementById('settingsModal');
        this.infoModal = document.getElementById('infoModal');
        this.settingsBtn = document.getElementById('settingsBtn');
        this.infoBtn = document.getElementById('infoBtn');
        this.modalClose = document.querySelector('.modal-close');
        this.durationOptions = document.querySelectorAll('.duration-option');
        this.saveSettingsBtn = document.getElementById('saveSettingsBtn');
        this.resetSettingsBtn = document.getElementById('resetSettingsBtn');
        
        // Timeline dots
        this.timelineDots = document.querySelectorAll('.timeline-dot');
        
        // Audio
        this.startSound = document.getElementById('startSound');
        this.completeSound = document.getElementById('completeSound');
        
        // Particles container
        this.particlesContainer = document.getElementById('particles');
    }
    
    init() {
        this.setupEventListeners();
        this.updateTime();
        this.updateNetworkInfo();
        this.applySettings();
        
        // Start time updates
        setInterval(() => this.updateTime(), 1000);
        
        // Update network info
        setInterval(() => this.updateNetworkInfo(), 30000);
        
        // Animate processor load
        this.animateSystemMetrics();
    }
    
    setupEventListeners() {
        // Test controls
        this.startBtn.addEventListener('click', () => this.startTest());
        this.stopBtn.addEventListener('click', () => this.stopTest());
        
        // Modals
        this.settingsBtn.addEventListener('click', () => this.showModal(this.settingsModal));
        this.infoBtn.addEventListener('click', () => this.showModal(this.infoModal));
        this.modalClose.addEventListener('click', () => this.closeModals());
        
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.closeModals();
            });
        });
        
        // Settings
        this.durationOptions.forEach(btn => {
            btn.addEventListener('click', () => {
                this.durationOptions.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.settings.duration = parseInt(btn.dataset.duration);
            });
        });
        
        this.saveSettingsBtn.addEventListener('click', () => {
            this.saveSettings();
            this.showToast('Quantum settings saved', 'success');
            this.closeModals();
        });
        
        this.resetSettingsBtn.addEventListener('click', () => {
            this.resetSettings();
            this.showToast('Settings reset to defaults', 'info');
        });
        
        // Timeline dots
        this.timelineDots.forEach(dot => {
            dot.addEventListener('click', () => {
                if (!this.isTesting) {
                    const phase = dot.dataset.phase;
                    this.setActivePhase(phase);
                }
            });
        });
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ' || e.key === 'Enter') {
                e.preventDefault();
                if (!this.isTesting) this.startTest();
                else this.stopTest();
            }
            
            if (e.key === 'Escape') {
                this.stopTest();
                this.closeModals();
            }
            
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                this.showModal(this.settingsModal);
            }
        });
        
        // Animation level slider
        const animationSlider = document.getElementById('animationLevel');
        if (animationSlider) {
            animationSlider.addEventListener('input', (e) => {
                const value = e.target.value;
                document.querySelector('.slider-fill').style.width = value + '%';
                this.settings.animationLevel = value;
            });
        }
        
        // Checkbox effects
        document.querySelectorAll('input[type="checkbox"]').forEach(checkbox => {
            checkbox.addEventListener('change', () => {
                const id = checkbox.id;
                this.settings[id] = checkbox.checked;
                this.applyVisualEffects();
            });
        });
    }
    
    loadSettings() {
        const defaultSettings = {
            duration: 8,
            intensity: 'advanced',
            animationLevel: 80,
            glowEffect: true,
            particleEffect: true,
            pulseEffect: true,
            glassEffect: true
        };
        
        const saved = JSON.parse(localStorage.getItem('quantumSettings')) || {};
        return { ...defaultSettings, ...saved };
    }
    
    saveSettings() {
        // Update settings from UI
        this.settings.intensity = document.getElementById('testIntensity').value;
        this.settings.animationLevel = document.getElementById('animationLevel').value;
        
        localStorage.setItem('quantumSettings', JSON.stringify(this.settings));
    }
    
    resetSettings() {
        localStorage.removeItem('quantumSettings');
        this.settings = this.loadSettings();
        this.applySettings();
    }
    
    applySettings() {
        // Apply duration
        this.durationOptions.forEach(btn => {
            if (parseInt(btn.dataset.duration) === this.settings.duration) {
                btn.classList.add('active');
            }
        });
        
        // Apply intensity
        document.getElementById('testIntensity').value = this.settings.intensity;
        
        // Apply animation level
        document.getElementById('animationLevel').value = this.settings.animationLevel;
        document.querySelector('.slider-fill').style.width = this.settings.animationLevel + '%';
        
        // Apply checkbox states
        document.getElementById('glowEffect').checked = this.settings.glowEffect;
        document.getElementById('particleEffect').checked = this.settings.particleEffect;
        document.getElementById('pulseEffect').checked = this.settings.pulseEffect;
        document.getElementById('glassEffect').checked = this.settings.glassEffect;
        
        // Apply visual effects
        this.applyVisualEffects();
    }
    
    applyVisualEffects() {
        // Toggle glow effects
        const glowElements = document.querySelectorAll('.ring-progress, .start-btn, .logo-icon');
        glowElements.forEach(el => {
            el.style.filter = this.settings.glowEffect ? 'url(#glow)' : 'none';
        });
        
        // Toggle particles
        if (this.settings.particleEffect) {
            this.initParticles();
        } else {
            this.particlesContainer.innerHTML = '';
            this.particles = [];
        }
        
        // Toggle pulse animations
        const pulseElements = document.querySelectorAll('.status-pulse, .logo-glow, .btn-pulse');
        pulseElements.forEach(el => {
            el.style.animationPlayState = this.settings.pulseEffect ? 'running' : 'paused';
        });
        
        // Toggle glass effect
        const glassElements = document.querySelectorAll('.glass-card, .glass-btn');
        glassElements.forEach(el => {
            el.style.backdropFilter = this.settings.glassEffect ? 'blur(20px)' : 'none';
        });
    }
    
    startTest() {
        if (this.isTesting) return;
        
        this.isTesting = true;
        this.updateStatus('Initializing quantum test...', 'testing');
        
        // Play sound
        this.startSound.currentTime = 0;
        this.startSound.play().catch(e => console.log("Audio play failed:", e));
        
        // UI updates
        this.startBtn.classList.add('hidden');
        this.stopBtn.classList.remove('hidden');
        this.resetResults();
        this.setActivePhase('ping');
        
        // Start particles explosion
        this.createParticleExplosion(300, 400);
        
        // Run test sequence
        this.runTestSequence();
    }
    
    stopTest() {
        if (!this.isTesting) return;
        
        this.isTesting = false;
        this.currentPhase = null;
        this.updateStatus('Test terminated', 'stopped');
        
        // UI updates
        this.startBtn.classList.remove('hidden');
        this.stopBtn.classList.add('hidden');
        
        this.showToast('Quantum test terminated', 'info');
    }
    
    resetResults() {
        // Reset values
        this.pingValue.textContent = '--';
        this.downloadValue.textContent = '--';
        this.uploadValue.textContent = '--';
        this.jitterValue.textContent = '--';
        
        // Reset quality badges
        this.pingQuality.textContent = '--';
        this.downloadQuality.textContent = '--';
        this.uploadQuality.textContent = '--';
        this.jitterQuality.textContent = '--';
        
        // Reset graphs
        this.pingGraph.style.width = '0%';
        this.downloadGraph.style.width = '0%';
        this.uploadGraph.style.width = '0%';
        this.jitterGraph.style.width = '0%';
        
        // Reset speedometer
        this.speedValue.textContent = '0';
        this.speedUnit.textContent = 'Mbps';
        this.speedLabel.textContent = 'Speed';
        this.updateSpeedometer(0, 300);
        
        // Reset timeline
        this.timelineProgress.style.width = '0%';
    }
    
    async runTestSequence() {
        try {
            // Phase 1: Ping Test
            this.setActivePhase('ping');
            const ping = await this.testPing();
            this.updateResult('ping', ping);
            this.updateSpeedometer(ping, 100);
            
            // Phase 2: Download Test
            this.setActivePhase('download');
            const downloadSpeed = await this.testDownload();
            this.updateResult('download', downloadSpeed);
            this.updateSpeedometer(downloadSpeed, 300);
            
            // Phase 3: Upload Test
            this.setActivePhase('upload');
            const uploadSpeed = await this.testUpload();
            this.updateResult('upload', uploadSpeed);
            this.updateSpeedometer(uploadSpeed, 100);
            
            // Phase 4: Jitter Test
            this.setActivePhase('complete');
            const jitter = await this.testJitter(ping);
            this.updateResult('jitter', jitter);
            
            // Complete
            this.updateStatus('Quantum test complete', 'success');
            
            // Play completion sound
            this.completeSound.currentTime = 0;
            this.completeSound.play().catch(e => console.log("Audio play failed:", e));
            
            // Create celebration particles
            this.createCelebrationParticles();
            
            // Save results
            this.saveResults();
            this.showToast('Quantum speed test completed successfully!', 'success');
            
            // Auto-reset
            setTimeout(() => {
                if (this.isTesting) {
                    this.stopTest();
                }
            }, 5000);
            
        } catch (error) {
            console.error('Quantum test error:', error);
            this.updateStatus('Quantum anomaly detected', 'error');
            this.showToast('Test failed. Quantum flux detected.', 'error');
            this.stopTest();
        }
    }
    
    setActivePhase(phase) {
        this.currentPhase = phase;
        
        // Update timeline dots
        this.timelineDots.forEach(dot => {
            dot.classList.remove('active');
            if (dot.dataset.phase === phase) {
                dot.classList.add('active');
            }
        });
        
        // Update timeline progress
        const progressMap = {
            'ping': '25%',
            'download': '50%',
            'upload': '75%',
            'complete': '100%'
        };
        
        if (progressMap[phase]) {
            this.timelineProgress.style.width = progressMap[phase];
        }
        
        // Update status text
        const statusMap = {
            'ping': 'Measuring quantum ping...',
            'download': 'Analyzing download stream...',
            'upload': 'Calibrating upload matrix...',
            'complete': 'Quantum analysis complete'
        };
        
        if (statusMap[phase] && phase !== 'complete') {
            this.updateStatus(statusMap[phase], 'testing');
        }
    }
    
    async testPing() {
        return new Promise((resolve) => {
            const samples = 5;
            let totalPing = 0;
            let completed = 0;
            
            const measurePing = () => {
                const startTime = performance.now();
                
                // Quantum ping simulation with realistic variations
                setTimeout(() => {
                    const basePing = 10 + Math.random() * 40; // 10-50ms base
                    const quantumVariation = Math.sin(Date.now() / 1000) * 10; // Sine wave variation
                    const ping = Math.max(5, basePing + quantumVariation);
                    
                    totalPing += ping;
                    completed++;
                    
                    // Update display
                    const currentAvg = Math.round(totalPing / completed);
                    this.pingValue.textContent = currentAvg;
                    this.updateGraph('ping', ping / 100); // Normalize for graph
                    this.updateQuality('ping', currentAvg);
                    
                    // Update speedometer with animation
                    this.updateSpeedometer(currentAvg, 100);
                    
                    if (completed < samples) {
                        setTimeout(measurePing, 200);
                    } else {
                        const finalPing = Math.round(totalPing / samples);
                        this.testResults.ping = finalPing;
                        resolve(finalPing);
                    }
                }, 20);
            };
            
            measurePing();
        });
    }
    
    testDownload() {
        return new Promise((resolve) => {
            const duration = this.settings.duration * 1000;
            const startTime = performance.now();
            let maxSpeed = 0;
            
            const simulateDownload = (timestamp) => {
                if (!startTime) startTime = timestamp;
                
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Quantum download curve with realistic patterns
                const baseSpeed = 50 + Math.random() * 150; // 50-200 Mbps
                const rampUp = Math.min(progress * 3, 1); // Fast ramp up
                const stability = Math.sin(progress * Math.PI * 2) * 20; // Sine wave variation
                const quantumBoost = Math.random() * 30; // Random quantum boosts
                
                let currentSpeed;
                if (progress < 0.3) {
                    // Ramp up phase
                    currentSpeed = baseSpeed * rampUp + quantumBoost;
                } else if (progress < 0.8) {
                    // Stable phase with variations
                    currentSpeed = baseSpeed + stability + quantumBoost;
                } else {
                    // Slow down phase
                    currentSpeed = baseSpeed * (1 - (progress - 0.8) * 5) + quantumBoost;
                }
                
                currentSpeed = Math.max(20, currentSpeed);
                maxSpeed = Math.max(maxSpeed, currentSpeed);
                
                // Update displays
                this.downloadValue.textContent = currentSpeed.toFixed(1);
                this.updateSpeedometer(currentSpeed, 300);
                this.updateGraph('download', progress);
                this.updateQuality('download', currentSpeed);
                this.updateSystemLoad(progress, 'download');
                
                // Continue animation
                if (progress < 1 && this.isTesting && this.currentPhase === 'download') {
                    requestAnimationFrame(simulateDownload);
                } else {
                    const finalSpeed = maxSpeed;
                    this.testResults.download = finalSpeed;
                    resolve(finalSpeed);
                }
            };
            
            requestAnimationFrame(simulateDownload);
        });
    }
    
    testUpload() {
        return new Promise((resolve) => {
            const duration = this.settings.duration * 1000;
            const startTime = performance.now();
            let maxSpeed = 0;
            
            const simulateUpload = (timestamp) => {
                if (!startTime) startTime = timestamp;
                
                const elapsed = timestamp - startTime;
                const progress = Math.min(elapsed / duration, 1);
                
                // Quantum upload curve (typically slower than download)
                const baseSpeed = 10 + Math.random() * 40; // 10-50 Mbps
                const rampUp = Math.min(progress * 2, 1); // Slower ramp up
                const stability = Math.sin(progress * Math.PI * 3) * 10; // Smaller variations
                const quantumSpike = Math.random() > 0.9 ? 20 : 0; // Occasional spikes
                
                let currentSpeed;
                if (progress < 0.5) {
                    // Gradual ramp up
                    currentSpeed = baseSpeed * rampUp;
                } else {
                    // Stable with occasional spikes
                    currentSpeed = baseSpeed + stability + quantumSpike;
                }
                
                currentSpeed = Math.max(5, currentSpeed);
                maxSpeed = Math.max(maxSpeed, currentSpeed);
                
                // Update displays
                this.uploadValue.textContent = currentSpeed.toFixed(1);
                this.updateSpeedometer(currentSpeed, 100);
                this.updateGraph('upload', progress);
                this.updateQuality('upload', currentSpeed);
                this.updateSystemLoad(progress, 'upload');
                
                // Continue animation
                if (progress < 1 && this.isTesting && this.currentPhase === 'upload') {
                    requestAnimationFrame(simulateUpload);
                } else {
                    const finalSpeed = maxSpeed;
                    this.testResults.upload = finalSpeed;
                    resolve(finalSpeed);
                }
            };
            
            requestAnimationFrame(simulateUpload);
        });
    }
    
    async testJitter(basePing) {
        return new Promise((resolve) => {
            const samples = 8;
            let variations = [];
            let completed = 0;
            
            const takeSample = () => {
                // Quantum jitter simulation
                const timeVariation = Math.sin(Date.now() / 500) * 8; // Time-based variation
                const randomVariation = (Math.random() - 0.5) * 12; // Random variation
                const jitter = Math.abs(timeVariation + randomVariation);
                
                variations.push(jitter);
                completed++;
                
                // Update display
                const currentJitter = variations.reduce((a, b) => a + b, 0) / variations.length;
                this.jitterValue.textContent = currentJitter.toFixed(1);
                this.updateGraph('jitter', jitter / 20); // Normalize for graph
                this.updateQuality('jitter', currentJitter);
                
                if (completed < samples) {
                    setTimeout(takeSample, 150);
                } else {
                    const finalJitter = variations.reduce((a, b) => a + b, 0) / variations.length;
                    this.testResults.jitter = finalJitter;
                    resolve(finalJitter);
                }
            };
            
            takeSample();
        });
    }
    
    updateSpeedometer(value, maxValue) {
        const circumference = 534;
        const progress = Math.min(value / maxValue, 1);
        const offset = circumference - (progress * circumference);
        
        // Smooth animation with easing
        this.ringProgress.style.transition = 'stroke-dashoffset 0.8s cubic-bezier(0.34, 1.56, 0.64, 1)';
        this.ringProgress.style.strokeDashoffset = offset;
        
        // Animate value display
        let currentDisplay = parseFloat(this.speedValue.textContent) || 0;
        const startValue = currentDisplay;
        const endValue = this.currentPhase === 'ping' || this.currentPhase === 'jitter' ? 
            Math.round(value) : value;
        const duration = 800;
        const startTime = performance.now();
        
        const animateValue = (timestamp) => {
            const elapsed = timestamp - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            // Cubic easing for smooth animation
            const easedProgress = 1 - Math.pow(1 - progress, 3);
            currentDisplay = startValue + (endValue - startValue) * easedProgress;
            
            this.speedValue.textContent = this.currentPhase === 'ping' || this.currentPhase === 'jitter' ? 
                Math.round(currentDisplay) : currentDisplay.toFixed(1);
            
            if (progress < 1) {
                requestAnimationFrame(animateValue);
            }
        };
        
        requestAnimationFrame(animateValue);
    }
    
    updateResult(type, value) {
        // Update main value
        const element = document.getElementById(`${type}Value`);
        if (element) {
            element.textContent = type === 'ping' || type === 'jitter' ? 
                Math.round(value) : value.toFixed(1);
        }
        
        // Update quality badge
        this.updateQuality(type, value);
        
        // Store result
        this.testResults[type] = value;
    }
    
    updateQuality(type, value) {
        let quality = 'Poor';
        let color = '#FF3366';
        let badgeColor = 'rgba(255, 51, 102, 0.2)';
        let borderColor = 'rgba(255, 51, 102, 0.3)';
        
        switch(type) {
            case 'ping':
                if (value < 20) { quality = 'Excellent'; color = '#00FF88'; 
                    badgeColor = 'rgba(0, 255, 136, 0.2)'; borderColor = 'rgba(0, 255, 136, 0.3)'; }
                else if (value < 50) { quality = 'Good'; color = '#00D4FF'; 
                    badgeColor = 'rgba(0, 212, 255, 0.2)'; borderColor = 'rgba(0, 212, 255, 0.3)'; }
                else if (value < 100) { quality = 'Fair'; color = '#FFA500'; 
                    badgeColor = 'rgba(255, 165, 0, 0.2)'; borderColor = 'rgba(255, 165, 0, 0.3)'; }
                break;
                
            case 'download':
                if (value > 100) { quality = 'Excellent'; color = '#00FF88'; 
                    badgeColor = 'rgba(0, 255, 136, 0.2)'; borderColor = 'rgba(0, 255, 136, 0.3)'; }
                else if (value > 50) { quality = 'Good'; color = '#00D4FF'; 
                    badgeColor = 'rgba(0, 212, 255, 0.2)'; borderColor = 'rgba(0, 212, 255, 0.3)'; }
                else if (value > 25) { quality = 'Fair'; color = '#FFA500'; 
                    badgeColor = 'rgba(255, 165, 0, 0.2)'; borderColor = 'rgba(255, 165, 0, 0.3)'; }
                break;
                
            case 'upload':
                if (value > 50) { quality = 'Excellent'; color = '#00FF88'; 
                    badgeColor = 'rgba(0, 255, 136, 0.2)'; borderColor = 'rgba(0, 255, 136, 0.3)'; }
                else if (value > 25) { quality = 'Good'; color = '#00D4FF'; 
                    badgeColor = 'rgba(0, 212, 255, 0.2)'; borderColor = 'rgba(0, 212, 255, 0.3)'; }
                else if (value > 10) { quality = 'Fair'; color = '#FFA500'; 
                    badgeColor = 'rgba(255, 165, 0, 0.2)'; borderColor = 'rgba(255, 165, 0, 0.3)'; }
                break;
                
            case 'jitter':
                if (value < 5) { quality = 'Excellent'; color = '#00FF88'; 
                    badgeColor = 'rgba(0, 255, 136, 0.2)'; borderColor = 'rgba(0, 255, 136, 0.3)'; }
                else if (value < 10) { quality = 'Good'; color = '#00D4FF'; 
                    badgeColor = 'rgba(0, 212, 255, 0.2)'; borderColor = 'rgba(0, 212, 255, 0.3)'; }
                else if (value < 20) { quality = 'Fair'; color = '#FFA500'; 
                    badgeColor = 'rgba(255, 165, 0, 0.2)'; borderColor = 'rgba(255, 165, 0, 0.3)'; }
                break;
        }
        
        const badge = document.getElementById(`${type}Quality`);
        if (badge) {
            badge.textContent = quality;
            badge.style.color = color;
            badge.style.background = badgeColor;
            badge.style.borderColor = borderColor;
        }
    }
    
    updateGraph(type, progress) {
        const graph = document.getElementById(`${type}Graph`);
        if (graph) {
            const width = Math.min(progress * 100, 100);
            graph.style.width = `${width}%`;
        }
    }
    
    updateSystemLoad(progress, type) {
        // Update processor load
        const processorLoad = Math.min(progress * 100, 100);
        this.processorLoad.textContent = `${Math.round(processorLoad)}%`;
        
        // Update network load
        const networkLoad = type === 'download' ? 
            Math.min(progress * 120, 100) : 
            Math.min(progress * 80, 100);
        this.networkLoad.textContent = `${Math.round(networkLoad)}%`;
    }
    
    updateStatus(text, state) {
        this.statusText.textContent = text;
        
        switch(state) {
            case 'testing':
                this.statusDot.style.background = '#FFA500';
                this.statusDot.style.animation = 'statusPulse 1s infinite';
                break;
            case 'success':
                this.statusDot.style.background = '#00FF88';
                this.statusDot.style.animation = 'none';
                break;
            case 'error':
                this.statusDot.style.background = '#FF3366';
                this.statusDot.style.animation = 'none';
                break;
            case 'stopped':
                this.statusDot.style.background = '#FF3366';
                this.statusDot.style.animation = 'none';
                break;
            default:
                this.statusDot.style.background = '#00FF88';
                this.statusDot.style.animation = 'statusPulse 2s infinite';
        }
    }
    
    updateTime() {
        const now = new Date();
        const timeString = now.toLocaleTimeString([], { 
            hour: '2-digit', 
            minute: '2-digit',
            second: '2-digit',
            hour12: false 
        });
        this.currentTime.textContent = timeString;
    }
    
    updateNetworkInfo() {
        if (navigator.connection) {
            const connection = navigator.connection;
            let type = 'Quantum Link';
            
            if (connection.effectiveType) {
                const types = {
                    'slow-2g': 'Quantum I',
                    '2g': 'Quantum II',
                    '3g': 'Quantum III',
                    '4g': 'Quantum IV'
                };
                type = types[connection.effectiveType] || 'Quantum Link';
            }
            
            this.networkType.textContent = type;
        } else {
            this.networkType.textContent = 'Quantum Link';
        }
    }
    
    saveResults() {
        const result = {
            ...this.testResults,
            timestamp: new Date().toISOString(),
            duration: this.settings.duration,
            intensity: this.settings.intensity
        };
        
        let history = JSON.parse(localStorage.getItem('quantumHistory')) || [];
        history.unshift(result);
        
        if (history.length > 20) {
            history = history.slice(0, 20);
        }
        
        localStorage.setItem('quantumHistory', JSON.stringify(history));
    }
    
    showModal(modal) {
        modal.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }
    
    closeModals() {
        document.querySelectorAll('.modal-overlay').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.body.style.overflow = '';
    }
    
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        
        let icon = 'fa-info-circle';
        if (type === 'success') icon = 'fa-check-circle';
        if (type === 'error') icon = 'fa-exclamation-circle';
        
        toast.innerHTML = `
            <i class="fas ${icon}"></i>
            <span>${message}</span>
        `;
        
        const container = document.getElementById('toastContainer');
        container.appendChild(toast);
        
        // Remove after delay
        setTimeout(() => {
            toast.style.opacity = '0';
            toast.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (toast.parentNode) {
                    toast.parentNode.removeChild(toast);
                }
            }, 300);
        }, 3000);
    }
    
    /* Particle System */
    initParticles() {
        if (!this.settings.particleEffect) return;
        
        // Create initial particles
        for (let i = 0; i < 30; i++) {
            this.createParticle();
        }
        
        // Start particle animation loop
        this.animateParticles();
    }
    
    createParticle() {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // Random properties
        const size = Math.random() * 4 + 1;
        const x = Math.random() * 100;
        const y = Math.random() * 100;
        const color = this.getRandomColor();
        
        particle.style.width = `${size}px`;
        particle.style.height = `${size}px`;
        particle.style.background = color;
        particle.style.left = `${x}%`;
        particle.style.top = `${y}%`;
        particle.style.opacity = Math.random() * 0.3 + 0.1;
        
        // Store particle data
        const particleData = {
            element: particle,
            x: x,
            y: y,
            speedX: (Math.random() - 0.5) * 0.2,
            speedY: (Math.random() - 0.5) * 0.2,
            opacity: parseFloat(particle.style.opacity)
        };
        
        this.particlesContainer.appendChild(particle);
        this.particles.push(particleData);
    }
    
    createParticleExplosion(count, duration = 1000) {
        if (!this.settings.particleEffect) return;
        
        const centerX = 50;
        const centerY = 50;
        
        for (let i = 0; i < count; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 8 + 2;
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 2 + 1;
                const color = this.getRandomColor();
                const distance = Math.random() * 30 + 10;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.background = color;
                particle.style.left = `${centerX}%`;
                particle.style.top = `${centerY}%`;
                particle.style.opacity = '0.8';
                particle.style.boxShadow = `0 0 ${size * 2}px ${color}`;
                
                this.particlesContainer.appendChild(particle);
                
                // Animate explosion
                const startTime = Date.now();
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = elapsed / duration;
                    
                    if (progress < 1) {
                        const currentDistance = distance * progress;
                        const x = centerX + Math.cos(angle) * currentDistance;
                        const y = centerY + Math.sin(angle) * currentDistance;
                        const opacity = 0.8 * (1 - progress);
                        
                        particle.style.left = `${x}%`;
                        particle.style.top = `${y}%`;
                        particle.style.opacity = opacity.toString();
                        
                        requestAnimationFrame(animate);
                    } else {
                        particle.remove();
                    }
                };
                
                animate();
            }, i * 2);
        }
    }
    
    createCelebrationParticles() {
        if (!this.settings.particleEffect) return;
        
        // Create celebration particles from the speedometer
        const centerX = 50;
        const centerY = 50;
        
        for (let i = 0; i < 200; i++) {
            setTimeout(() => {
                const particle = document.createElement('div');
                particle.className = 'particle';
                
                const size = Math.random() * 6 + 2;
                const angle = Math.random() * Math.PI * 2;
                const color = this.getRandomColor();
                const distance = Math.random() * 60 + 20;
                const duration = Math.random() * 1000 + 500;
                
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.background = color;
                particle.style.left = `${centerX}%`;
                particle.style.top = `${centerY}%`;
                particle.style.opacity = '1';
                particle.style.boxShadow = `0 0 ${size * 3}px ${color}`;
                
                this.particlesContainer.appendChild(particle);
                
                // Animate celebration
                const startTime = Date.now();
                const animate = () => {
                    const elapsed = Date.now() - startTime;
                    const progress = elapsed / duration;
                    
                    if (progress < 1) {
                        const easedProgress = 1 - Math.pow(1 - progress, 3);
                        const currentDistance = distance * easedProgress;
                        const x = centerX + Math.cos(angle) * currentDistance;
                        const y = centerY + Math.sin(angle) * currentDistance;
                        const opacity = 1 - easedProgress;
                        
                        particle.style.left = `${x}%`;
                        particle.style.top = `${y}%`;
                        particle.style.opacity = opacity.toString();
                        
                        requestAnimationFrame(animate);
                    } else {
                        particle.remove();
                    }
                };
                
                animate();
            }, i * 10);
        }
    }
    
    getRandomColor() {
        const colors = [
            '#FF6B00', '#FF8C00', '#FFA500', '#FFD700',
            '#00D4FF', '#00FF88', '#9D4EDD', '#FF3366'
        ];
        return colors[Math.floor(Math.random() * colors.length)];
    }
    
    animateParticles() {
        if (!this.settings.particleEffect) return;
        
        this.particles.forEach(particle => {
            // Update position
            particle.x += particle.speedX;
            particle.y += particle.speedY;
            
            // Bounce off edges
            if (particle.x <= 0 || particle.x >= 100) particle.speedX *= -1;
            if (particle.y <= 0 || particle.y >= 100) particle.speedY *= -1;
            
            // Apply slight gravity
            particle.speedY += 0.001;
            
            // Update element
            particle.element.style.left = `${particle.x}%`;
            particle.element.style.top = `${particle.y}%`;
            
            // Pulsating opacity
            const time = Date.now() / 1000;
            const opacity = particle.opacity * (0.7 + 0.3 * Math.sin(time * 2 + particle.x));
            particle.element.style.opacity = opacity.toString();
        });
        
        // Remove old particles and add new ones occasionally
        if (Math.random() < 0.02 && this.particles.length < 50) {
            this.createParticle();
        }
        
        // Continue animation
        requestAnimationFrame(() => this.animateParticles());
    }
    
    startAnimations() {
        // Start continuous background animations
        this.animateSystemMetrics();
    }
    
    animateSystemMetrics() {
        // Animate processor and network load when not testing
        if (!this.isTesting) {
            const time = Date.now() / 1000;
            const processorLoad = 5 + Math.sin(time) * 3 + Math.random() * 2;
            const networkLoad = 2 + Math.cos(time * 1.5) * 2 + Math.random() * 1;
            
            this.processorLoad.textContent = `${Math.round(processorLoad)}%`;
            this.networkLoad.textContent = `${Math.round(networkLoad)}%`;
        }
        
        // Continue animation
        requestAnimationFrame(() => this.animateSystemMetrics());
    }
}

// Initialize the quantum speed test when DOM loads
document.addEventListener('DOMContentLoaded', () => {
    new QuantumSpeedTest();
});

// Add CSS for particles
const style = document.createElement('style');
style.textContent = `
    .particle {
        position: absolute;
        border-radius: 50%;
        pointer-events: none;
        z-index: 1;
        transition: opacity 0.3s ease;
    }
`;
document.head.appendChild(style);