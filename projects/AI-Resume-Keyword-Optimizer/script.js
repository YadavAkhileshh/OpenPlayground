// AI Resume Keyword Optimizer - Complete Implementation
// Features: Resume upload, job analysis, ATS scoring, keyword optimization,
// resume editing, local storage, export functionality

class AIResumeOptimizer {
    constructor() {
        this.resumeText = '';
        this.jobDescription = '';
        this.resumeKeywords = new Set();
        this.jobKeywords = new Set();
        this.matchedKeywords = new Set();
        this.missingKeywords = new Set();
        this.skillSuggestions = [];
        this.atsScore = 0;
        this.scoreBreakdown = { keyword: 0, skills: 0, format: 0 };
        this.currentTheme = localStorage.getItem('resumeOptimizer_theme') || 'light';
        this.savedReports = JSON.parse(localStorage.getItem('resumeOptimizer_reports') || '[]');
        this.improvementTracker = JSON.parse(localStorage.getItem('resumeOptimizer_tracker') || '{}');

        this.init();
    }

    init() {
        this.initEventListeners();
        this.initTheme();
        this.loadImprovementTracker();
        this.showToast('Welcome to AI Resume Optimizer!', 'success');
    }

    // Initialize all event listeners
    initEventListeners() {
        // File upload
        const uploadArea = document.getElementById('upload-area');
        const fileInput = document.getElementById('resume-file');

        uploadArea.addEventListener('click', () => fileInput.click());
        uploadArea.addEventListener('dragover', this.handleDragOver.bind(this));
        uploadArea.addEventListener('drop', this.handleFileDrop.bind(this));
        fileInput.addEventListener('change', this.handleFileSelect.bind(this));

        document.getElementById('remove-file').addEventListener('click', () => this.removeFile());

        // Job description analysis
        document.getElementById('analyze-job').addEventListener('click', () => this.analyzeJobDescription());
        document.getElementById('clear-job').addEventListener('click', () => this.clearJobDescription());

        // Tabs
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target));
        });

        document.querySelectorAll('.editor-tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchEditorTab(e.target));
        });

        // Editor optimization
        document.querySelectorAll('.optimize-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.optimizeSection(e.target));
        });

        // Navigation
        document.getElementById('theme-toggle').addEventListener('click', () => this.toggleTheme());
        document.getElementById('save-report').addEventListener('click', () => this.showSaveModal());
        document.getElementById('load-report').addEventListener('click', () => this.showLoadModal());
        document.getElementById('export-resume').addEventListener('click', () => this.showExportModal());

        // Modal controls
        document.querySelectorAll('.modal-close').forEach(close => {
            close.addEventListener('click', () => this.hideModals());
        });

        document.getElementById('save-report-confirm').addEventListener('click', () => this.saveReport());
        document.getElementById('export-resume-confirm').addEventListener('click', () => this.exportResume());

        // Click outside modal to close
        document.querySelectorAll('.modal').forEach(modal => {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) this.hideModals();
            });
        });

        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));

        // Auto-save editor content
        document.querySelectorAll('.editor-panel textarea').forEach(textarea => {
            textarea.addEventListener('input', () => this.autoSaveEditor());
        });
    }

    // Handle file drag over
    handleDragOver(e) {
        e.preventDefault();
        e.currentTarget.classList.add('dragover');
    }

    // Handle file drop
    handleFileDrop(e) {
        e.preventDefault();
        e.currentTarget.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            this.processFile(files[0]);
        }
    }

    // Handle file select
    handleFileSelect(e) {
        const file = e.target.files[0];
        if (file) {
            this.processFile(file);
        }
    }

    // Process uploaded file
    async processFile(file) {
        if (!this.validateFile(file)) return;

        this.showLoading('Processing your resume...');

        try {
            if (file.type === 'text/plain') {
                this.resumeText = await this.readTextFile(file);
            } else if (file.type === 'application/pdf') {
                this.resumeText = await this.readPDFFile(file);
            }

            this.extractResumeKeywords();
            this.updateFileInfo(file);
            this.showSections();
            this.calculateATSScore();

            this.showToast('Resume processed successfully!', 'success');
        } catch (error) {
            console.error('Error processing file:', error);
            this.showToast('Error processing file. Please try again.', 'error');
        } finally {
            this.hideLoading();
        }
    }

    // Validate uploaded file
    validateFile(file) {
        const maxSize = 10 * 1024 * 1024; // 10MB
        const allowedTypes = ['text/plain', 'application/pdf'];

        if (!allowedTypes.includes(file.type)) {
            this.showToast('Please upload a PDF or text file.', 'error');
            return false;
        }

        if (file.size > maxSize) {
            this.showToast('File size must be less than 10MB.', 'error');
            return false;
        }

        return true;
    }

    // Read text file
    readTextFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => resolve(e.target.result);
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Read PDF file using PDF.js
    async readPDFFile(file) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

        let text = '';
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const textContent = await page.getTextContent();
            text += textContent.items.map(item => item.str).join(' ') + '\n';
        }

        return text;
    }

    // Extract keywords from resume
    extractResumeKeywords() {
        this.resumeKeywords.clear();

        // Common keywords to extract
        const keywordPatterns = [
            // Technical skills
            /\b(javascript|python|java|c\+\+|c#|php|ruby|go|rust|typescript|swift|kotlin|scala|perl|r|matlab|sql|nosql|mongodb|mysql|postgresql|oracle|redis|elasticsearch|graphql|rest|api|json|xml|html|css|sass|less|bootstrap|tailwind|jquery|react|angular|vue|node|express|django|flask|spring|laravel|rails|asp\.net|dotnet|aws|azure|gcp|docker|kubernetes|jenkins|gitlab|github|git|linux|windows|macos|android|ios)\b/gi,

            // Soft skills
            /\b(leadership|communication|teamwork|problem.solving|analytical|creative|adaptable|flexible|organized|detail.oriented|time.management|project.management|agile|scrum|kanban)\b/gi,

            // Industry terms
            /\b(machine.learning|artificial.intelligence|data.science|big.data|blockchain|cybersecurity|cloud.computing|devops|microservices|serverless|iot|ar|vr|blockchain|cryptocurrency|fintech|healthtech|edtech)\b/gi,

            // Tools and frameworks
            /\b(git|docker|kubernetes|jenkins|travis|circleci|webpack|babel|eslint|prettier|jest|mocha|cypress|selenium|postman|swagger|figma|sketch|photoshop|illustrator|xd|invision)\b/gi,

            // Certifications and degrees
            /\b(bachelor|master|phd|mba|cs|computer.science|engineering|mathematics|physics|biology|chemistry|business|marketing|finance|accounting|cpa|cfa|pmp|csm|cspo|aws.certified|google.cloud|azure.certified)\b/gi
        ];

        keywordPatterns.forEach(pattern => {
            const matches = this.resumeText.match(pattern);
            if (matches) {
                matches.forEach(match => this.resumeKeywords.add(match.toLowerCase()));
            }
        });

        // Extract additional keywords from resume sections
        this.extractFromSections();
    }

    // Extract keywords from specific resume sections
    extractFromSections() {
        const sections = {
            skills: /(?:skills?|technologies?|tools?)(?:\s*:?\s*)(.*?)(?=\n\s*(?:experience|education|projects|certifications|awards|$))/gi,
            experience: /(?:experience|work|employment)(?:\s*:?\s*)(.*?)(?=\n\s*(?:education|projects|skills|certifications|$))/gi,
            education: /(?:education|academic)(?:\s*:?\s*)(.*?)(?=\n\s*(?:experience|projects|skills|certifications|$))/gi
        };

        Object.values(sections).forEach(pattern => {
            const matches = this.resumeText.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    // Extract individual words and phrases
                    const words = match.toLowerCase().split(/[\s,.;:()]+/);
                    words.forEach(word => {
                        if (word.length > 2 && !this.isStopWord(word)) {
                            this.resumeKeywords.add(word);
                        }
                    });
                });
            }
        });
    }

    // Check if word is a stop word
    isStopWord(word) {
        const stopWords = new Set(['the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by', 'an', 'a', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'me', 'him', 'her', 'us', 'them']);
        return stopWords.has(word);
    }

    // Update file information display
    updateFileInfo(file) {
        const fileName = document.getElementById('file-name');
        const fileSize = document.getElementById('file-size');
        const fileInfo = document.getElementById('file-info');

        fileName.textContent = file.name;
        fileSize.textContent = this.formatFileSize(file.size);
        fileInfo.style.display = 'flex';
    }

    // Remove uploaded file
    removeFile() {
        this.resumeText = '';
        this.resumeKeywords.clear();
        document.getElementById('resume-file').value = '';
        document.getElementById('file-info').style.display = 'none';
        this.hideSections();
        this.showToast('Resume removed.', 'info');
    }

    // Analyze job description
    analyzeJobDescription() {
        const jobText = document.getElementById('job-description').value.trim();

        if (!jobText) {
            this.showToast('Please enter a job description.', 'warning');
            return;
        }

        if (!this.resumeText) {
            this.showToast('Please upload a resume first.', 'warning');
            return;
        }

        this.showLoading('Analyzing job description...');
        this.jobDescription = jobText;

        setTimeout(() => {
            this.extractJobKeywords();
            this.compareKeywords();
            this.generateSkillSuggestions();
            this.calculateATSScore();
            this.updateAnalysisDisplay();
            this.showSections();
            this.hideLoading();
            this.showToast('Job analysis complete!', 'success');
        }, 1000);
    }

    // Extract keywords from job description
    extractJobKeywords() {
        this.jobKeywords.clear();

        // Similar patterns as resume extraction
        const keywordPatterns = [
            /\b(javascript|python|java|c\+\+|c#|php|ruby|go|rust|typescript|swift|kotlin|scala|perl|r|matlab|sql|nosql|mongodb|mysql|postgresql|oracle|redis|elasticsearch|graphql|rest|api|json|xml|html|css|sass|less|bootstrap|tailwind|jquery|react|angular|vue|node|express|django|flask|spring|laravel|rails|asp\.net|dotnet|aws|azure|gcp|docker|kubernetes|jenkins|gitlab|github|git|linux|windows|macos|android|ios)\b/gi,
            /\b(leadership|communication|teamwork|problem.solving|analytical|creative|adaptable|flexible|organized|detail.oriented|time.management|project.management|agile|scrum|kanban)\b/gi,
            /\b(machine.learning|artificial.intelligence|data.science|big.data|blockchain|cybersecurity|cloud.computing|devops|microservices|serverless|iot|ar|vr|blockchain|cryptocurrency|fintech|healthtech|edtech)\b/gi,
            /\b(git|docker|kubernetes|jenkins|travis|circleci|webpack|babel|eslint|prettier|jest|mocha|cypress|selenium|postman|swagger|figma|sketch|photoshop|illustrator|xd|invision)\b/gi,
            /\b(bachelor|master|phd|mba|cs|computer.science|engineering|mathematics|physics|biology|chemistry|business|marketing|finance|accounting|cpa|cfa|pmp|csm|cspo|aws.certified|google.cloud|azure.certified)\b/gi
        ];

        keywordPatterns.forEach(pattern => {
            const matches = this.jobDescription.match(pattern);
            if (matches) {
                matches.forEach(match => this.jobKeywords.add(match.toLowerCase()));
            }
        });

        // Extract required skills and qualifications
        const requirementPatterns = [
            /(?:requirements?|qualifications?|skills?|experience)(?:\s*:?\s*)(.*?)(?=\n\s*(?:responsibilities|duties|benefits|salary|$))/gi,
            /(?:must.have|required|essential)(?:\s*:?\s*)(.*?)(?=\n\s*(?:nice.to.have|preferred|plus|$))/gi
        ];

        requirementPatterns.forEach(pattern => {
            const matches = this.jobDescription.match(pattern);
            if (matches) {
                matches.forEach(match => {
                    const words = match.toLowerCase().split(/[\s,.;:()]+/);
                    words.forEach(word => {
                        if (word.length > 2 && !this.isStopWord(word)) {
                            this.jobKeywords.add(word);
                        }
                    });
                });
            }
        });
    }

    // Compare resume and job keywords
    compareKeywords() {
        this.matchedKeywords.clear();
        this.missingKeywords.clear();

        // Find matched keywords
        this.resumeKeywords.forEach(keyword => {
            if (this.jobKeywords.has(keyword)) {
                this.matchedKeywords.add(keyword);
            }
        });

        // Find missing keywords
        this.jobKeywords.forEach(keyword => {
            if (!this.resumeKeywords.has(keyword)) {
                this.missingKeywords.add(keyword);
            }
        });
    }

    // Generate skill suggestions
    generateSkillSuggestions() {
        this.skillSuggestions = [];

        // High priority missing skills
        const highPrioritySkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'git', 'agile', 'scrum'];
        const mediumPrioritySkills = ['docker', 'kubernetes', 'aws', 'azure', 'typescript', 'mongodb', 'rest', 'api'];
        const lowPrioritySkills = ['machine learning', 'blockchain', 'cybersecurity', 'devops'];

        // Generate suggestions based on missing keywords
        Array.from(this.missingKeywords).forEach(keyword => {
            let priority = 'low';
            let description = `Consider adding "${keyword}" to your resume to better match this job.`;

            if (highPrioritySkills.some(skill => keyword.includes(skill))) {
                priority = 'high';
                description = `High-demand skill "${keyword}" is missing. This could significantly improve your ATS score.`;
            } else if (mediumPrioritySkills.some(skill => keyword.includes(skill))) {
                priority = 'medium';
                description = `Valuable skill "${keyword}" would strengthen your application.`;
            }

            this.skillSuggestions.push({
                skill: keyword,
                priority,
                description,
                relatedKeywords: this.findRelatedKeywords(keyword)
            });
        });

        // Sort by priority
        this.skillSuggestions.sort((a, b) => {
            const priorityOrder = { high: 3, medium: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });
    }

    // Find related keywords
    findRelatedKeywords(keyword) {
        const relatedMap = {
            javascript: ['react', 'node', 'express', 'jquery', 'typescript'],
            python: ['django', 'flask', 'pandas', 'numpy', 'tensorflow'],
            java: ['spring', 'hibernate', 'maven', 'gradle'],
            'react': ['redux', 'hooks', 'jsx', 'next.js'],
            'node': ['express', 'npm', 'mongodb', 'jwt'],
            sql: ['mysql', 'postgresql', 'oracle', 'mongodb'],
            git: ['github', 'gitlab', 'bitbucket', 'version control'],
            agile: ['scrum', 'kanban', 'sprint', 'jira'],
            docker: ['kubernetes', 'containerization', 'microservices'],
            aws: ['ec2', 's3', 'lambda', 'cloudformation']
        };

        return relatedMap[keyword] || [];
    }

    // Calculate ATS score
    calculateATSScore() {
        if (!this.resumeText || !this.jobDescription) return;

        // Keyword match score (40% weight)
        const keywordMatchRatio = this.matchedKeywords.size / this.jobKeywords.size;
        this.scoreBreakdown.keyword = Math.round(keywordMatchRatio * 40);

        // Skills alignment score (35% weight)
        const skillsScore = this.calculateSkillsAlignment();
        this.scoreBreakdown.skills = Math.round(skillsScore * 35);

        // Format optimization score (25% weight)
        const formatScore = this.calculateFormatScore();
        this.scoreBreakdown.format = Math.round(formatScore * 25);

        // Total ATS score
        this.atsScore = this.scoreBreakdown.keyword + this.scoreBreakdown.skills + this.scoreBreakdown.format;

        this.updateATSDisplay();
        this.updateImprovementTracker();
    }

    // Calculate skills alignment score
    calculateSkillsAlignment() {
        const technicalSkills = ['javascript', 'python', 'java', 'react', 'node', 'sql', 'git', 'docker', 'aws', 'azure'];
        const matchedTechnical = technicalSkills.filter(skill =>
            Array.from(this.matchedKeywords).some(matched => matched.includes(skill))
        );

        return matchedTechnical.length / technicalSkills.length;
    }

    // Calculate format optimization score
    calculateFormatScore() {
        let score = 0;

        // Check for proper sections
        const sections = ['experience', 'education', 'skills', 'projects'];
        sections.forEach(section => {
            if (this.resumeText.toLowerCase().includes(section)) score += 0.2;
        });

        // Check for quantifiable achievements
        const quantifiablePatterns = [/\d+\+?\s*(?:years?|months?)/gi, /\d+%/gi, /\$\d+/gi];
        quantifiablePatterns.forEach(pattern => {
            if (this.resumeText.match(pattern)) score += 0.1;
        });

        // Check for action verbs
        const actionVerbs = ['developed', 'created', 'implemented', 'managed', 'led', 'designed', 'built', 'optimized'];
        actionVerbs.forEach(verb => {
            if (this.resumeText.toLowerCase().includes(verb)) score += 0.05;
        });

        return Math.min(score, 1);
    }

    // Update ATS score display
    updateATSDisplay() {
        const scoreElement = document.getElementById('ats-score');
        const keywordScore = document.getElementById('keyword-score');
        const skillsScore = document.getElementById('skills-score');
        const formatScore = document.getElementById('format-score');
        const keywordPercentage = document.getElementById('keyword-percentage');
        const skillsPercentage = document.getElementById('skills-percentage');
        const formatPercentage = document.getElementById('format-percentage');

        scoreElement.textContent = this.atsScore;
        keywordScore.style.width = `${this.scoreBreakdown.keyword * 2.5}%`;
        skillsScore.style.width = `${this.scoreBreakdown.skills * 2.5}%`;
        formatScore.style.width = `${this.scoreBreakdown.format * 2.5}%`;
        keywordPercentage.textContent = `${this.scoreBreakdown.keyword}%`;
        skillsPercentage.textContent = `${this.scoreBreakdown.skills}%`;
        formatPercentage.textContent = `${this.scoreBreakdown.format}%`;

        // Update score circle color
        const scoreCircle = document.querySelector('.score-circle');
        scoreCircle.style.background = `conic-gradient(var(--primary-color) 0% ${this.atsScore}%, var(--bg-tertiary) ${this.atsScore}% 100%)`;
    }

    // Update analysis display
    updateAnalysisDisplay() {
        this.updateMissingKeywords();
        this.updateMatchedKeywords();
        this.updateSkillSuggestions();
    }

    // Update missing keywords display
    updateMissingKeywords() {
        const container = document.getElementById('missing-keywords');
        container.innerHTML = '';

        if (this.missingKeywords.size === 0) {
            container.innerHTML = '<div class="empty-state">Great! No missing keywords found.</div>';
            return;
        }

        Array.from(this.missingKeywords).slice(0, 20).forEach(keyword => {
            const item = document.createElement('div');
            item.className = 'keyword-item';
            item.innerHTML = `
                <div class="keyword-text">${this.capitalizeFirst(keyword)}</div>
                <div class="keyword-count">Missing from resume</div>
            `;
            container.appendChild(item);
        });
    }

    // Update matched keywords display
    updateMatchedKeywords() {
        const container = document.getElementById('matched-keywords');
        container.innerHTML = '';

        if (this.matchedKeywords.size === 0) {
            container.innerHTML = '<div class="empty-state">No matched keywords yet. Upload a resume and analyze a job description.</div>';
            return;
        }

        Array.from(this.matchedKeywords).forEach(keyword => {
            const item = document.createElement('div');
            item.className = 'keyword-item matched';
            item.innerHTML = `
                <div class="keyword-text">${this.capitalizeFirst(keyword)}</div>
                <div class="keyword-count">Found in resume</div>
            `;
            container.appendChild(item);
        });
    }

    // Update skill suggestions display
    updateSkillSuggestions() {
        const container = document.getElementById('skill-suggestions');
        container.innerHTML = '';

        if (this.skillSuggestions.length === 0) {
            container.innerHTML = '<div class="empty-state">No skill suggestions available.</div>';
            return;
        }

        this.skillSuggestions.slice(0, 10).forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.innerHTML = `
                <div class="suggestion-header">
                    <div class="suggestion-title">${this.capitalizeFirst(suggestion.skill)}</div>
                    <div class="suggestion-priority ${suggestion.priority}">${suggestion.priority.toUpperCase()}</div>
                </div>
                <div class="suggestion-description">${suggestion.description}</div>
                ${suggestion.relatedKeywords.length > 0 ? `
                    <div class="suggestion-keywords">
                        ${suggestion.relatedKeywords.slice(0, 5).map(keyword => `<span class="keyword-tag">${keyword}</span>`).join('')}
                    </div>
                ` : ''}
            `;
            container.appendChild(item);
        });
    }

    // Switch between tabs
    switchTab(clickedTab) {
        const tabs = document.querySelectorAll('.tab-btn');
        const contents = document.querySelectorAll('.tab-content');

        tabs.forEach(tab => tab.classList.remove('active'));
        contents.forEach(content => content.classList.remove('active'));

        clickedTab.classList.add('active');
        const tabId = clickedTab.dataset.tab;
        document.getElementById(`${tabId}-tab`).classList.add('active');
    }

    // Switch between editor tabs
    switchEditorTab(clickedTab) {
        const tabs = document.querySelectorAll('.editor-tab-btn');
        const panels = document.querySelectorAll('.editor-panel');

        tabs.forEach(tab => tab.classList.remove('active'));
        panels.forEach(panel => panel.classList.remove('active'));

        clickedTab.classList.add('active');
        const section = clickedTab.dataset.section;
        document.getElementById(`${section}-panel`).classList.add('active');
    }

    // Optimize resume section with AI
    optimizeSection(button) {
        const section = button.dataset.section;
        const textarea = document.getElementById(`${section}-text`);
        const currentText = textarea.value;

        if (!currentText.trim()) {
            this.showToast('Please add some content to optimize.', 'warning');
            return;
        }

        this.showLoading('Optimizing with AI...');

        setTimeout(() => {
            const optimizedText = this.generateOptimizedContent(section, currentText);
            textarea.value = optimizedText;
            this.hideLoading();
            this.showToast(`${this.capitalizeFirst(section)} section optimized!`, 'success');
        }, 1500);
    }

    // Generate optimized content
    generateOptimizedContent(section, content) {
        // Simple optimization logic (in a real app, this would use AI/ML)
        let optimized = content;

        // Add missing keywords
        Array.from(this.missingKeywords).slice(0, 3).forEach(keyword => {
            if (!optimized.toLowerCase().includes(keyword)) {
                optimized += `\n• Experience with ${this.capitalizeFirst(keyword)}`;
            }
        });

        // Improve action verbs
        const weakVerbs = ['did', 'worked', 'helped', 'assisted'];
        const strongVerbs = ['developed', 'implemented', 'created', 'managed', 'led'];

        weakVerbs.forEach((weak, index) => {
            if (optimized.toLowerCase().includes(weak)) {
                optimized = optimized.replace(new RegExp(weak, 'gi'), strongVerbs[index]);
            }
        });

        // Add quantifiable achievements
        if (!optimized.match(/\d+/)) {
            optimized += '\n• Improved performance by 25% through optimization techniques';
        }

        return optimized;
    }

    // Auto-save editor content
    autoSaveEditor() {
        const editorData = {};
        document.querySelectorAll('.editor-panel textarea').forEach(textarea => {
            const section = textarea.id.replace('-text', '');
            editorData[section] = textarea.value;
        });

        localStorage.setItem('resumeOptimizer_editor', JSON.stringify(editorData));
    }

    // Load editor content from localStorage
    loadEditorContent() {
        const editorData = JSON.parse(localStorage.getItem('resumeOptimizer_editor') || '{}');

        Object.entries(editorData).forEach(([section, content]) => {
            const textarea = document.getElementById(`${section}-text`);
            if (textarea) {
                textarea.value = content;
            }
        });
    }

    // Show save modal
    showSaveModal() {
        if (!this.resumeText || !this.jobDescription) {
            this.showToast('Please upload a resume and analyze a job first.', 'warning');
            return;
        }

        document.getElementById('save-modal').classList.add('show');
    }

    // Save optimization report
    saveReport() {
        const name = document.getElementById('report-name').value.trim();
        const description = document.getElementById('report-description').value.trim();

        if (!name) {
            this.showToast('Please enter a report name.', 'warning');
            return;
        }

        const reportData = {
            id: Date.now(),
            name,
            description,
            resumeText: this.resumeText,
            jobDescription: this.jobDescription,
            atsScore: this.atsScore,
            scoreBreakdown: this.scoreBreakdown,
            matchedKeywords: Array.from(this.matchedKeywords),
            missingKeywords: Array.from(this.missingKeywords),
            skillSuggestions: this.skillSuggestions,
            createdAt: new Date().toISOString()
        };

        this.savedReports.push(reportData);
        localStorage.setItem('resumeOptimizer_reports', JSON.stringify(this.savedReports));

        this.hideModals();
        this.showToast(`Report "${name}" saved successfully!`, 'success');
    }

    // Show load modal
    showLoadModal() {
        const container = document.getElementById('saved-reports-list');

        if (this.savedReports.length === 0) {
            container.innerHTML = '<p>No saved reports found.</p>';
        } else {
            container.innerHTML = this.savedReports.map(report => `
                <div class="saved-report-item" onclick="resumeOptimizer.loadReport(${report.id})">
                    <div class="saved-report-name">${report.name}</div>
                    <div class="saved-report-meta">
                        ATS Score: ${report.atsScore} | ${new Date(report.createdAt).toLocaleDateString()}
                        ${report.description ? `<br><small>${report.description}</small>` : ''}
                    </div>
                </div>
            `).join('');
        }

        document.getElementById('load-modal').classList.add('show');
    }

    // Load saved report
    loadReport(reportId) {
        const report = this.savedReports.find(r => r.id === reportId);
        if (!report) return;

        this.resumeText = report.resumeText;
        this.jobDescription = report.jobDescription;
        this.atsScore = report.atsScore;
        this.scoreBreakdown = report.scoreBreakdown;
        this.matchedKeywords = new Set(report.matchedKeywords);
        this.missingKeywords = new Set(report.missingKeywords);
        this.skillSuggestions = report.skillSuggestions;

        // Update UI
        document.getElementById('job-description').value = this.jobDescription;
        this.updateATSDisplay();
        this.updateAnalysisDisplay();
        this.showSections();
        this.loadEditorContent();

        this.hideModals();
        this.showToast(`Loaded report "${report.name}"!`, 'success');
    }

    // Show export modal
    showExportModal() {
        if (!this.resumeText) {
            this.showToast('Please upload a resume first.', 'warning');
            return;
        }

        document.getElementById('export-modal').classList.add('show');
    }

    // Export resume
    exportResume() {
        const format = document.querySelector('input[name="export-format"]:checked').value;

        this.showLoading('Exporting resume...');

        setTimeout(() => {
            if (format === 'pdf') {
                this.exportAsPDF();
            } else if (format === 'docx') {
                this.exportAsDOCX();
            } else {
                this.exportAsTXT();
            }

            this.hideModals();
            this.hideLoading();
        }, 1000);
    }

    // Export as PDF (simplified)
    exportAsPDF() {
        const content = this.generateResumeContent();
        this.downloadFile(content, 'optimized-resume.pdf', 'application/pdf');
        this.showToast('PDF export completed!', 'success');
    }

    // Export as DOCX (simplified)
    exportAsDOCX() {
        const content = this.generateResumeContent();
        this.downloadFile(content, 'optimized-resume.docx', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        this.showToast('DOCX export completed!', 'success');
    }

    // Export as TXT
    exportAsTXT() {
        const content = this.generateResumeContent();
        this.downloadFile(content, 'optimized-resume.txt', 'text/plain');
        this.showToast('TXT export completed!', 'success');
    }

    // Generate resume content
    generateResumeContent() {
        let content = 'OPTIMIZED RESUME\n\n';

        // Add editor content
        const sections = ['summary', 'experience', 'skills', 'education'];
        sections.forEach(section => {
            const textarea = document.getElementById(`${section}-text`);
            if (textarea && textarea.value.trim()) {
                content += `${this.capitalizeFirst(section).toUpperCase()}\n`;
                content += `${textarea.value.trim()}\n\n`;
            }
        });

        // Add optimization notes
        content += 'OPTIMIZATION NOTES\n';
        content += `ATS Score: ${this.atsScore}/100\n`;
        content += `Matched Keywords: ${this.matchedKeywords.size}\n`;
        content += `Missing Keywords: ${Array.from(this.missingKeywords).slice(0, 5).join(', ')}\n`;

        return content;
    }

    // Download file helper
    downloadFile(content, filename, mimeType) {
        const blob = new Blob([content], { type: mimeType });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = filename;
        link.click();
        URL.revokeObjectURL(url);
    }

    // Initialize theme
    initTheme() {
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.innerHTML = this.currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    // Toggle theme
    toggleTheme() {
        this.currentTheme = this.currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', this.currentTheme);
        localStorage.setItem('resumeOptimizer_theme', this.currentTheme);

        const themeBtn = document.getElementById('theme-toggle');
        themeBtn.innerHTML = this.currentTheme === 'dark' ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';

        this.showToast(`Switched to ${this.currentTheme} theme.`, 'info');
    }

    // Load improvement tracker
    loadImprovementTracker() {
        const now = new Date();
        const today = now.toDateString();

        if (!this.improvementTracker.lastActive || this.improvementTracker.lastActive !== today) {
            this.improvementTracker.daysActive = (this.improvementTracker.daysActive || 0) + 1;
            this.improvementTracker.lastActive = today;
        }

        this.updateImprovementTracker();
    }

    // Update improvement tracker
    updateImprovementTracker() {
        this.improvementTracker.bestScore = Math.max(this.improvementTracker.bestScore || 0, this.atsScore);
        this.improvementTracker.keywordsAdded = (this.improvementTracker.keywordsAdded || 0) + Math.min(this.missingKeywords.size, 5);

        localStorage.setItem('resumeOptimizer_tracker', JSON.stringify(this.improvementTracker));

        this.updateTrackerDisplay();
        this.updateProgressChart();
    }

    // Update tracker display
    updateTrackerDisplay() {
        document.getElementById('best-score').textContent = this.improvementTracker.bestScore || 0;
        document.getElementById('keywords-added').textContent = this.improvementTracker.keywordsAdded || 0;
        document.getElementById('days-active').textContent = this.improvementTracker.daysActive || 0;
    }

    // Update progress chart
    updateProgressChart() {
        const ctx = document.getElementById('progress-chart');
        if (!ctx) return;

        // Mock progress data (in a real app, this would track over time)
        const progressData = {
            labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4'],
            datasets: [{
                label: 'ATS Score Progress',
                data: [45, 62, 78, this.atsScore],
                borderColor: '#10b981',
                backgroundColor: 'rgba(16, 185, 129, 0.1)',
                tension: 0.4
            }]
        };

        new Chart(ctx, {
            type: 'line',
            data: progressData,
            options: {
                responsive: true,
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 100
                    }
                }
            }
        });
    }

    // Clear job description
    clearJobDescription() {
        document.getElementById('job-description').value = '';
        this.jobDescription = '';
        this.jobKeywords.clear();
        this.matchedKeywords.clear();
        this.missingKeywords.clear();
        this.skillSuggestions = [];
        this.hideSections();
        this.showToast('Job description cleared.', 'info');
    }

    // Show relevant sections
    showSections() {
        if (this.resumeText) {
            document.getElementById('editor-section').style.display = 'block';
            document.getElementById('tracker-section').style.display = 'block';
            this.loadEditorContent();
        }

        if (this.jobDescription) {
            document.getElementById('score-section').style.display = 'block';
            document.getElementById('analysis-section').style.display = 'block';
        }
    }

    // Hide sections
    hideSections() {
        document.getElementById('score-section').style.display = 'none';
        document.getElementById('analysis-section').style.display = 'none';
        document.getElementById('editor-section').style.display = 'none';
        document.getElementById('tracker-section').style.display = 'none';
    }

    // Hide all modals
    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.remove('show');
        });
    }

    // Show loading overlay
    showLoading(message = 'Processing...') {
        document.getElementById('loading-text').textContent = message;
        document.getElementById('loading-overlay').classList.add('show');
    }

    // Hide loading overlay
    hideLoading() {
        document.getElementById('loading-overlay').classList.remove('show');
    }

    // Show toast notification
    showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');
        toast.className = `toast ${type}`;
        toast.innerHTML = `
            <i class="fas fa-${this.getToastIcon(type)}"></i>
            <span class="toast-message">${message}</span>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;

        container.appendChild(toast);

        // Auto remove after 5 seconds
        setTimeout(() => {
            if (toast.parentElement) {
                toast.remove();
            }
        }, 5000);
    }

    // Get toast icon based on type
    getToastIcon(type) {
        const icons = {
            success: 'check-circle',
            error: 'exclamation-circle',
            warning: 'exclamation-triangle',
            info: 'info-circle'
        };
        return icons[type] || 'info-circle';
    }

    // Handle keyboard shortcuts
    handleKeyboardShortcuts(e) {
        if (e.ctrlKey || e.metaKey) {
            switch (e.key) {
                case 's':
                    e.preventDefault();
                    this.showSaveModal();
                    break;
                case 'o':
                    e.preventDefault();
                    this.showLoadModal();
                    break;
                case 'e':
                    e.preventDefault();
                    this.showExportModal();
                    break;
            }
        }

        if (e.key === 'Escape') {
            this.hideModals();
        }
    }

    // Format file size
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }

    // Capitalize first letter
    capitalizeFirst(str) {
        return str.charAt(0).toUpperCase() + str.slice(1);
    }
}

// Initialize the application
const resumeOptimizer = new AIResumeOptimizer();

// Make resumeOptimizer available globally for onclick handlers
window.resumeOptimizer = resumeOptimizer;