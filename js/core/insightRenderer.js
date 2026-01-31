// ===============================
// Insight Renderer for OpenPlayground
// Feature #1335: Community Annotations & Code Insights System
// ===============================

class InsightRenderer {
    constructor() {
        this.panel = null;
        this.currentFilter = 'all';
        this.currentSort = 'popular';
        this.highlightedAnnotation = null;
        
        this.init();
    }

    init() {
        this.createInsightsPanel();
        this.setupKeyboardShortcuts();
    }

    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Only handle if panel is visible
            if (!this.panel?.classList.contains('visible')) return;
            
            // Escape to close
            if (e.key === 'Escape') {
                this.closeInsightsPanel();
                e.preventDefault();
            }
            
            // Ctrl+N to add new annotation
            if (e.ctrlKey && e.key === 'n') {
                this.showNewAnnotationForm();
                e.preventDefault();
            }
        });
    }

    // ===============================
    // Panel Creation
    // ===============================

    createInsightsPanel() {
        // Remove existing panel if any
        document.getElementById('insights-panel')?.remove();

        const panel = document.createElement('div');
        panel.id = 'insights-panel';
        panel.className = 'insights-panel';
        panel.innerHTML = this.getPanelHTML();
        
        document.body.appendChild(panel);
        this.panel = panel;
    }

    getPanelHTML() {
        const categories = window.annotationEngine?.categories || {
            tip: { icon: '💡', label: 'Tip', color: '#fbbf24' },
            gotcha: { icon: '⚠️', label: 'Gotcha', color: '#ef4444' },
            learn: { icon: '🎓', label: 'Learn', color: '#8b5cf6' },
            improvement: { icon: '🔧', label: 'Improvement', color: '#10b981' }
        };

        return `
            <div class="insights-overlay" onclick="window.insightRenderer.closeInsightsPanel()"></div>
            <div class="insights-container">
                <div class="insights-header">
                    <div class="insights-title">
                        <i class="ri-lightbulb-flash-line"></i>
                        <span id="insights-project-title">Community Insights</span>
                        <span class="insights-count" id="insights-count">0</span>
                    </div>
                    <div class="insights-header-actions">
                        <button class="insights-action-btn" onclick="window.insightRenderer.showNewAnnotationForm()" title="Add Insight (Ctrl+N)">
                            <i class="ri-add-line"></i>
                        </button>
                        <button class="insights-action-btn" onclick="window.annotationEngine.downloadMarkdown(window.annotationEngine.currentProject?.title)" title="Export Notes">
                            <i class="ri-download-2-line"></i>
                        </button>
                        <button class="insights-close-btn" onclick="window.insightRenderer.closeInsightsPanel()" title="Close (Esc)">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>
                
                <div class="insights-toolbar">
                    <div class="insights-filters">
                        <button class="filter-chip active" data-filter="all" onclick="window.insightRenderer.setFilter('all')">
                            All
                        </button>
                        ${Object.entries(categories).map(([key, cat]) => `
                            <button class="filter-chip" data-filter="${key}" onclick="window.insightRenderer.setFilter('${key}')">
                                ${cat.icon} ${cat.label}
                            </button>
                        `).join('')}
                    </div>
                    <div class="insights-sort">
                        <select id="insights-sort-select" onchange="window.insightRenderer.setSort(this.value)">
                            <option value="popular">Most Popular</option>
                            <option value="newest">Newest First</option>
                            <option value="oldest">Oldest First</option>
                        </select>
                    </div>
                </div>
                
                <div class="insights-body">
                    <!-- Heatmap Section -->
                    <div class="insights-heatmap-section" id="insights-heatmap-section">
                        <h4><i class="ri-fire-line"></i> Activity Heatmap</h4>
                        <div class="heatmap-container" id="heatmap-container"></div>
                    </div>
                    
                    <!-- Annotations List -->
                    <div class="insights-list" id="insights-list">
                        <!-- Annotations rendered here -->
                    </div>
                    
                    <!-- Empty State -->
                    <div class="insights-empty" id="insights-empty" style="display: none;">
                        <div class="empty-icon"><i class="ri-lightbulb-line"></i></div>
                        <h3>No insights yet!</h3>
                        <p>Be the first to share knowledge about this project.</p>
                        <button class="btn-primary" onclick="window.insightRenderer.showNewAnnotationForm()">
                            <i class="ri-add-line"></i> Add First Insight
                        </button>
                    </div>
                </div>
                
                <!-- New Annotation Form -->
                <div class="new-annotation-form" id="new-annotation-form" style="display: none;">
                    <div class="form-header">
                        <h4><i class="ri-edit-line"></i> Add New Insight</h4>
                        <button class="close-form-btn" onclick="window.insightRenderer.hideNewAnnotationForm()">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                    <div class="form-body">
                        <div class="form-group">
                            <label>Category</label>
                            <div class="category-selector">
                                ${Object.entries(categories).map(([key, cat]) => `
                                    <label class="category-option">
                                        <input type="radio" name="annotation-category" value="${key}" ${key === 'tip' ? 'checked' : ''}>
                                        <span class="category-label" style="--cat-color: ${cat.color}">
                                            ${cat.icon} ${cat.label}
                                        </span>
                                    </label>
                                `).join('')}
                            </div>
                        </div>
                        <div class="form-group">
                            <label for="annotation-content">Your Insight</label>
                            <textarea id="annotation-content" placeholder="Share your tip, gotcha, learning, or improvement suggestion..." rows="4"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="annotation-code">Code Snippet (Optional)</label>
                            <textarea id="annotation-code" placeholder="Paste relevant code here..." rows="3" class="code-input"></textarea>
                        </div>
                        <div class="form-group">
                            <label for="annotation-author">Your Name (Optional)</label>
                            <input type="text" id="annotation-author" placeholder="Anonymous">
                        </div>
                        <div class="form-actions">
                            <button class="btn-secondary" onclick="window.insightRenderer.hideNewAnnotationForm()">Cancel</button>
                            <button class="btn-primary" onclick="window.insightRenderer.submitAnnotation()">
                                <i class="ri-send-plane-line"></i> Submit Insight
                            </button>
                        </div>
                    </div>
                </div>
                
                <!-- AI Explanation Modal -->
                <div class="ai-explanation-modal" id="ai-explanation-modal" style="display: none;">
                    <div class="ai-modal-content">
                        <div class="ai-modal-header">
                            <h4><i class="ri-robot-line"></i> Code Explanation</h4>
                            <button onclick="window.insightRenderer.closeExplanationModal()">
                                <i class="ri-close-line"></i>
                            </button>
                        </div>
                        <div class="ai-modal-body" id="ai-modal-body">
                            <!-- Explanation content -->
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ===============================
    // Panel Display
    // ===============================

    renderInsightsPanel(projectId, highlightAnnotationId = null) {
        this.highlightedAnnotation = highlightAnnotationId;
        
        // Update title
        const titleEl = document.getElementById('insights-project-title');
        if (titleEl) titleEl.textContent = `Insights: ${projectId}`;

        // Render content
        this.renderAnnotations(projectId);
        this.renderHeatmap(projectId);
        
        // Show panel
        this.panel.classList.add('visible');

        // Scroll to highlighted annotation
        if (highlightAnnotationId) {
            setTimeout(() => {
                const el = document.getElementById(`annotation-${highlightAnnotationId}`);
                if (el) {
                    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    el.classList.add('highlighted');
                }
            }, 300);
        }
    }

    closeInsightsPanel() {
        this.panel.classList.remove('visible');
        this.hideNewAnnotationForm();
        this.closeExplanationModal();
    }

    // ===============================
    // Annotation Rendering
    // ===============================

    renderAnnotations(projectId) {
        const engine = window.annotationEngine;
        const annotations = engine.getProjectAnnotations(projectId, {
            category: this.currentFilter,
            sortBy: this.currentSort
        });

        const listEl = document.getElementById('insights-list');
        const emptyEl = document.getElementById('insights-empty');
        const countEl = document.getElementById('insights-count');

        if (countEl) countEl.textContent = annotations.length;

        if (annotations.length === 0) {
            listEl.style.display = 'none';
            emptyEl.style.display = 'flex';
            return;
        }

        listEl.style.display = 'block';
        emptyEl.style.display = 'none';

        listEl.innerHTML = annotations.map(ann => this.renderAnnotationCard(ann)).join('');
    }

    renderAnnotationCard(annotation) {
        const engine = window.annotationEngine;
        const category = engine.categories[annotation.category];
        const userVote = engine.getUserVote(annotation.id);
        const score = annotation.upvotes - annotation.downvotes;
        const isHighlighted = this.highlightedAnnotation === annotation.id;
        const timeAgo = this.formatTimeAgo(annotation.createdAt);

        return `
            <div class="annotation-card ${isHighlighted ? 'highlighted' : ''}" id="annotation-${annotation.id}">
                <div class="annotation-header">
                    <span class="annotation-category" style="--cat-color: ${category.color}">
                        ${category.icon} ${category.label}
                    </span>
                    <span class="annotation-meta">
                        <span class="annotation-author">${this.escapeHtml(annotation.author)}</span>
                        <span class="annotation-time">${timeAgo}</span>
                    </span>
                </div>
                
                <div class="annotation-content">
                    ${this.escapeHtml(annotation.content)}
                </div>
                
                ${annotation.codeSection ? `
                    <div class="annotation-code">
                        <pre><code>${this.escapeHtml(annotation.codeSection)}</code></pre>
                        <button class="explain-btn" onclick="window.insightRenderer.explainCode('${annotation.id}')" title="Explain This Code">
                            <i class="ri-robot-line"></i> Explain This
                        </button>
                    </div>
                ` : ''}
                
                <div class="annotation-footer">
                    <div class="annotation-votes">
                        <button class="vote-btn ${userVote === 'up' ? 'active' : ''}" onclick="window.insightRenderer.vote('${annotation.id}', 'up')">
                            <i class="ri-thumb-up-line"></i>
                            <span>${annotation.upvotes}</span>
                        </button>
                        <span class="vote-score ${score > 0 ? 'positive' : score < 0 ? 'negative' : ''}">${score > 0 ? '+' : ''}${score}</span>
                        <button class="vote-btn ${userVote === 'down' ? 'active' : ''}" onclick="window.insightRenderer.vote('${annotation.id}', 'down')">
                            <i class="ri-thumb-down-line"></i>
                            <span>${annotation.downvotes}</span>
                        </button>
                    </div>
                    <div class="annotation-actions">
                        <button class="action-btn" onclick="window.annotationEngine.copyDeepLink('${annotation.id}')" title="Copy Link">
                            <i class="ri-link"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ===============================
    // Heatmap Rendering
    // ===============================

    renderHeatmap(projectId) {
        const engine = window.annotationEngine;
        const heatmap = engine.generateHeatmap(projectId);
        const mostDiscussed = engine.getMostDiscussedSections(projectId);
        
        const container = document.getElementById('heatmap-container');
        const section = document.getElementById('insights-heatmap-section');

        if (Object.keys(heatmap).length === 0) {
            section.style.display = 'none';
            return;
        }

        section.style.display = 'block';

        // Render simple heatmap visualization
        container.innerHTML = `
            <div class="heatmap-stats">
                <div class="heatmap-stat">
                    <span class="stat-value">${Object.keys(heatmap).length}</span>
                    <span class="stat-label">Lines Discussed</span>
                </div>
                <div class="heatmap-stat">
                    <span class="stat-value">${mostDiscussed.length}</span>
                    <span class="stat-label">Hot Sections</span>
                </div>
            </div>
            <div class="most-discussed">
                <h5>Most Discussed</h5>
                ${mostDiscussed.map(item => `
                    <div class="discussed-item">
                        <span class="discussed-section">${this.escapeHtml(item.section)}</span>
                        <span class="discussed-count">${item.count} insights</span>
                    </div>
                `).join('')}
            </div>
        `;
    }

    // ===============================
    // Filtering & Sorting
    // ===============================

    setFilter(filter) {
        this.currentFilter = filter;
        
        // Update active chip
        document.querySelectorAll('.filter-chip').forEach(chip => {
            chip.classList.toggle('active', chip.dataset.filter === filter);
        });

        // Re-render
        const projectId = window.annotationEngine.currentProject?.title;
        if (projectId) this.renderAnnotations(projectId);
    }

    setSort(sort) {
        this.currentSort = sort;
        
        // Re-render
        const projectId = window.annotationEngine.currentProject?.title;
        if (projectId) this.renderAnnotations(projectId);
    }

    // ===============================
    // Voting
    // ===============================

    vote(annotationId, type) {
        const engine = window.annotationEngine;
        
        if (type === 'up') {
            engine.upvote(annotationId);
        } else {
            engine.downvote(annotationId);
        }

        // Re-render the specific card
        const projectId = engine.currentProject?.title;
        if (projectId) this.renderAnnotations(projectId);
    }

    // ===============================
    // New Annotation Form
    // ===============================

    showNewAnnotationForm() {
        const form = document.getElementById('new-annotation-form');
        if (form) {
            form.style.display = 'flex';
            document.getElementById('annotation-content')?.focus();
        }
    }

    hideNewAnnotationForm() {
        const form = document.getElementById('new-annotation-form');
        if (form) {
            form.style.display = 'none';
            // Reset form
            document.getElementById('annotation-content').value = '';
            document.getElementById('annotation-code').value = '';
            document.getElementById('annotation-author').value = '';
        }
    }

    submitAnnotation() {
        const content = document.getElementById('annotation-content')?.value.trim();
        const codeSection = document.getElementById('annotation-code')?.value.trim();
        const author = document.getElementById('annotation-author')?.value.trim() || 'Anonymous';
        const category = document.querySelector('input[name="annotation-category"]:checked')?.value || 'tip';

        if (!content) {
            window.annotationEngine.showNotification('Please enter your insight', 'error');
            return;
        }

        const engine = window.annotationEngine;
        const projectId = engine.currentProject?.title;

        if (!projectId) {
            window.annotationEngine.showNotification('No project selected', 'error');
            return;
        }

        engine.createAnnotation({
            projectId,
            category,
            content,
            codeSection: codeSection || null,
            author
        });

        this.hideNewAnnotationForm();
        this.renderAnnotations(projectId);
        this.renderHeatmap(projectId);
        
        engine.showNotification('Insight added successfully!', 'success');
    }

    // ===============================
    // AI Explanation
    // ===============================

    async explainCode(annotationId) {
        const annotation = window.annotationEngine.getAnnotationById(annotationId);
        if (!annotation?.codeSection) return;

        const modal = document.getElementById('ai-explanation-modal');
        const body = document.getElementById('ai-modal-body');

        modal.style.display = 'flex';
        body.innerHTML = '<div class="loading-spinner"><i class="ri-loader-4-line"></i> Analyzing code...</div>';

        try {
            const explanation = await window.annotationEngine.explainCode(annotation.codeSection);
            
            body.innerHTML = `
                <div class="explanation-summary">
                    <h5>Summary</h5>
                    <p>${explanation.summary}</p>
                </div>
                
                ${explanation.patterns.length > 0 ? `
                    <div class="explanation-patterns">
                        <h5>Patterns Detected</h5>
                        <ul>
                            ${explanation.patterns.map(p => `
                                <li>
                                    <strong>${p.name}</strong>
                                    <span>${p.description}</span>
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
                
                <div class="explanation-complexity">
                    <h5>Complexity: ${explanation.complexity.level}</h5>
                    <p>${explanation.complexity.description}</p>
                </div>
                
                ${explanation.suggestions.length > 0 ? `
                    <div class="explanation-suggestions">
                        <h5>Suggestions</h5>
                        <ul>
                            ${explanation.suggestions.map(s => `
                                <li class="suggestion-${s.type}">
                                    <i class="ri-${s.type === 'tip' ? 'lightbulb' : s.type === 'gotcha' ? 'alert' : 'tools'}-line"></i>
                                    ${s.text}
                                </li>
                            `).join('')}
                        </ul>
                    </div>
                ` : ''}
            `;
        } catch (error) {
            body.innerHTML = `<div class="error-message">Failed to analyze code. Please try again.</div>`;
        }
    }

    closeExplanationModal() {
        const modal = document.getElementById('ai-explanation-modal');
        if (modal) modal.style.display = 'none';
    }

    // ===============================
    // Utilities
    // ===============================

    escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    formatTimeAgo(timestamp) {
        const seconds = Math.floor((Date.now() - timestamp) / 1000);
        
        if (seconds < 60) return 'just now';
        if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
        if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
        if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
        return new Date(timestamp).toLocaleDateString();
    }
}

// Create global instance
const insightRenderer = new InsightRenderer();
window.insightRenderer = insightRenderer;

export { InsightRenderer, insightRenderer };
