// ===============================
// Annotation Engine for OpenPlayground
// Feature #1335: Community Annotations & Code Insights System
// ===============================

class AnnotationEngine {
    constructor() {
        this.storageKey = 'project_annotations';
        this.votesKey = 'annotation_votes';
        this.annotations = this.loadAnnotations();
        this.userVotes = this.loadUserVotes();
        this.currentProject = null;
        this.isOverlayOpen = false;
        
        this.categories = {
            tip: { icon: '💡', label: 'Tip', color: '#fbbf24' },
            gotcha: { icon: '⚠️', label: 'Gotcha', color: '#ef4444' },
            learn: { icon: '🎓', label: 'Learn', color: '#8b5cf6' },
            improvement: { icon: '🔧', label: 'Improvement', color: '#10b981' }
        };

        this.init();
    }

    init() {
        this.checkDeepLink();
        this.setupKeyboardShortcuts();
    }

    // ===============================
    // Annotation CRUD Operations
    // ===============================

    /**
     * Create a new annotation
     */
    createAnnotation(data) {
        const annotation = {
            id: this.generateId(),
            projectId: this.currentProject?.title || data.projectId,
            category: data.category || 'tip',
            content: data.content,
            codeSection: data.codeSection || null,
            lineStart: data.lineStart || null,
            lineEnd: data.lineEnd || null,
            selector: data.selector || null,
            author: data.author || 'Anonymous',
            upvotes: 0,
            downvotes: 0,
            createdAt: Date.now(),
            updatedAt: Date.now()
        };

        if (!this.annotations[annotation.projectId]) {
            this.annotations[annotation.projectId] = [];
        }

        this.annotations[annotation.projectId].push(annotation);
        this.saveAnnotations();
        
        return annotation;
    }

    /**
     * Update an existing annotation
     */
    updateAnnotation(annotationId, updates) {
        for (const projectId in this.annotations) {
            const index = this.annotations[projectId].findIndex(a => a.id === annotationId);
            if (index !== -1) {
                this.annotations[projectId][index] = {
                    ...this.annotations[projectId][index],
                    ...updates,
                    updatedAt: Date.now()
                };
                this.saveAnnotations();
                return this.annotations[projectId][index];
            }
        }
        return null;
    }

    /**
     * Delete an annotation
     */
    deleteAnnotation(annotationId) {
        for (const projectId in this.annotations) {
            const index = this.annotations[projectId].findIndex(a => a.id === annotationId);
            if (index !== -1) {
                this.annotations[projectId].splice(index, 1);
                this.saveAnnotations();
                return true;
            }
        }
        return false;
    }

    /**
     * Get annotations for a project
     */
    getProjectAnnotations(projectId, options = {}) {
        let annotations = this.annotations[projectId] || [];

        // Filter by category
        if (options.category && options.category !== 'all') {
            annotations = annotations.filter(a => a.category === options.category);
        }

        // Sort by option
        if (options.sortBy === 'popular') {
            annotations.sort((a, b) => (b.upvotes - b.downvotes) - (a.upvotes - a.downvotes));
        } else if (options.sortBy === 'newest') {
            annotations.sort((a, b) => b.createdAt - a.createdAt);
        } else if (options.sortBy === 'oldest') {
            annotations.sort((a, b) => a.createdAt - b.createdAt);
        }

        return annotations;
    }

    /**
     * Get annotation by ID
     */
    getAnnotationById(annotationId) {
        for (const projectId in this.annotations) {
            const annotation = this.annotations[projectId].find(a => a.id === annotationId);
            if (annotation) return { ...annotation, projectId };
        }
        return null;
    }

    /**
     * Get annotation count for a project
     */
    getAnnotationCount(projectId) {
        return (this.annotations[projectId] || []).length;
    }

    // ===============================
    // Voting System
    // ===============================

    /**
     * Upvote an annotation
     */
    upvote(annotationId) {
        const currentVote = this.userVotes[annotationId];
        
        if (currentVote === 'up') {
            // Remove upvote
            delete this.userVotes[annotationId];
            this.updateAnnotationVotes(annotationId, -1, 0);
        } else if (currentVote === 'down') {
            // Change from downvote to upvote
            this.userVotes[annotationId] = 'up';
            this.updateAnnotationVotes(annotationId, 1, -1);
        } else {
            // New upvote
            this.userVotes[annotationId] = 'up';
            this.updateAnnotationVotes(annotationId, 1, 0);
        }

        this.saveUserVotes();
        return this.userVotes[annotationId] || null;
    }

    /**
     * Downvote an annotation
     */
    downvote(annotationId) {
        const currentVote = this.userVotes[annotationId];
        
        if (currentVote === 'down') {
            // Remove downvote
            delete this.userVotes[annotationId];
            this.updateAnnotationVotes(annotationId, 0, -1);
        } else if (currentVote === 'up') {
            // Change from upvote to downvote
            this.userVotes[annotationId] = 'down';
            this.updateAnnotationVotes(annotationId, -1, 1);
        } else {
            // New downvote
            this.userVotes[annotationId] = 'down';
            this.updateAnnotationVotes(annotationId, 0, 1);
        }

        this.saveUserVotes();
        return this.userVotes[annotationId] || null;
    }

    /**
     * Update annotation vote counts
     */
    updateAnnotationVotes(annotationId, upDelta, downDelta) {
        for (const projectId in this.annotations) {
            const annotation = this.annotations[projectId].find(a => a.id === annotationId);
            if (annotation) {
                annotation.upvotes = Math.max(0, annotation.upvotes + upDelta);
                annotation.downvotes = Math.max(0, annotation.downvotes + downDelta);
                this.saveAnnotations();
                return;
            }
        }
    }

    /**
     * Get user's vote for an annotation
     */
    getUserVote(annotationId) {
        return this.userVotes[annotationId] || null;
    }

    // ===============================
    // Heatmap Generation
    // ===============================

    /**
     * Generate annotation heatmap data
     */
    generateHeatmap(projectId) {
        const annotations = this.annotations[projectId] || [];
        const heatmap = {};

        annotations.forEach(annotation => {
            if (annotation.lineStart) {
                for (let line = annotation.lineStart; line <= (annotation.lineEnd || annotation.lineStart); line++) {
                    heatmap[line] = (heatmap[line] || 0) + 1;
                }
            }
        });

        // Normalize to 0-1 scale
        const maxCount = Math.max(...Object.values(heatmap), 1);
        for (const line in heatmap) {
            heatmap[line] = heatmap[line] / maxCount;
        }

        return heatmap;
    }

    /**
     * Get most discussed sections
     */
    getMostDiscussedSections(projectId, limit = 5) {
        const annotations = this.annotations[projectId] || [];
        const sectionCounts = {};

        annotations.forEach(annotation => {
            const key = annotation.selector || annotation.codeSection || `line-${annotation.lineStart}`;
            sectionCounts[key] = (sectionCounts[key] || 0) + 1;
        });

        return Object.entries(sectionCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, limit)
            .map(([section, count]) => ({ section, count }));
    }

    // ===============================
    // AI Explanation (Mock/Placeholder)
    // ===============================

    /**
     * Generate explanation for code (placeholder for AI integration)
     */
    async explainCode(codeSnippet, context = {}) {
        // This is a placeholder that generates basic explanations
        // In production, this would call an AI API
        
        const explanations = {
            patterns: this.detectPatterns(codeSnippet),
            complexity: this.estimateComplexity(codeSnippet),
            suggestions: this.generateSuggestions(codeSnippet)
        };

        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 500));

        return {
            summary: this.generateSummary(codeSnippet, explanations),
            patterns: explanations.patterns,
            complexity: explanations.complexity,
            suggestions: explanations.suggestions
        };
    }

    detectPatterns(code) {
        const patterns = [];
        
        if (/function\s+\w+|=>\s*{|const\s+\w+\s*=\s*\(/.test(code)) {
            patterns.push({ name: 'Function Declaration', description: 'Code contains function definitions' });
        }
        if (/\.map\(|\.filter\(|\.reduce\(|\.forEach\(/.test(code)) {
            patterns.push({ name: 'Array Methods', description: 'Uses functional array methods' });
        }
        if (/async|await|Promise|\.then\(/.test(code)) {
            patterns.push({ name: 'Async/Await', description: 'Contains asynchronous operations' });
        }
        if (/class\s+\w+|constructor\(/.test(code)) {
            patterns.push({ name: 'OOP', description: 'Uses object-oriented programming patterns' });
        }
        if (/addEventListener|querySelector|getElementById/.test(code)) {
            patterns.push({ name: 'DOM Manipulation', description: 'Interacts with the Document Object Model' });
        }
        if (/localStorage|sessionStorage/.test(code)) {
            patterns.push({ name: 'Web Storage', description: 'Uses browser storage APIs' });
        }
        if (/fetch\(|XMLHttpRequest|axios/.test(code)) {
            patterns.push({ name: 'HTTP Requests', description: 'Makes network requests' });
        }

        return patterns;
    }

    estimateComplexity(code) {
        const lines = code.split('\n').length;
        const nestingLevel = (code.match(/{/g) || []).length;
        const conditions = (code.match(/if|else|switch|case|\?/g) || []).length;
        const loops = (code.match(/for|while|do|\.forEach|\.map/g) || []).length;

        let score = 0;
        score += Math.min(lines / 10, 3);
        score += Math.min(nestingLevel / 3, 3);
        score += Math.min(conditions / 2, 2);
        score += Math.min(loops, 2);

        if (score < 3) return { level: 'Simple', score, description: 'Straightforward code with low complexity' };
        if (score < 6) return { level: 'Moderate', score, description: 'Average complexity with some branching logic' };
        return { level: 'Complex', score, description: 'Higher complexity with multiple control flows' };
    }

    generateSuggestions(code) {
        const suggestions = [];

        if (/var\s+/.test(code)) {
            suggestions.push({ type: 'improvement', text: 'Consider using const or let instead of var' });
        }
        if (/function\s+\w+/.test(code) && !/=>/.test(code)) {
            suggestions.push({ type: 'tip', text: 'Arrow functions can make the code more concise' });
        }
        if (/\.innerHTML\s*=/.test(code)) {
            suggestions.push({ type: 'gotcha', text: 'Be careful with innerHTML - it can be a security risk (XSS)' });
        }
        if (!/try|catch/.test(code) && /await|\.then\(/.test(code)) {
            suggestions.push({ type: 'improvement', text: 'Consider adding error handling for async operations' });
        }

        return suggestions;
    }

    generateSummary(code, explanations) {
        const parts = [];
        
        if (explanations.patterns.length > 0) {
            parts.push(`This code uses ${explanations.patterns.map(p => p.name).join(', ')}.`);
        }
        
        parts.push(`Complexity: ${explanations.complexity.level} - ${explanations.complexity.description}`);
        
        if (explanations.suggestions.length > 0) {
            parts.push(`There are ${explanations.suggestions.length} suggestion(s) for improvement.`);
        }

        return parts.join(' ');
    }

    // ===============================
    // Export Functionality
    // ===============================

    /**
     * Export annotations as Markdown study notes
     */
    exportAsMarkdown(projectId) {
        const annotations = this.getProjectAnnotations(projectId, { sortBy: 'popular' });
        const project = window.projectManagerInstance?.state.allProjects?.find(p => p.title === projectId);
        
        let markdown = `# Study Notes: ${projectId}\n\n`;
        markdown += `*Exported from OpenPlayground on ${new Date().toLocaleDateString()}*\n\n`;
        
        if (project?.description) {
            markdown += `## Project Description\n${project.description}\n\n`;
        }

        // Group by category
        const byCategory = {};
        annotations.forEach(a => {
            if (!byCategory[a.category]) byCategory[a.category] = [];
            byCategory[a.category].push(a);
        });

        for (const category in byCategory) {
            const cat = this.categories[category];
            markdown += `## ${cat.icon} ${cat.label}s\n\n`;
            
            byCategory[category].forEach((annotation, index) => {
                markdown += `### ${index + 1}. ${annotation.content.substring(0, 50)}${annotation.content.length > 50 ? '...' : ''}\n\n`;
                markdown += `${annotation.content}\n\n`;
                
                if (annotation.codeSection) {
                    markdown += '```\n' + annotation.codeSection + '\n```\n\n';
                }
                
                markdown += `*Votes: 👍 ${annotation.upvotes} | 👎 ${annotation.downvotes}*\n\n`;
                markdown += '---\n\n';
            });
        }

        return markdown;
    }

    /**
     * Download annotations as markdown file
     */
    downloadMarkdown(projectId) {
        const markdown = this.exportAsMarkdown(projectId);
        const blob = new Blob([markdown], { type: 'text/markdown' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${this.sanitizeFilename(projectId)}-notes.md`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }

    // ===============================
    // Deep Linking
    // ===============================

    /**
     * Generate deep link to annotation
     */
    generateDeepLink(annotationId) {
        const url = new URL(window.location.href);
        url.searchParams.set('insight', annotationId);
        return url.toString();
    }

    /**
     * Check and handle deep link on page load
     */
    checkDeepLink() {
        const params = new URLSearchParams(window.location.search);
        const insightId = params.get('insight');

        if (insightId) {
            // Wait for page to load, then open the annotation
            const checkAndOpen = () => {
                const annotation = this.getAnnotationById(insightId);
                if (annotation) {
                    this.openInsightsPanel(annotation.projectId, insightId);
                }
            };

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => setTimeout(checkAndOpen, 500));
            } else {
                setTimeout(checkAndOpen, 500);
            }
        }
    }

    /**
     * Copy deep link to clipboard
     */
    async copyDeepLink(annotationId) {
        const link = this.generateDeepLink(annotationId);
        try {
            await navigator.clipboard.writeText(link);
            this.showNotification('Link copied to clipboard!', 'success');
        } catch (e) {
            // Fallback
            const input = document.createElement('input');
            input.value = link;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.showNotification('Link copied to clipboard!', 'success');
        }
    }

    // ===============================
    // Keyboard Shortcuts
    // ===============================

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            if (!this.isOverlayOpen) return;

            if (e.key === 'Escape') {
                this.closeInsightsPanel();
            }

            if (e.ctrlKey && e.key === 'n') {
                e.preventDefault();
                this.openNewAnnotationForm();
            }
        });
    }

    // ===============================
    // Panel Management
    // ===============================

    /**
     * Open insights panel for a project
     */
    openInsightsPanel(projectId, highlightAnnotationId = null) {
        this.currentProject = { title: projectId };
        
        // Render panel using insightRenderer
        if (window.insightRenderer) {
            window.insightRenderer.renderInsightsPanel(projectId, highlightAnnotationId);
            this.isOverlayOpen = true;
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close insights panel
     */
    closeInsightsPanel() {
        if (window.insightRenderer) {
            window.insightRenderer.closeInsightsPanel();
            this.isOverlayOpen = false;
            document.body.style.overflow = '';
        }

        // Clear URL param
        const url = new URL(window.location.href);
        url.searchParams.delete('insight');
        window.history.replaceState({}, '', url.toString());
    }

    /**
     * Open new annotation form
     */
    openNewAnnotationForm() {
        if (window.insightRenderer) {
            window.insightRenderer.showNewAnnotationForm();
        }
    }

    // ===============================
    // Storage
    // ===============================

    loadAnnotations() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            console.error('Failed to load annotations:', e);
            return {};
        }
    }

    saveAnnotations() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.annotations));
        } catch (e) {
            console.error('Failed to save annotations:', e);
        }
    }

    loadUserVotes() {
        try {
            const saved = localStorage.getItem(this.votesKey);
            return saved ? JSON.parse(saved) : {};
        } catch (e) {
            return {};
        }
    }

    saveUserVotes() {
        try {
            localStorage.setItem(this.votesKey, JSON.stringify(this.userVotes));
        } catch (e) {
            console.error('Failed to save votes:', e);
        }
    }

    // ===============================
    // Utilities
    // ===============================

    generateId() {
        return 'ann_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 9);
    }

    sanitizeFilename(name) {
        return name.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    }

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.annotation-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `annotation-notification ${type}`;
        notification.innerHTML = `
            <i class="ri-${type === 'success' ? 'check' : type === 'error' ? 'error-warning' : 'information'}-line"></i>
            <span>${message}</span>
        `;
        document.body.appendChild(notification);

        setTimeout(() => notification.classList.add('show'), 10);
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Create global instance
const annotationEngine = new AnnotationEngine();
window.annotationEngine = annotationEngine;

export { AnnotationEngine, annotationEngine };
