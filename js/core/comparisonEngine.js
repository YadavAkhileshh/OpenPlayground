// ===============================
// Comparison Engine for OpenPlayground
// Feature #1333: Interactive Project Comparison & Diff Viewer
// ===============================

class ComparisonEngine {
    constructor() {
        this.storageKey = 'project_comparisons';
        this.selectedKey = 'comparison_selected';
        this.maxComparisons = 3;
        this.selectedProjects = this.loadSelectedProjects();
        this.recentComparisons = this.loadRecentComparisons();
        
        this.init();
    }

    init() {
        // Check URL for shared comparison
        this.loadFromURL();
        
        // Setup keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeComparisonModal();
            }
        });

        // Setup compare button handler when DOM is ready
        const setupCompareButton = () => {
            const compareBtn = document.getElementById('compare-projects-btn');
            if (compareBtn) {
                compareBtn.addEventListener('click', () => this.openComparisonModal());
            }
            // Update UI with existing selections
            this.updateCompareUI();
        };

        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', setupCompareButton);
        } else {
            // DOM already loaded, setup with delay for dynamic content
            setTimeout(setupCompareButton, 100);
        }
    }

    // ===============================
    // Selection Management
    // ===============================

    /**
     * Toggle project selection for comparison
     */
    toggleSelection(project) {
        const projectId = this.getProjectId(project);
        const index = this.selectedProjects.findIndex(p => this.getProjectId(p) === projectId);

        if (index > -1) {
            // Remove if already selected
            this.selectedProjects.splice(index, 1);
            this.saveSelectedProjects();
            this.updateCompareUI();
            return false;
        } else if (this.selectedProjects.length < this.maxComparisons) {
            // Add if under limit
            this.selectedProjects.push(project);
            this.saveSelectedProjects();
            this.updateCompareUI();
            return true;
        } else {
            // Show max reached notification
            this.showNotification(`Maximum ${this.maxComparisons} projects can be compared at once`, 'warning');
            return false;
        }
    }

    /**
     * Check if project is selected
     */
    isSelected(project) {
        const projectId = this.getProjectId(project);
        return this.selectedProjects.some(p => this.getProjectId(p) === projectId);
    }

    /**
     * Clear all selections
     */
    clearSelections() {
        this.selectedProjects = [];
        this.saveSelectedProjects();
        this.updateCompareUI();
    }

    /**
     * Get unique project identifier
     */
    getProjectId(project) {
        return project.folder || project.name || project.title;
    }

    // ===============================
    // Comparison Logic
    // ===============================

    /**
     * Generate comparison data for selected projects
     */
    generateComparison() {
        if (this.selectedProjects.length < 2) {
            this.showNotification('Select at least 2 projects to compare', 'warning');
            return null;
        }

        const comparison = {
            id: this.generateComparisonId(),
            timestamp: Date.now(),
            projects: this.selectedProjects.map(p => ({
                ...p,
                id: this.getProjectId(p)
            })),
            analysis: this.analyzeProjects(this.selectedProjects)
        };

        // Save to recent comparisons
        this.saveToRecent(comparison);
        
        return comparison;
    }

    /**
     * Analyze projects for comparison
     */
    analyzeProjects(projects) {
        return {
            techOverlap: this.calculateTechOverlap(projects),
            categoryMatrix: this.generateCategoryMatrix(projects),
            complexityMetrics: this.estimateComplexity(projects),
            similarities: this.findSimilarities(projects),
            differences: this.findDifferences(projects)
        };
    }

    /**
     * Calculate tech stack overlap (Venn diagram data)
     */
    calculateTechOverlap(projects) {
        const techSets = projects.map(p => new Set(p.tech || []));
        const allTech = new Set();
        techSets.forEach(set => set.forEach(t => allTech.add(t)));

        const overlap = {
            all: Array.from(allTech),
            shared: [],
            unique: {},
            intersection: []
        };

        // Find shared tech (in all projects)
        overlap.all.forEach(tech => {
            const inAll = techSets.every(set => set.has(tech));
            if (inAll) {
                overlap.shared.push(tech);
                overlap.intersection.push(tech);
            }
        });

        // Find unique tech per project
        projects.forEach((project, index) => {
            const projectId = this.getProjectId(project);
            const projectTech = project.tech || [];
            
            overlap.unique[projectId] = projectTech.filter(tech => {
                return techSets.filter(set => set.has(tech)).length === 1;
            });
        });

        // Calculate overlap percentage
        if (allTech.size > 0) {
            overlap.overlapPercentage = Math.round((overlap.shared.length / allTech.size) * 100);
        } else {
            overlap.overlapPercentage = 0;
        }

        return overlap;
    }

    /**
     * Generate category comparison matrix
     */
    generateCategoryMatrix(projects) {
        const matrix = {
            categories: [...new Set(projects.map(p => p.category))],
            features: {},
            projectFeatures: {}
        };

        // Common features to compare
        const featureChecks = [
            { name: 'Has Icon', check: p => !!p.icon },
            { name: 'Has Description', check: p => !!p.description && p.description.length > 20 },
            { name: 'Has Tech Stack', check: p => p.tech && p.tech.length > 0 },
            { name: 'Has Custom Style', check: p => !!p.coverStyle || !!p.coverClass },
            { name: 'Has Rating', check: p => p.rating !== undefined },
            { name: 'Has Difficulty', check: p => !!p.difficulty },
            { name: 'Is Interactive', check: p => ['game', 'puzzle', 'fun'].includes(p.category?.toLowerCase()) }
        ];

        projects.forEach(project => {
            const projectId = this.getProjectId(project);
            matrix.projectFeatures[projectId] = {};
            
            featureChecks.forEach(feature => {
                matrix.projectFeatures[projectId][feature.name] = feature.check(project);
            });
        });

        matrix.featureNames = featureChecks.map(f => f.name);

        return matrix;
    }

    /**
     * Estimate project complexity
     */
    estimateComplexity(projects) {
        return projects.map(project => {
            const techCount = (project.tech || []).length;
            const hasDescription = project.description && project.description.length > 50;
            const hasAdvancedFeatures = project.coverStyle || project.coverClass;

            // Simple complexity score (would be more accurate with actual code analysis)
            let score = 0;
            score += techCount * 10;
            score += hasDescription ? 15 : 0;
            score += hasAdvancedFeatures ? 10 : 0;
            score += project.difficulty === 'advanced' ? 30 : project.difficulty === 'intermediate' ? 20 : 10;

            return {
                projectId: this.getProjectId(project),
                title: project.title,
                techCount,
                estimatedComplexity: score > 50 ? 'High' : score > 25 ? 'Medium' : 'Low',
                score,
                metrics: {
                    techStackSize: techCount,
                    hasDocumentation: hasDescription,
                    hasCustomStyling: !!hasAdvancedFeatures,
                    difficulty: project.difficulty || 'unknown'
                }
            };
        });
    }

    /**
     * Find similarities between projects
     */
    findSimilarities(projects) {
        const similarities = [];

        // Same category
        const categories = projects.map(p => p.category?.toLowerCase());
        if (categories.every(c => c === categories[0])) {
            similarities.push({
                type: 'category',
                label: 'Same Category',
                value: projects[0].category,
                icon: 'ri-folder-line'
            });
        }

        // Shared tech
        const techOverlap = this.calculateTechOverlap(projects);
        if (techOverlap.shared.length > 0) {
            similarities.push({
                type: 'tech',
                label: 'Shared Technologies',
                value: techOverlap.shared.join(', '),
                icon: 'ri-code-s-slash-line'
            });
        }

        // Similar difficulty
        const difficulties = projects.map(p => p.difficulty).filter(Boolean);
        if (difficulties.length > 1 && difficulties.every(d => d === difficulties[0])) {
            similarities.push({
                type: 'difficulty',
                label: 'Same Difficulty',
                value: difficulties[0],
                icon: 'ri-bar-chart-line'
            });
        }

        return similarities;
    }

    /**
     * Find differences between projects
     */
    findDifferences(projects) {
        const differences = [];

        // Different categories
        const categories = [...new Set(projects.map(p => p.category))];
        if (categories.length > 1) {
            differences.push({
                type: 'category',
                label: 'Different Categories',
                values: projects.map(p => ({ project: p.title, value: p.category })),
                icon: 'ri-folder-line'
            });
        }

        // Unique tech
        const techOverlap = this.calculateTechOverlap(projects);
        const hasUniqueTech = Object.values(techOverlap.unique).some(arr => arr.length > 0);
        if (hasUniqueTech) {
            differences.push({
                type: 'tech',
                label: 'Unique Technologies',
                values: projects.map(p => ({
                    project: p.title,
                    value: techOverlap.unique[this.getProjectId(p)]?.join(', ') || 'None'
                })),
                icon: 'ri-code-s-slash-line'
            });
        }

        return differences;
    }

    // ===============================
    // Similar Projects Recommendation
    // ===============================

    /**
     * Find similar projects based on a reference project
     */
    findSimilarProjects(referenceProject, allProjects, limit = 5) {
        const refId = this.getProjectId(referenceProject);
        const refTech = new Set(referenceProject.tech || []);
        const refCategory = referenceProject.category?.toLowerCase();

        const scored = allProjects
            .filter(p => this.getProjectId(p) !== refId)
            .map(project => {
                let score = 0;
                const projectTech = new Set(project.tech || []);

                // Category match (high weight)
                if (project.category?.toLowerCase() === refCategory) {
                    score += 50;
                }

                // Tech overlap
                const techOverlap = [...refTech].filter(t => projectTech.has(t)).length;
                score += techOverlap * 15;

                // Similar difficulty
                if (project.difficulty === referenceProject.difficulty) {
                    score += 20;
                }

                return { project, score };
            })
            .filter(item => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, limit);

        return scored.map(item => ({
            ...item.project,
            similarityScore: item.score
        }));
    }

    // ===============================
    // URL Sharing
    // ===============================

    /**
     * Generate shareable URL
     */
    generateShareableURL() {
        if (this.selectedProjects.length < 2) return null;

        const projectIds = this.selectedProjects.map(p => encodeURIComponent(this.getProjectId(p)));
        const params = new URLSearchParams();
        params.set('compare', projectIds.join(','));

        return `${window.location.origin}${window.location.pathname}?${params.toString()}`;
    }

    /**
     * Load comparison from URL
     */
    loadFromURL() {
        const params = new URLSearchParams(window.location.search);
        const compareParam = params.get('compare');

        if (compareParam) {
            const projectIds = compareParam.split(',').map(decodeURIComponent);
            
            // Wait for projects to load, then select them
            const checkAndLoad = () => {
                const allProjects = window.projectManagerInstance?.state.allProjects;
                if (allProjects && allProjects.length > 0) {
                    this.selectedProjects = [];
                    
                    projectIds.forEach(id => {
                        const project = allProjects.find(p => this.getProjectId(p) === id);
                        if (project && this.selectedProjects.length < this.maxComparisons) {
                            this.selectedProjects.push(project);
                        }
                    });

                    if (this.selectedProjects.length >= 2) {
                        this.saveSelectedProjects();
                        this.updateCompareUI();
                        // Auto-open comparison modal
                        setTimeout(() => this.openComparisonModal(), 500);
                    }
                } else {
                    setTimeout(checkAndLoad, 200);
                }
            };

            checkAndLoad();
        }
    }

    /**
     * Update URL with current comparison
     */
    updateURL() {
        const url = this.generateShareableURL();
        if (url) {
            window.history.replaceState({}, '', url);
        }
    }

    // ===============================
    // UI Management
    // ===============================

    /**
     * Update comparison UI elements
     */
    updateCompareUI() {
        // Update selection count badge
        const badge = document.getElementById('compare-count-badge');
        if (badge) {
            badge.textContent = this.selectedProjects.length;
            badge.style.display = this.selectedProjects.length > 0 ? 'flex' : 'none';
        }

        // Update compare button state
        const compareBtn = document.getElementById('compare-projects-btn');
        if (compareBtn) {
            compareBtn.disabled = this.selectedProjects.length < 2;
            compareBtn.classList.toggle('has-selection', this.selectedProjects.length > 0);
        }

        // Update floating compare bar
        this.updateFloatingBar();

        // Update card checkboxes
        document.querySelectorAll('.compare-checkbox').forEach(checkbox => {
            const projectTitle = checkbox.dataset.projectTitle;
            const isSelected = this.selectedProjects.some(p => p.title === projectTitle);
            checkbox.checked = isSelected;
            checkbox.closest('.card')?.classList.toggle('compare-selected', isSelected);
        });

        // Dispatch event for other components
        document.dispatchEvent(new CustomEvent('comparisonUpdated', {
            detail: { selectedCount: this.selectedProjects.length, projects: this.selectedProjects }
        }));
    }

    /**
     * Update floating comparison bar
     */
    updateFloatingBar() {
        let bar = document.getElementById('floating-compare-bar');
        
        if (this.selectedProjects.length === 0) {
            if (bar) bar.classList.remove('visible');
            return;
        }

        if (!bar) {
            bar = this.createFloatingBar();
        }

        const projectsList = bar.querySelector('.compare-bar-projects');
        const compareBtn = bar.querySelector('.compare-bar-btn');
        
        projectsList.innerHTML = this.selectedProjects.map(p => `
            <div class="compare-bar-project">
                <span>${this.escapeHtml(p.title)}</span>
                <button class="remove-project-btn" data-project-title="${this.escapeHtml(p.title)}" title="Remove">
                    <i class="ri-close-line"></i>
                </button>
            </div>
        `).join('');

        compareBtn.disabled = this.selectedProjects.length < 2;
        bar.classList.add('visible');

        // Attach remove handlers
        bar.querySelectorAll('.remove-project-btn').forEach(btn => {
            btn.onclick = (e) => {
                e.stopPropagation();
                const title = btn.dataset.projectTitle;
                const project = this.selectedProjects.find(p => p.title === title);
                if (project) this.toggleSelection(project);
            };
        });
    }

    /**
     * Create floating comparison bar
     */
    createFloatingBar() {
        const bar = document.createElement('div');
        bar.id = 'floating-compare-bar';
        bar.className = 'floating-compare-bar';
        bar.innerHTML = `
            <div class="compare-bar-content">
                <div class="compare-bar-label">
                    <i class="ri-git-compare-line"></i>
                    <span>Compare Projects</span>
                </div>
                <div class="compare-bar-projects"></div>
                <div class="compare-bar-actions">
                    <button class="compare-bar-btn secondary" onclick="window.comparisonEngine.clearSelections()">
                        Clear
                    </button>
                    <button class="compare-bar-btn primary" onclick="window.comparisonEngine.openComparisonModal()">
                        Compare <i class="ri-arrow-right-line"></i>
                    </button>
                </div>
            </div>
        `;
        document.body.appendChild(bar);
        return bar;
    }

    /**
     * Open comparison modal
     */
    openComparisonModal() {
        const comparison = this.generateComparison();
        if (!comparison) return;

        this.updateURL();
        this.renderComparisonModal(comparison);
    }

    /**
     * Close comparison modal
     */
    closeComparisonModal() {
        const modal = document.getElementById('comparison-modal');
        if (modal) {
            modal.classList.remove('visible');
            setTimeout(() => modal.remove(), 300);
        }
        
        // Clear URL params
        window.history.replaceState({}, '', window.location.pathname);
    }

    /**
     * Render comparison modal
     */
    renderComparisonModal(comparison) {
        // Remove existing modal
        document.getElementById('comparison-modal')?.remove();

        const modal = document.createElement('div');
        modal.id = 'comparison-modal';
        modal.className = 'comparison-modal';
        
        const { projects, analysis } = comparison;

        modal.innerHTML = `
            <div class="comparison-modal-overlay" onclick="window.comparisonEngine.closeComparisonModal()"></div>
            <div class="comparison-modal-content">
                <div class="comparison-modal-header">
                    <h2><i class="ri-git-compare-line"></i> Project Comparison</h2>
                    <div class="comparison-modal-actions">
                        <button class="share-comparison-btn" onclick="window.comparisonEngine.copyShareLink()" title="Copy share link">
                            <i class="ri-share-line"></i> Share
                        </button>
                        <button class="close-modal-btn" onclick="window.comparisonEngine.closeComparisonModal()">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>
                </div>
                
                <div class="comparison-modal-body">
                    <!-- Project Cards Side by Side -->
                    <section class="comparison-section projects-overview">
                        <h3><i class="ri-layout-column-line"></i> Projects Overview</h3>
                        <div class="comparison-cards">
                            ${projects.map(p => this.renderProjectCard(p)).join('')}
                        </div>
                    </section>
                    
                    <!-- Tech Stack Overlap -->
                    <section class="comparison-section tech-overlap">
                        <h3><i class="ri-code-s-slash-line"></i> Tech Stack Comparison</h3>
                        ${this.renderTechOverlap(analysis.techOverlap, projects)}
                    </section>
                    
                    <!-- Complexity Metrics -->
                    <section class="comparison-section complexity-metrics">
                        <h3><i class="ri-bar-chart-grouped-line"></i> Complexity Analysis</h3>
                        ${this.renderComplexityMetrics(analysis.complexityMetrics)}
                    </section>
                    
                    <!-- Feature Matrix -->
                    <section class="comparison-section feature-matrix">
                        <h3><i class="ri-checkbox-multiple-line"></i> Feature Comparison</h3>
                        ${this.renderFeatureMatrix(analysis.categoryMatrix, projects)}
                    </section>
                    
                    <!-- Similarities & Differences -->
                    <section class="comparison-section similarities-differences">
                        <div class="sim-diff-grid">
                            <div class="similarities-panel">
                                <h4><i class="ri-links-line"></i> Similarities</h4>
                                ${this.renderSimilarities(analysis.similarities)}
                            </div>
                            <div class="differences-panel">
                                <h4><i class="ri-arrow-left-right-line"></i> Differences</h4>
                                ${this.renderDifferences(analysis.differences)}
                            </div>
                        </div>
                    </section>
                    
                    <!-- Similar Projects Recommendation -->
                    <section class="comparison-section similar-projects">
                        <h3><i class="ri-lightbulb-line"></i> You Might Also Like</h3>
                        ${this.renderSimilarProjectsSection(projects[0])}
                    </section>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        
        // Trigger animation
        requestAnimationFrame(() => modal.classList.add('visible'));
    }

    /**
     * Render individual project card for comparison
     */
    renderProjectCard(project) {
        const techHtml = (project.tech || []).map(t => 
            `<span class="tech-tag">${this.escapeHtml(t)}</span>`
        ).join('');

        return `
            <div class="comparison-project-card">
                <div class="project-card-header">
                    <div class="project-icon ${project.coverClass || ''}">
                        <i class="${project.icon || 'ri-code-s-slash-line'}"></i>
                    </div>
                    <div class="project-info">
                        <h4>${this.escapeHtml(project.title)}</h4>
                        <span class="category-badge">${this.escapeHtml(project.category)}</span>
                    </div>
                </div>
                <p class="project-description">${this.escapeHtml(project.description || 'No description available')}</p>
                <div class="project-tech-stack">
                    ${techHtml || '<span class="no-tech">No tech stack specified</span>'}
                </div>
                <a href="${project.link}" class="view-project-link" target="_blank">
                    View Project <i class="ri-external-link-line"></i>
                </a>
            </div>
        `;
    }

    /**
     * Render tech overlap visualization
     */
    renderTechOverlap(overlap, projects) {
        const sharedHtml = overlap.shared.length > 0 
            ? overlap.shared.map(t => `<span class="tech-tag shared">${this.escapeHtml(t)}</span>`).join('')
            : '<span class="no-overlap">No shared technologies</span>';

        const uniqueHtml = projects.map(p => {
            const id = this.getProjectId(p);
            const unique = overlap.unique[id] || [];
            return `
                <div class="unique-tech-group">
                    <h5>${this.escapeHtml(p.title)}</h5>
                    <div class="tech-tags">
                        ${unique.length > 0 
                            ? unique.map(t => `<span class="tech-tag unique">${this.escapeHtml(t)}</span>`).join('')
                            : '<span class="no-unique">No unique tech</span>'
                        }
                    </div>
                </div>
            `;
        }).join('');

        return `
            <div class="tech-overlap-container">
                <div class="overlap-stat">
                    <div class="overlap-percentage">${overlap.overlapPercentage}%</div>
                    <div class="overlap-label">Tech Overlap</div>
                </div>
                <div class="tech-details">
                    <div class="shared-tech">
                        <h5><i class="ri-links-line"></i> Shared Technologies</h5>
                        <div class="tech-tags">${sharedHtml}</div>
                    </div>
                    <div class="unique-tech">
                        <h5><i class="ri-star-line"></i> Unique to Each Project</h5>
                        ${uniqueHtml}
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Render complexity metrics
     */
    renderComplexityMetrics(metrics) {
        const maxScore = Math.max(...metrics.map(m => m.score));

        return `
            <div class="complexity-bars">
                ${metrics.map(m => `
                    <div class="complexity-item">
                        <div class="complexity-header">
                            <span class="project-name">${this.escapeHtml(m.title)}</span>
                            <span class="complexity-badge ${m.estimatedComplexity.toLowerCase()}">${m.estimatedComplexity}</span>
                        </div>
                        <div class="complexity-bar">
                            <div class="complexity-fill" style="width: ${(m.score / maxScore) * 100}%"></div>
                        </div>
                        <div class="complexity-details">
                            <span><i class="ri-code-s-slash-line"></i> ${m.techCount} technologies</span>
                            <span>${m.metrics.hasDocumentation ? '<i class="ri-check-line"></i> Has docs' : '<i class="ri-close-line"></i> No docs'}</span>
                        </div>
                    </div>
                `).join('')}
            </div>
        `;
    }

    /**
     * Render feature comparison matrix
     */
    renderFeatureMatrix(matrix, projects) {
        const headerRow = `
            <tr>
                <th>Feature</th>
                ${projects.map(p => `<th>${this.escapeHtml(p.title)}</th>`).join('')}
            </tr>
        `;

        const rows = matrix.featureNames.map(feature => `
            <tr>
                <td class="feature-name">${feature}</td>
                ${projects.map(p => {
                    const id = this.getProjectId(p);
                    const hasFeature = matrix.projectFeatures[id]?.[feature];
                    return `<td class="feature-cell ${hasFeature ? 'has-feature' : 'no-feature'}">
                        <i class="${hasFeature ? 'ri-check-line' : 'ri-close-line'}"></i>
                    </td>`;
                }).join('')}
            </tr>
        `).join('');

        return `
            <div class="feature-matrix-table">
                <table>
                    <thead>${headerRow}</thead>
                    <tbody>${rows}</tbody>
                </table>
            </div>
        `;
    }

    /**
     * Render similarities
     */
    renderSimilarities(similarities) {
        if (similarities.length === 0) {
            return '<p class="no-data">No significant similarities found</p>';
        }

        return similarities.map(sim => `
            <div class="sim-item">
                <i class="${sim.icon}"></i>
                <div class="sim-content">
                    <strong>${sim.label}</strong>
                    <span>${this.escapeHtml(sim.value)}</span>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render differences
     */
    renderDifferences(differences) {
        if (differences.length === 0) {
            return '<p class="no-data">No significant differences found</p>';
        }

        return differences.map(diff => `
            <div class="diff-item">
                <i class="${diff.icon}"></i>
                <div class="diff-content">
                    <strong>${diff.label}</strong>
                    <div class="diff-values">
                        ${diff.values.map(v => `
                            <span class="diff-value"><em>${this.escapeHtml(v.project)}:</em> ${this.escapeHtml(v.value)}</span>
                        `).join('')}
                    </div>
                </div>
            </div>
        `).join('');
    }

    /**
     * Render similar projects section
     */
    renderSimilarProjectsSection(referenceProject) {
        const allProjects = window.projectManagerInstance?.state.allProjects || [];
        const similar = this.findSimilarProjects(referenceProject, allProjects, 4);

        if (similar.length === 0) {
            return '<p class="no-data">No similar projects found</p>';
        }

        return `
            <div class="similar-projects-grid">
                ${similar.map(p => `
                    <a href="${p.link}" class="similar-project-card">
                        <div class="similar-project-icon">
                            <i class="${p.icon || 'ri-code-s-slash-line'}"></i>
                        </div>
                        <div class="similar-project-info">
                            <h5>${this.escapeHtml(p.title)}</h5>
                            <span class="similarity-score">${p.similarityScore}% match</span>
                        </div>
                    </a>
                `).join('')}
            </div>
        `;
    }

    /**
     * Copy share link to clipboard
     */
    async copyShareLink() {
        const url = this.generateShareableURL();
        if (!url) return;

        try {
            await navigator.clipboard.writeText(url);
            this.showNotification('Comparison link copied to clipboard!', 'success');
        } catch (err) {
            // Fallback for older browsers
            const input = document.createElement('input');
            input.value = url;
            document.body.appendChild(input);
            input.select();
            document.execCommand('copy');
            document.body.removeChild(input);
            this.showNotification('Comparison link copied to clipboard!', 'success');
        }
    }

    // ===============================
    // Storage
    // ===============================

    loadSelectedProjects() {
        try {
            const saved = sessionStorage.getItem(this.selectedKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveSelectedProjects() {
        try {
            sessionStorage.setItem(this.selectedKey, JSON.stringify(this.selectedProjects));
        } catch (e) {
            console.error('Failed to save selected projects:', e);
        }
    }

    loadRecentComparisons() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : [];
        } catch (e) {
            return [];
        }
    }

    saveToRecent(comparison) {
        this.recentComparisons.unshift(comparison);
        // Keep only last 10 comparisons
        this.recentComparisons = this.recentComparisons.slice(0, 10);
        
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.recentComparisons));
        } catch (e) {
            console.error('Failed to save comparison:', e);
        }
    }

    generateComparisonId() {
        return 'cmp_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
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

    showNotification(message, type = 'info') {
        const existing = document.querySelector('.comparison-notification');
        if (existing) existing.remove();

        const notification = document.createElement('div');
        notification.className = `comparison-notification ${type}`;
        notification.innerHTML = `
            <i class="ri-${type === 'success' ? 'check' : type === 'warning' ? 'alert' : 'information'}-line"></i>
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
const comparisonEngine = new ComparisonEngine();

// Export for use in other scripts
window.ComparisonEngine = ComparisonEngine;
window.comparisonEngine = comparisonEngine;

export { ComparisonEngine, comparisonEngine };
