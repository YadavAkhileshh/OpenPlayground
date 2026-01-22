// ====================================
// Constants and Configuration
// ====================================
const PIPELINE_TEMPLATES = {
    nodejs: {
        name: 'Node.js Application Pipeline',
        stages: [
            {
                id: 'build',
                name: 'Build',
                phase: 'ci',
                jobs: [
                    {
                        id: 'install',
                        name: 'Install Dependencies',
                        steps: [
                            { name: 'Checkout code', duration: 2 },
                            { name: 'Setup Node.js 18.x', duration: 3 },
                            { name: 'Restore npm cache', duration: 1, cached: true },
                            { name: 'npm install', duration: 15 },
                            { name: 'Save npm cache', duration: 2 }
                        ]
                    },
                    {
                        id: 'compile',
                        name: 'Compile TypeScript',
                        steps: [
                            { name: 'Run TypeScript compiler', duration: 8 },
                            { name: 'Generate source maps', duration: 3 },
                            { name: 'Verify build output', duration: 2 }
                        ]
                    }
                ]
            },
            {
                id: 'test',
                name: 'Test',
                phase: 'ci',
                jobs: [
                    {
                        id: 'unit',
                        name: 'Unit Tests',
                        steps: [
                            { name: 'Setup test environment', duration: 3 },
                            { name: 'Run Jest tests', duration: 12 },
                            { name: 'Generate coverage report', duration: 4 }
                        ]
                    },
                    {
                        id: 'lint',
                        name: 'Lint & Format',
                        steps: [
                            { name: 'Run ESLint', duration: 5 },
                            { name: 'Check Prettier formatting', duration: 3 },
                            { name: 'Verify type definitions', duration: 4 }
                        ]
                    },
                    {
                        id: 'integration',
                        name: 'Integration Tests',
                        steps: [
                            { name: 'Start test database', duration: 5 },
                            { name: 'Run integration tests', duration: 18 },
                            { name: 'Cleanup test data', duration: 3 }
                        ]
                    }
                ]
            },
            {
                id: 'artifact',
                name: 'Create Artifacts',
                phase: 'ci',
                jobs: [
                    {
                        id: 'package',
                        name: 'Package Application',
                        steps: [
                            { name: 'Bundle application', duration: 10 },
                            { name: 'Optimize assets', duration: 7 },
                            { name: 'Generate package.json', duration: 2 },
                            { name: 'Create archive', duration: 5 },
                            { name: 'Upload to artifact store', duration: 8 }
                        ],
                        artifact: { name: 'app-bundle.tar.gz', size: '45.2 MB' }
                    }
                ]
            },
            {
                id: 'deploy',
                name: 'Deploy',
                phase: 'cd',
                jobs: [
                    {
                        id: 'staging',
                        name: 'Deploy to Staging',
                        steps: [
                            { name: 'Download artifacts', duration: 6 },
                            { name: 'Configure environment', duration: 4 },
                            { name: 'Deploy to staging servers', duration: 12 },
                            { name: 'Run smoke tests', duration: 8 },
                            { name: 'Verify deployment', duration: 5 }
                        ]
                    },
                    {
                        id: 'production',
                        name: 'Deploy to Production',
                        steps: [
                            { name: 'Download artifacts', duration: 6 },
                            { name: 'Backup current version', duration: 5 },
                            { name: 'Blue-green deployment', duration: 15 },
                            { name: 'Health check', duration: 7 },
                            { name: 'Switch traffic', duration: 3 }
                        ]
                    }
                ]
            }
        ]
    },
    python: {
        name: 'Python API Pipeline',
        stages: [
            {
                id: 'build',
                name: 'Build',
                phase: 'ci',
                jobs: [
                    {
                        id: 'setup',
                        name: 'Setup Environment',
                        steps: [
                            { name: 'Checkout repository', duration: 2 },
                            { name: 'Setup Python 3.11', duration: 4 },
                            { name: 'Create virtual environment', duration: 3 },
                            { name: 'Restore pip cache', duration: 1, cached: true },
                            { name: 'Install dependencies', duration: 12 },
                            { name: 'Save pip cache', duration: 2 }
                        ]
                    }
                ]
            },
            {
                id: 'test',
                name: 'Test',
                phase: 'ci',
                jobs: [
                    {
                        id: 'unittest',
                        name: 'Unit Tests',
                        steps: [
                            { name: 'Run pytest', duration: 10 },
                            { name: 'Generate coverage report', duration: 4 },
                            { name: 'Upload coverage to Codecov', duration: 3 }
                        ]
                    },
                    {
                        id: 'quality',
                        name: 'Code Quality',
                        steps: [
                            { name: 'Run flake8', duration: 4 },
                            { name: 'Run pylint', duration: 6 },
                            { name: 'Run black formatter check', duration: 3 },
                            { name: 'Security scan with bandit', duration: 5 }
                        ]
                    }
                ]
            },
            {
                id: 'artifact',
                name: 'Build Package',
                phase: 'ci',
                jobs: [
                    {
                        id: 'package',
                        name: 'Create Distribution',
                        steps: [
                            { name: 'Build wheel package', duration: 7 },
                            { name: 'Build source distribution', duration: 5 },
                            { name: 'Generate requirements.txt', duration: 2 },
                            { name: 'Create Docker image', duration: 20 },
                            { name: 'Push to registry', duration: 15 }
                        ],
                        artifact: { name: 'api-image:v1.2.3', size: '312 MB' }
                    }
                ]
            },
            {
                id: 'deploy',
                name: 'Deploy',
                phase: 'cd',
                jobs: [
                    {
                        id: 'k8s',
                        name: 'Deploy to Kubernetes',
                        steps: [
                            { name: 'Configure kubectl', duration: 3 },
                            { name: 'Update deployment manifests', duration: 4 },
                            { name: 'Apply rolling update', duration: 18 },
                            { name: 'Wait for rollout', duration: 12 },
                            { name: 'Verify pod health', duration: 6 }
                        ]
                    }
                ]
            }
        ]
    },
    docker: {
        name: 'Docker Multi-Stage Build Pipeline',
        stages: [
            {
                id: 'build',
                name: 'Build',
                phase: 'ci',
                jobs: [
                    {
                        id: 'multistage',
                        name: 'Multi-Stage Build',
                        steps: [
                            { name: 'Clone repository', duration: 3 },
                            { name: 'Build stage 1: Dependencies', duration: 15 },
                            { name: 'Build stage 2: Application', duration: 12 },
                            { name: 'Build stage 3: Production', duration: 10 },
                            { name: 'Tag image', duration: 2 }
                        ]
                    }
                ]
            },
            {
                id: 'test',
                name: 'Test',
                phase: 'ci',
                jobs: [
                    {
                        id: 'security',
                        name: 'Security Scan',
                        steps: [
                            { name: 'Scan with Trivy', duration: 8 },
                            { name: 'Check for vulnerabilities', duration: 5 },
                            { name: 'Generate security report', duration: 3 }
                        ]
                    },
                    {
                        id: 'container',
                        name: 'Container Tests',
                        steps: [
                            { name: 'Start container', duration: 4 },
                            { name: 'Run health checks', duration: 6 },
                            { name: 'Test endpoints', duration: 8 },
                            { name: 'Stop container', duration: 2 }
                        ]
                    }
                ]
            },
            {
                id: 'artifact',
                name: 'Push Image',
                phase: 'ci',
                jobs: [
                    {
                        id: 'registry',
                        name: 'Push to Registry',
                        steps: [
                            { name: 'Login to Docker Hub', duration: 2 },
                            { name: 'Tag for registry', duration: 1 },
                            { name: 'Push image layers', duration: 25 },
                            { name: 'Update image manifest', duration: 3 }
                        ],
                        artifact: { name: 'myapp:latest', size: '267 MB' }
                    }
                ]
            },
            {
                id: 'deploy',
                name: 'Deploy',
                phase: 'cd',
                jobs: [
                    {
                        id: 'swarm',
                        name: 'Deploy to Docker Swarm',
                        steps: [
                            { name: 'Connect to swarm', duration: 2 },
                            { name: 'Update service definition', duration: 4 },
                            { name: 'Rolling update', duration: 15 },
                            { name: 'Verify replicas', duration: 8 }
                        ]
                    }
                ]
            }
        ]
    },
    monorepo: {
        name: 'Monorepo Pipeline',
        stages: [
            {
                id: 'build',
                name: 'Build',
                phase: 'ci',
                jobs: [
                    {
                        id: 'frontend',
                        name: 'Build Frontend',
                        steps: [
                            { name: 'Checkout code', duration: 2 },
                            { name: 'Install frontend deps', duration: 10 },
                            { name: 'Build React app', duration: 15 },
                            { name: 'Optimize bundle', duration: 8 }
                        ]
                    },
                    {
                        id: 'backend',
                        name: 'Build Backend',
                        steps: [
                            { name: 'Checkout code', duration: 2 },
                            { name: 'Install backend deps', duration: 8 },
                            { name: 'Compile Go binary', duration: 12 }
                        ]
                    },
                    {
                        id: 'shared',
                        name: 'Build Shared Libs',
                        steps: [
                            { name: 'Build common package', duration: 6 },
                            { name: 'Build utils package', duration: 5 },
                            { name: 'Generate types', duration: 4 }
                        ]
                    }
                ]
            },
            {
                id: 'test',
                name: 'Test',
                phase: 'ci',
                jobs: [
                    {
                        id: 'frontend-test',
                        name: 'Frontend Tests',
                        steps: [
                            { name: 'Jest unit tests', duration: 10 },
                            { name: 'React Testing Library', duration: 8 },
                            { name: 'Cypress E2E tests', duration: 20 }
                        ]
                    },
                    {
                        id: 'backend-test',
                        name: 'Backend Tests',
                        steps: [
                            { name: 'Go unit tests', duration: 8 },
                            { name: 'Integration tests', duration: 15 },
                            { name: 'API contract tests', duration: 10 }
                        ]
                    }
                ]
            },
            {
                id: 'artifact',
                name: 'Package',
                phase: 'ci',
                jobs: [
                    {
                        id: 'package-all',
                        name: 'Package All Services',
                        steps: [
                            { name: 'Package frontend', duration: 5 },
                            { name: 'Package backend', duration: 4 },
                            { name: 'Create deployment bundle', duration: 8 },
                            { name: 'Upload artifacts', duration: 12 }
                        ],
                        artifact: { name: 'monorepo-bundle.zip', size: '128 MB' }
                    }
                ]
            },
            {
                id: 'deploy',
                name: 'Deploy',
                phase: 'cd',
                jobs: [
                    {
                        id: 'deploy-frontend',
                        name: 'Deploy Frontend',
                        steps: [
                            { name: 'Deploy to CDN', duration: 10 },
                            { name: 'Invalidate cache', duration: 5 }
                        ]
                    },
                    {
                        id: 'deploy-backend',
                        name: 'Deploy Backend',
                        steps: [
                            { name: 'Deploy to ECS', duration: 15 },
                            { name: 'Update load balancer', duration: 5 }
                        ]
                    }
                ]
            }
        ]
    }
};

const DEFAULT_SPEED = 5;
const SPEED_MULTIPLIER_BASE = 0.5;

// ====================================
// State Management
// ====================================
class PipelineState {
    constructor() {
        this.currentTemplate = 'nodejs';
        this.isRunning = false;
        this.isPaused = false;
        this.currentStageIndex = 0;
        this.stages = [];
        this.executionStart = null;
        this.executionEnd = null;
        this.failureInjection = null;
        this.config = {
            enableCache: true,
            parallelMode: true,
            verboseLogs: false,
            autoRetry: false
        };
        this.cache = {
            dependencies: false,
            build: false,
            test: false
        };
        this.artifacts = [];
        this.logs = [];
        this.stats = {
            totalRuns: 0,
            successfulRuns: 0,
            totalDuration: 0
        };
        this.timeline = [];
        this.speedMultiplier = 1;
        this.executionIntervals = [];
    }

    reset() {
        this.stopAllIntervals();
        this.isRunning = false;
        this.isPaused = false;
        this.currentStageIndex = 0;
        this.executionStart = null;
        this.executionEnd = null;
        this.failureInjection = null;
        this.artifacts = [];
        this.logs = [];
        this.timeline = [];
    }

    stopAllIntervals() {
        this.executionIntervals.forEach(interval => clearInterval(interval));
        this.executionIntervals = [];
    }

    addInterval(interval) {
        this.executionIntervals.push(interval);
    }

    loadTemplate(templateKey) {
        this.currentTemplate = templateKey;
        this.stages = JSON.parse(JSON.stringify(PIPELINE_TEMPLATES[templateKey].stages));
        this.initializeStageStates();
    }

    initializeStageStates() {
        this.stages.forEach(stage => {
            stage.status = 'pending';
            stage.startTime = null;
            stage.endTime = null;
            stage.jobs.forEach(job => {
                job.status = 'pending';
                job.startTime = null;
                job.endTime = null;
                job.steps.forEach(step => {
                    step.status = 'pending';
                    step.actualDuration = null;
                });
            });
        });
    }

    addLog(level, message) {
        const timestamp = new Date().toLocaleTimeString();
        this.logs.push({ timestamp, level, message });
        if (this.logs.length > 100) {
            this.logs.shift();
        }
    }
}

// ====================================
// UI Controller
// ====================================
class UIController {
    constructor(state) {
        this.state = state;
        this.elements = this.cacheElements();
        this.attachEventListeners();
    }

    cacheElements() {
        return {
            pipelineName: document.getElementById('pipelineName'),
            pipelineStatus: document.getElementById('pipelineStatus'),
            pipelineDuration: document.getElementById('pipelineDuration'),
            pipelineStages: document.getElementById('pipelineStages'),
            timeline: document.getElementById('timeline'),
            cacheStatus: document.getElementById('cacheStatus'),
            artifactsList: document.getElementById('artifactsList'),
            executionLogs: document.getElementById('executionLogs'),
            totalRuns: document.getElementById('totalRuns'),
            successRate: document.getElementById('successRate'),
            avgDuration: document.getElementById('avgDuration'),
            metricTotalTime: document.getElementById('metricTotalTime'),
            metricCacheSavings: document.getElementById('metricCacheSavings'),
            metricParallelGain: document.getElementById('metricParallelGain'),
            startBtn: document.getElementById('startPipeline'),
            pauseBtn: document.getElementById('pausePipeline'),
            stopBtn: document.getElementById('stopPipeline'),
            resetBtn: document.getElementById('resetPipeline'),
            speedSlider: document.getElementById('speedSlider'),
            speedValue: document.getElementById('speedValue'),
            enableCache: document.getElementById('enableCache'),
            parallelMode: document.getElementById('parallelMode'),
            verboseLogs: document.getElementById('verboseLogs'),
            autoRetry: document.getElementById('autoRetry'),
            failureStage: document.getElementById('failureStage'),
            injectFailure: document.getElementById('injectFailure'),
            templateBtns: document.querySelectorAll('.template-btn'),
            phaseIndicators: document.querySelectorAll('.phase-indicator')
        };
    }

    attachEventListeners() {
        this.elements.startBtn.addEventListener('click', () => pipelineExecutor.start());
        this.elements.pauseBtn.addEventListener('click', () => pipelineExecutor.pause());
        this.elements.stopBtn.addEventListener('click', () => pipelineExecutor.stop());
        this.elements.resetBtn.addEventListener('click', () => pipelineExecutor.reset());

        this.elements.speedSlider.addEventListener('input', (e) => {
            const speed = parseInt(e.target.value);
            this.state.speedMultiplier = Math.pow(2, (speed - DEFAULT_SPEED) * SPEED_MULTIPLIER_BASE);
            this.elements.speedValue.textContent = this.state.speedMultiplier.toFixed(1) + 'x';
        });

        this.elements.enableCache.addEventListener('change', (e) => {
            this.state.config.enableCache = e.target.checked;
            this.state.addLog('info', `Cache ${e.target.checked ? 'enabled' : 'disabled'}`);
        });

        this.elements.parallelMode.addEventListener('change', (e) => {
            this.state.config.parallelMode = e.target.checked;
            this.state.addLog('info', `Parallel mode ${e.target.checked ? 'enabled' : 'disabled'}`);
            this.renderPipeline();
        });

        this.elements.verboseLogs.addEventListener('change', (e) => {
            this.state.config.verboseLogs = e.target.checked;
        });

        this.elements.autoRetry.addEventListener('change', (e) => {
            this.state.config.autoRetry = e.target.checked;
        });

        this.elements.injectFailure.addEventListener('click', () => {
            const stage = this.elements.failureStage.value;
            if (stage) {
                this.state.failureInjection = stage;
                this.state.addLog('warning', `Failure injection set for ${stage} stage`);
                this.elements.failureStage.value = '';
            }
        });

        this.elements.templateBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const template = e.currentTarget.dataset.template;
                this.selectTemplate(template);
            });
        });
    }

    selectTemplate(templateKey) {
        this.elements.templateBtns.forEach(btn => btn.classList.remove('active'));
        document.querySelector(`[data-template="${templateKey}"]`).classList.add('active');
        
        this.state.reset();
        this.state.loadTemplate(templateKey);
        
        const templateName = PIPELINE_TEMPLATES[templateKey].name;
        this.elements.pipelineName.textContent = templateName;
        this.state.addLog('info', `Loaded ${templateName}`);
        
        this.renderPipeline();
        this.updateStatus('idle');
        this.updateButtons('idle');
    }

    renderPipeline() {
        this.elements.pipelineStages.innerHTML = '';
        
        this.state.stages.forEach((stage, index) => {
            const stageEl = this.createStageElement(stage, index);
            this.elements.pipelineStages.appendChild(stageEl);
        });
    }

    createStageElement(stage, index) {
        const stageDiv = document.createElement('div');
        stageDiv.className = `stage ${stage.status}`;
        stageDiv.dataset.stageId = stage.id;
        
        const icon = this.getStageIcon(stage.id);
        const duration = stage.endTime && stage.startTime 
            ? ((stage.endTime - stage.startTime) / 1000).toFixed(1) + 's'
            : '-';
        
        stageDiv.innerHTML = `
            <div class="stage-header">
                <div class="stage-info">
                    <div class="stage-icon">${icon}</div>
                    <div class="stage-details">
                        <h3>${stage.name}</h3>
                        <div class="stage-meta">${stage.phase.toUpperCase()} Phase • ${stage.jobs.length} job${stage.jobs.length > 1 ? 's' : ''}</div>
                    </div>
                </div>
                <div class="stage-status">
                    <span class="status-badge ${stage.status}">${this.formatStatus(stage.status)}</span>
                    <span class="duration">${duration}</span>
                </div>
            </div>
            <div class="jobs-container ${this.state.config.parallelMode ? 'parallel' : 'sequential'}">
                ${stage.jobs.map(job => this.createJobElement(job)).join('')}
            </div>
        `;
        
        return stageDiv;
    }

    createJobElement(job) {
        const duration = job.endTime && job.startTime 
            ? ((job.endTime - job.startTime) / 1000).toFixed(1) + 's'
            : '-';
        
        return `
            <div class="job ${job.status}" data-job-id="${job.id}">
                <div class="job-header">
                    <span class="job-title">${job.name}</span>
                    <span class="job-status status-badge ${job.status}">${duration}</span>
                </div>
                <div class="steps">
                    ${job.steps.map(step => this.createStepElement(step)).join('')}
                </div>
            </div>
        `;
    }

    createStepElement(step) {
        const duration = step.actualDuration ? step.actualDuration.toFixed(1) + 's' : '';
        const cacheIndicator = step.cached && this.state.config.enableCache && this.state.cache.dependencies
            ? '<span style="color: var(--color-success); font-size: 0.7rem;"> (cached)</span>'
            : '';
        
        return `
            <div class="step ${step.status}">
                <div class="step-indicator"></div>
                <span class="step-text">${step.name}${cacheIndicator}</span>
                <span class="step-duration">${duration}</span>
            </div>
        `;
    }

    getStageIcon(stageId) {
        const icons = {
            build: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 3v18M15 3v18"/></svg>',
            test: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>',
            artifact: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>',
            deploy: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
        };
        return icons[stageId] || icons.build;
    }

    formatStatus(status) {
        const formats = {
            pending: 'Pending',
            running: 'Running',
            success: 'Success',
            failed: 'Failed',
            skipped: 'Skipped'
        };
        return formats[status] || status;
    }

    updateStage(stageId, updates) {
        const stageEl = document.querySelector(`[data-stage-id="${stageId}"]`);
        if (!stageEl) return;
        
        if (updates.status) {
            stageEl.className = `stage ${updates.status}`;
            const statusBadge = stageEl.querySelector('.stage-status .status-badge');
            if (statusBadge) {
                statusBadge.className = `status-badge ${updates.status}`;
                statusBadge.textContent = this.formatStatus(updates.status);
            }
        }
        
        if (updates.duration !== undefined) {
            const durationEl = stageEl.querySelector('.stage-status .duration');
            if (durationEl) {
                durationEl.textContent = updates.duration;
            }
        }
    }

    updateJob(stageId, jobId, updates) {
        const stageEl = document.querySelector(`[data-stage-id="${stageId}"]`);
        if (!stageEl) return;
        
        const jobEl = stageEl.querySelector(`[data-job-id="${jobId}"]`);
        if (!jobEl) return;
        
        if (updates.status) {
            jobEl.className = `job ${updates.status}`;
            const statusBadge = jobEl.querySelector('.job-status');
            if (statusBadge) {
                statusBadge.className = `job-status status-badge ${updates.status}`;
            }
        }
        
        if (updates.duration !== undefined) {
            const statusBadge = jobEl.querySelector('.job-status');
            if (statusBadge) {
                statusBadge.textContent = updates.duration;
            }
        }
        
        if (updates.steps) {
            const stepsContainer = jobEl.querySelector('.steps');
            if (stepsContainer) {
                stepsContainer.innerHTML = updates.steps.map(step => this.createStepElement(step)).join('');
            }
        }
    }

    updateStatus(status) {
        const badge = this.elements.pipelineStatus;
        badge.className = `status-badge ${status}`;
        badge.textContent = this.formatStatus(status);
    }

    updateDuration() {
        if (!this.state.executionStart) {
            this.elements.pipelineDuration.textContent = '0s';
            return;
        }
        
        const end = this.state.executionEnd || Date.now();
        const duration = ((end - this.state.executionStart) / 1000).toFixed(1);
        this.elements.pipelineDuration.textContent = duration + 's';
    }

    updateButtons(status) {
        switch (status) {
            case 'idle':
                this.elements.startBtn.disabled = false;
                this.elements.pauseBtn.disabled = true;
                this.elements.stopBtn.disabled = true;
                break;
            case 'running':
                this.elements.startBtn.disabled = true;
                this.elements.pauseBtn.disabled = false;
                this.elements.stopBtn.disabled = false;
                break;
            case 'paused':
                this.elements.startBtn.disabled = false;
                this.elements.pauseBtn.disabled = true;
                this.elements.stopBtn.disabled = false;
                break;
        }
    }

    updatePhaseIndicator(phase) {
        this.elements.phaseIndicators.forEach(indicator => {
            indicator.classList.remove('active');
            if (indicator.dataset.phase === phase) {
                indicator.classList.add('active');
            }
        });
    }

    updateCacheStatus() {
        const cacheItems = this.elements.cacheStatus.querySelectorAll('.cache-item');
        
        cacheItems[0].querySelector('.cache-value').className = 
            `cache-value ${this.state.cache.dependencies ? 'cache-hit' : 'cache-miss'}`;
        cacheItems[0].querySelector('.cache-value').textContent = 
            this.state.cache.dependencies ? 'HIT' : 'MISS';
        
        cacheItems[1].querySelector('.cache-value').className = 
            `cache-value ${this.state.cache.build ? 'cache-hit' : 'cache-miss'}`;
        cacheItems[1].querySelector('.cache-value').textContent = 
            this.state.cache.build ? 'HIT' : 'MISS';
        
        cacheItems[2].querySelector('.cache-value').className = 
            `cache-value ${this.state.cache.test ? 'cache-hit' : 'cache-miss'}`;
        cacheItems[2].querySelector('.cache-value').textContent = 
            this.state.cache.test ? 'HIT' : 'MISS';
    }

    updateArtifacts() {
        if (this.state.artifacts.length === 0) {
            this.elements.artifactsList.innerHTML = '<div class="empty-state">No artifacts generated yet</div>';
            return;
        }
        
        this.elements.artifactsList.innerHTML = this.state.artifacts.map(artifact => `
            <div class="artifact-item">
                <div class="artifact-icon">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                    </svg>
                </div>
                <div class="artifact-details">
                    <div class="artifact-name">${artifact.name}</div>
                    <div class="artifact-size">${artifact.size}</div>
                </div>
            </div>
        `).join('');
    }

    updateLogs() {
        const maxLogs = 50;
        const recentLogs = this.state.logs.slice(-maxLogs);
        
        this.elements.executionLogs.innerHTML = recentLogs.map(log => `
            <div class="log-entry ${log.level}">
                <span class="log-timestamp">${log.timestamp}</span>
                <span class="log-message">${log.message}</span>
            </div>
        `).join('');
        
        this.elements.executionLogs.scrollTop = this.elements.executionLogs.scrollHeight;
    }

    updateStats() {
        this.elements.totalRuns.textContent = this.state.stats.totalRuns;
        
        const successRate = this.state.stats.totalRuns > 0
            ? Math.round((this.state.stats.successfulRuns / this.state.stats.totalRuns) * 100)
            : 0;
        this.elements.successRate.textContent = successRate + '%';
        
        const avgDuration = this.state.stats.totalRuns > 0
            ? (this.state.stats.totalDuration / this.state.stats.totalRuns).toFixed(1)
            : 0;
        this.elements.avgDuration.textContent = avgDuration + 's';
    }

    updateTimeline() {
        if (this.state.timeline.length === 0) {
            this.elements.timeline.innerHTML = '<div class="empty-state">No timeline data yet</div>';
            return;
        }
        
        const maxDuration = Math.max(...this.state.timeline.map(item => item.duration));
        
        this.elements.timeline.innerHTML = this.state.timeline.map(item => `
            <div class="timeline-item">
                <div class="timeline-stage">${item.name}</div>
                <div class="timeline-bar-container">
                    <div class="timeline-bar ${item.id}" style="width: ${(item.duration / maxDuration) * 100}%">
                        ${item.name}
                    </div>
                </div>
                <div class="timeline-duration">${item.duration.toFixed(1)}s</div>
            </div>
        `).join('');
    }

    updateMetrics() {
        if (!this.state.executionStart) return;
        
        const totalTime = this.state.executionEnd 
            ? ((this.state.executionEnd - this.state.executionStart) / 1000).toFixed(1)
            : '0';
        this.elements.metricTotalTime.textContent = totalTime + 's';
        
        const cacheSavings = this.calculateCacheSavings();
        this.elements.metricCacheSavings.textContent = cacheSavings.toFixed(1) + 's';
        
        const parallelGain = this.calculateParallelGain();
        this.elements.metricParallelGain.textContent = parallelGain.toFixed(1) + 's';
    }

    calculateCacheSavings() {
        let savings = 0;
        if (this.state.config.enableCache) {
            this.state.stages.forEach(stage => {
                stage.jobs.forEach(job => {
                    job.steps.forEach(step => {
                        if (step.cached && this.state.cache.dependencies && step.actualDuration) {
                            savings += (step.duration * 0.7);
                        }
                    });
                });
            });
        }
        return savings / this.state.speedMultiplier;
    }

    calculateParallelGain() {
        let gain = 0;
        if (this.state.config.parallelMode) {
            this.state.stages.forEach(stage => {
                if (stage.jobs.length > 1) {
                    const jobDurations = stage.jobs.map(job => {
                        return job.steps.reduce((sum, step) => sum + (step.actualDuration || step.duration), 0);
                    });
                    const sequentialTime = jobDurations.reduce((sum, d) => sum + d, 0);
                    const parallelTime = Math.max(...jobDurations);
                    gain += (sequentialTime - parallelTime);
                }
            });
        }
        return gain / this.state.speedMultiplier;
    }
}

// ====================================
// Pipeline Executor
// ====================================
class PipelineExecutor {
    constructor(state, ui) {
        this.state = state;
        this.ui = ui;
        this.durationInterval = null;
    }

    async start() {
        if (this.state.isRunning && !this.state.isPaused) return;
        
        if (!this.state.isPaused) {
            this.state.reset();
            this.state.loadTemplate(this.state.currentTemplate);
            this.ui.renderPipeline();
        }
        
        this.state.isRunning = true;
        this.state.isPaused = false;
        this.state.executionStart = this.state.executionStart || Date.now();
        
        this.ui.updateStatus('running');
        this.ui.updateButtons('running');
        this.state.addLog('info', 'Pipeline execution started');
        
        this.durationInterval = setInterval(() => this.ui.updateDuration(), 250);
        this.state.addInterval(this.durationInterval);
        
        try {
            await this.executeStages();
        } catch (error) {
            this.state.addLog('error', `Pipeline error: ${error.message}`);
            this.handleFailure();
        }
    }

    pause() {
        if (!this.state.isRunning || this.state.isPaused) return;
        
        this.state.isPaused = true;
        this.ui.updateStatus('idle');
        this.ui.updateButtons('paused');
        this.state.addLog('warning', 'Pipeline paused');
    }

    stop() {
        this.state.stopAllIntervals();
        clearInterval(this.durationInterval);
        
        this.state.isRunning = false;
        this.state.isPaused = false;
        this.state.executionEnd = Date.now();
        
        this.ui.updateStatus('idle');
        this.ui.updateButtons('idle');
        this.ui.updateDuration();
        this.state.addLog('warning', 'Pipeline stopped');
        
        this.state.stages.forEach(stage => {
            if (stage.status === 'running') {
                stage.status = 'skipped';
                this.ui.updateStage(stage.id, { status: 'skipped' });
            }
        });
    }

    reset() {
        this.stop();
        this.state.reset();
        this.state.loadTemplate(this.state.currentTemplate);
        this.ui.renderPipeline();
        this.ui.updateStatus('idle');
        this.ui.updateButtons('idle');
        this.ui.updateTimeline();
        this.ui.updateArtifacts();
        this.state.addLog('info', 'Pipeline reset');
        this.ui.updateLogs();
    }

    async executeStages() {
        for (let i = 0; i < this.state.stages.length; i++) {
            if (!this.state.isRunning || this.state.isPaused) return;
            
            const stage = this.state.stages[i];
            this.state.currentStageIndex = i;
            
            this.ui.updatePhaseIndicator(stage.phase);
            
            await this.executeStage(stage);
            
            if (stage.status === 'failed') {
                if (this.state.config.autoRetry) {
                    this.state.addLog('warning', `Retrying ${stage.name} stage...`);
                    await this.sleep(1000 / this.state.speedMultiplier);
                    await this.executeStage(stage);
                    
                    if (stage.status === 'failed') {
                        this.handleFailure();
                        return;
                    }
                } else {
                    this.handleFailure();
                    return;
                }
            }
        }
        
        this.handleSuccess();
    }

    async executeStage(stage) {
        stage.status = 'running';
        stage.startTime = Date.now();
        this.ui.updateStage(stage.id, { status: 'running' });
        this.state.addLog('info', `Starting ${stage.name} stage`);
        
        if (this.state.failureInjection === stage.id) {
            await this.sleep(2000 / this.state.speedMultiplier);
            stage.status = 'failed';
            stage.endTime = Date.now();
            this.ui.updateStage(stage.id, { 
                status: 'failed',
                duration: ((stage.endTime - stage.startTime) / 1000).toFixed(1) + 's'
            });
            this.state.addLog('error', `${stage.name} stage failed (injected failure)`);
            this.state.failureInjection = null;
            return;
        }
        
        if (this.state.config.parallelMode && stage.jobs.length > 1) {
            await this.executeJobsParallel(stage);
        } else {
            await this.executeJobsSequential(stage);
        }
        
        const hasFailedJob = stage.jobs.some(job => job.status === 'failed');
        stage.status = hasFailedJob ? 'failed' : 'success';
        stage.endTime = Date.now();
        
        const duration = ((stage.endTime - stage.startTime) / 1000).toFixed(1);
        this.ui.updateStage(stage.id, { 
            status: stage.status,
            duration: duration + 's'
        });
        
        this.state.timeline.push({
            id: stage.id,
            name: stage.name,
            duration: parseFloat(duration)
        });
        this.ui.updateTimeline();
        
        this.state.addLog(stage.status === 'success' ? 'success' : 'error', 
            `${stage.name} stage ${stage.status} (${duration}s)`);
        
        if (stage.id === 'build') {
            this.state.cache.dependencies = true;
            this.state.cache.build = true;
            this.ui.updateCacheStatus();
        } else if (stage.id === 'test') {
            this.state.cache.test = true;
            this.ui.updateCacheStatus();
        }
    }

    async executeJobsParallel(stage) {
        const jobPromises = stage.jobs.map(job => this.executeJob(stage, job));

        // Allow early exit when the pipeline is paused or stopped, so we don't
        // wait indefinitely on Promise.all while jobs are being cancelled.
        let cancelled = false;
        const cancellationPromise = new Promise(resolve => {
            const checkAndResolve = () => {
                if (cancelled) {
                    return;
                }
                if (!this.state.isRunning || this.state.isPaused) {
                    cancelled = true;
                    resolve();
                    return;
                }
                setTimeout(checkAndResolve, 50);
            };
            checkAndResolve();
        });

        await Promise.race([
            Promise.all(jobPromises),
            cancellationPromise
        ]);
    }

    async executeJobsSequential(stage) {
        for (const job of stage.jobs) {
            if (!this.state.isRunning || this.state.isPaused) return;
            await this.executeJob(stage, job);
        }
    }

    async executeJob(stage, job) {
        job.status = 'running';
        job.startTime = Date.now();
        this.ui.updateJob(stage.id, job.id, { status: 'running' });
        
        if (this.state.config.verboseLogs) {
            this.state.addLog('info', `  Running ${job.name}`);
        }
        
        for (const step of job.steps) {
            if (!this.state.isRunning || this.state.isPaused) return;
            
            await this.executeStep(stage, job, step);
            
            if (step.status === 'failed') {
                job.status = 'failed';
                job.endTime = Date.now();
                this.ui.updateJob(stage.id, job.id, { 
                    status: 'failed',
                    duration: ((job.endTime - job.startTime) / 1000).toFixed(1) + 's',
                    steps: job.steps
                });
                return;
            }
        }
        
        job.status = 'success';
        job.endTime = Date.now();
        const duration = ((job.endTime - job.startTime) / 1000).toFixed(1);
        this.ui.updateJob(stage.id, job.id, { 
            status: 'success',
            duration: duration + 's',
            steps: job.steps
        });
        
        if (job.artifact) {
            this.state.artifacts.push(job.artifact);
            this.ui.updateArtifacts();
            this.state.addLog('success', `Artifact created: ${job.artifact.name}`);
        }
    }

    async executeStep(stage, job, step) {
        step.status = 'running';
        this.ui.updateJob(stage.id, job.id, { steps: job.steps });
        
        let stepDuration = step.duration * 100;
        
        if (step.cached && this.state.config.enableCache && this.state.cache.dependencies) {
            stepDuration = stepDuration * 0.3;
        }
        
        const adjustedDuration = stepDuration / this.state.speedMultiplier;
        await this.sleep(adjustedDuration);
        
        step.status = 'success';
        step.actualDuration = adjustedDuration / 1000;
        this.ui.updateJob(stage.id, job.id, { steps: job.steps });
        
        if (this.state.config.verboseLogs) {
            this.state.addLog('info', `    ✓ ${step.name}`);
        }
    }

    handleSuccess() {
        this.state.isRunning = false;
        this.state.executionEnd = Date.now();
        clearInterval(this.durationInterval);
        
        this.ui.updateStatus('success');
        this.ui.updateButtons('idle');
        this.ui.updateDuration();
        
        const totalDuration = (this.state.executionEnd - this.state.executionStart) / 1000;
        this.state.stats.totalRuns++;
        this.state.stats.successfulRuns++;
        this.state.stats.totalDuration += totalDuration;
        
        this.ui.updateStats();
        this.ui.updateMetrics();
        
        this.state.addLog('success', `Pipeline completed successfully in ${totalDuration.toFixed(1)}s`);
        this.ui.updateLogs();
    }

    handleFailure() {
        this.state.isRunning = false;
        this.state.executionEnd = Date.now();
        clearInterval(this.durationInterval);
        
        this.ui.updateStatus('failed');
        this.ui.updateButtons('idle');
        this.ui.updateDuration();
        
        const totalDuration = (this.state.executionEnd - this.state.executionStart) / 1000;
        this.state.stats.totalRuns++;
        this.state.stats.totalDuration += totalDuration;
        
        this.ui.updateStats();
        this.ui.updateMetrics();
        
        const remainingStages = this.state.stages.slice(this.state.currentStageIndex + 1);
        remainingStages.forEach(stage => {
            stage.status = 'skipped';
            this.ui.updateStage(stage.id, { status: 'skipped' });
        });
        
        this.state.addLog('error', `Pipeline failed after ${totalDuration.toFixed(1)}s`);
        this.ui.updateLogs();
    }

    sleep(ms) {
        return new Promise(resolve => {
            const interval = setInterval(() => {
                clearInterval(interval);
                resolve();
            }, ms);
            this.state.addInterval(interval);
        });
    }
}

// ====================================
// Initialize Application
// ====================================
const state = new PipelineState();
const ui = new UIController(state);
const pipelineExecutor = new PipelineExecutor(state, ui);

// Load initial template
state.loadTemplate('nodejs');
ui.renderPipeline();
ui.updateCacheStatus();
state.addLog('info', 'Application initialized');
ui.updateLogs();
