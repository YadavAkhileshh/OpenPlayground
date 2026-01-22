// ===============================
// Component Loader for OpenPlayground
// Dynamically loads HTML components
// ===============================

class ComponentLoader {
    constructor() {
        this.components = {
            'header': './components/header.html',
            'hero': './components/hero.html',
            'projects': './components/projects.html',
            'contribute': './components/contribute.html',
            'contributors': './components/contributors.html',
            'footer': './components/footer.html',
            'chatbot': './components/chatbot.html'
        };
        this.loadedComponents = new Set();
        
        this.dependencyManager = new ProjectDependencyManager();
        this.reusableComponents = new ReusableComponentLibrary();
    }

    async loadComponent(name, targetSelector) {
        try {
            if (this.loadedComponents.has(name)) {
                console.log(`Component ${name} already loaded`);
                return;
            }

            const response = await fetch(this.components[name]);
            if (!response.ok) {
                throw new Error(`Failed to load component ${name}: ${response.status}`);
            }

            const html = await response.text();
            const target = document.querySelector(targetSelector);

            if (!target) {
                throw new Error(`Target element ${targetSelector} not found`);
            }

            target.innerHTML = html;
            this.loadedComponents.add(name);

            console.log(`✅ Component ${name} loaded successfully`);

            await this.analyzeComponent(name, html);

            // Trigger custom event for component loaded
            document.dispatchEvent(new CustomEvent('componentLoaded', {
                detail: { component: name, target: targetSelector }
            }));

        } catch (error) {
            console.error(`❌ Error loading component ${name}:`, error);

            const target = document.querySelector(targetSelector);
            if (target) {
                target.innerHTML = `
                    <div style="padding: 2rem; text-align: center; color: #ef4444; background: #fef2f2; border-radius: 8px; margin: 1rem;">
                        <h3>⚠️ Component Loading Error</h3>
                        <p>Failed to load ${name} component. Please refresh the page.</p>
                    </div>
                `;
            }
        }
    }

    async analyzeComponent(name, html) {
        const scriptRegex = /<script[^>]*src=["']([^"']+)["'][^>]*>/g;
        const scripts = [];
        let match;
        while ((match = scriptRegex.exec(html)) !== null) {
            scripts.push(match[1]);
        }

        const cssRegex = /<link[^>]*href=["']([^"']+)["'][^>]*rel=["']stylesheet["'][^>]*>/g;
        const stylesheets = [];
        while ((match = cssRegex.exec(html)) !== null) {
            stylesheets.push(match[1]);
        }

        const imgRegex = /<img[^>]*src=["']([^"']+)["'][^>]*>/g;
        const images = [];
        while ((match = imgRegex.exec(html)) !== null) {
            images.push(match[1]);
        }

        await this.dependencyManager.addComponent(name, {
            scripts,
            stylesheets,
            images,
            size: new Blob([html]).size,
            timestamp: Date.now()
        });
    }

    async loadAllComponents() {
        const componentMap = [
            { name: 'header', selector: '#header-placeholder' },
            { name: 'hero', selector: '#hero-placeholder' },
            { name: 'projects', selector: '#projects-placeholder' },
            { name: 'contribute', selector: '#contribute-placeholder' },
            { name: 'footer', selector: '#footer-placeholder' },
            { name: 'chatbot', selector: '#chatbot-placeholder' }
        ];

        this.showLoadingIndicator();

        try {
            const loadPromises = componentMap.map(({ name, selector }) =>
                this.loadComponent(name, selector)
            );

            await Promise.all(loadPromises);

            console.log('🎉 All components loaded successfully');
            
            await this.dependencyManager.analyzeAllProjects();
            
            await this.reusableComponents.loadComponents();

            this.hideLoadingIndicator();
            this.initializeApp();

        } catch (error) {
            console.error('❌ Error loading components:', error);
            this.hideLoadingIndicator();
        }
    }

    initializeApp() {
        // Initialize theme
        this.initializeTheme();

        // Initialize mobile navigation
        this.initializeMobileNav();

        // Initialize scroll to top
        this.initializeScrollToTop();

        // Initialize smooth scrolling
        this.initializeSmoothScrolling();

        // Initialize navbar active tracking
        this.initializeNavActiveTracking();

        // Initialize contributors
        if (typeof fetchContributors === 'function') {
            fetchContributors();
        }

        this.initializeDependencyUI();

        console.log('🚀 OpenPlayground initialized successfully');
    }


    initializeDependencyUI() {
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            this.addDependencyAnalysisButton();
        }
    }

    addDependencyAnalysisButton() {
        const analysisBtn = document.createElement('button');
        analysisBtn.id = 'dependency-analysis-btn';
        analysisBtn.innerHTML = '📊 Analyze Dependencies';
        analysisBtn.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 1000;
            background: #6366f1;
            color: white;
            border: none;
            padding: 10px 16px;
            border-radius: 8px;
            cursor: pointer;
            font-size: 14px;
            font-weight: 500;
            box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
            transition: all 0.3s ease;
        `;

        analysisBtn.addEventListener('mouseenter', () => {
            analysisBtn.style.transform = 'translateY(-2px)';
            analysisBtn.style.boxShadow = '0 6px 16px rgba(99, 102, 241, 0.4)';
        });

        analysisBtn.addEventListener('mouseleave', () => {
            analysisBtn.style.transform = 'translateY(0)';
            analysisBtn.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
        });

        analysisBtn.addEventListener('click', () => {
            this.showDependencyAnalysisModal();
        });

        document.body.appendChild(analysisBtn);
    }

    async showDependencyAnalysisModal() {
        const analysis = await this.dependencyManager.getAnalysis();
        const qualityScore = this.dependencyManager.calculateQualityScore();
        
        const modal = document.createElement('div');
        modal.id = 'dependency-analysis-modal';
        modal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0, 0, 0, 0.5);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            backdrop-filter: blur(5px);
        `;

        const modalContent = document.createElement('div');
        modalContent.style.cssText = `
            background: white;
            border-radius: 12px;
            padding: 2rem;
            max-width: 800px;
            max-height: 80vh;
            overflow-y: auto;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            width: 90%;
        `;

        modalContent.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem;">
                <h2 style="margin: 0; color: #1f2937; font-size: 1.5rem;">📊 Project Dependency Analysis</h2>
                <button id="close-analysis" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; color: #6b7280;">×</button>
            </div>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">
                <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 1.5rem; border-radius: 10px;">
                    <div style="font-size: 2rem; font-weight: bold;">${qualityScore}/100</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Code Quality Score</div>
                </div>
                <div style="background: linear-gradient(135deg, #10b981, #059669); color: white; padding: 1.5rem; border-radius: 10px;">
                    <div style="font-size: 2rem; font-weight: bold;">${analysis.components?.length || 0}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Components</div>
                </div>
                <div style="background: linear-gradient(135deg, #f59e0b, #d97706); color: white; padding: 1.5rem; border-radius: 10px;">
                    <div style="font-size: 2rem; font-weight: bold;">${analysis.dependencies?.total || 0}</div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">Dependencies</div>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">🔍 Similar Code Patterns</h3>
                <div id="similar-patterns" style="background: #f9fafb; padding: 1rem; border-radius: 8px; max-height: 200px; overflow-y: auto;"></div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">📦 Component Dependencies</h3>
                <div id="dependency-visualization" style="height: 300px; background: #f9fafb; border-radius: 8px; display: flex; align-items: center; justify-content: center;">
                    <div style="text-align: center; color: #6b7280;">
                        <div style="font-size: 3rem; margin-bottom: 0.5rem;">📊</div>
                        <div>Dependency visualization will be rendered here</div>
                    </div>
                </div>
            </div>

            <div style="margin-bottom: 2rem;">
                <h3 style="color: #374151; margin-bottom: 1rem;">♻️ Reusable Components</h3>
                <div id="reusable-components" style="background: #f9fafb; padding: 1rem; border-radius: 8px;"></div>
            </div>

            <div>
                <h3 style="color: #374151; margin-bottom: 1rem;">⚡ Recommendations</h3>
                <div id="recommendations" style="background: #f0f9ff; padding: 1rem; border-radius: 8px; border-left: 4px solid #3b82f6;"></div>
            </div>
        `;

        modal.appendChild(modalContent);
        document.body.appendChild(modal);

        await this.loadAnalysisData(modalContent);

        modalContent.querySelector('#close-analysis').addEventListener('click', () => {
            modal.style.opacity = '0';
            setTimeout(() => modal.remove(), 300);
        });

        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.opacity = '0';
                setTimeout(() => modal.remove(), 300);
            }
        });
    }

    async loadAnalysisData(modalContent) {
        const analysis = await this.dependencyManager.getAnalysis();
        
        const similarPatterns = await this.dependencyManager.findSimilarPatterns();
        const patternsContainer = modalContent.querySelector('#similar-patterns');
        patternsContainer.innerHTML = similarPatterns.length > 0 
            ? similarPatterns.map(pattern => `
                <div style="padding: 0.5rem; border-bottom: 1px solid #e5e7eb;">
                    <strong>${pattern.type}</strong>: ${pattern.description}
                </div>
            `).join('')
            : '<div style="padding: 1rem; text-align: center; color: #6b7280;">No similar patterns detected</div>';

        const reusableComps = await this.reusableComponents.getComponents();
        const reusableContainer = modalContent.querySelector('#reusable-components');
        reusableContainer.innerHTML = reusableComps.length > 0
            ? reusableComps.map(comp => `
                <div style="display: flex; justify-content: space-between; align-items: center; padding: 0.75rem; border-bottom: 1px solid #e5e7eb;">
                    <div>
                        <strong>${comp.name}</strong>
                        <div style="font-size: 0.875rem; color: #6b7280;">${comp.description}</div>
                    </div>
                    <button onclick="ComponentLoader.prototype.reusableComponents.useComponent('${comp.name}')" 
                            style="background: #6366f1; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer; font-size: 0.875rem;">
                        Use
                    </button>
                </div>
            `).join('')
            : '<div style="padding: 1rem; text-align: center; color: #6b7280;">No reusable components found</div>';

        const recommendations = await this.dependencyManager.getRecommendations();
        const recContainer = modalContent.querySelector('#recommendations');
        recContainer.innerHTML = recommendations.length > 0
            ? recommendations.map(rec => `
                <div style="padding: 0.5rem 0;">
                    <strong>${rec.type === 'optimization' ? '⚡' : '🔧'} ${rec.title}</strong>
                    <div style="font-size: 0.875rem; color: #4b5563;">${rec.description}</div>
                </div>
            `).join('')
            : '<div style="padding: 0.5rem 0; color: #6b7280;">No recommendations at this time</div>';
    }
}

class ProjectDependencyManager {
    constructor() {
        this.storageKey = 'project_dependencies';
        this.projects = [];
        this.loadFromStorage();
    }

    async addComponent(projectId, componentData) {
        let project = this.projects.find(p => p.id === projectId);
        
        if (!project) {
            project = {
                id: projectId,
                components: [],
                dependencies: new Set(),
                metrics: {
                    totalSize: 0,
                    fileCount: 0,
                    lastUpdated: Date.now()
                }
            };
            this.projects.push(project);
        }

        project.components.push({
            ...componentData,
            id: `${projectId}_${componentData.name || 'component'}`,
            timestamp: Date.now()
        });

        if (componentData.scripts) {
            componentData.scripts.forEach(dep => project.dependencies.add(dep));
        }
        if (componentData.stylesheets) {
            componentData.stylesheets.forEach(dep => project.dependencies.add(dep));
        }

        project.metrics.totalSize += componentData.size || 0;
        project.metrics.fileCount++;
        project.metrics.lastUpdated = Date.now();

        await this.saveToStorage();
    }

    async analyzeAllProjects() {
        const analysis = {
            totalProjects: this.projects.length,
            totalComponents: this.projects.reduce((sum, p) => sum + p.components.length, 0),
            totalDependencies: new Set(),
            commonDependencies: {},
            sizeAnalysis: {},
            patterns: []
        };

        this.projects.forEach(project => {
            project.dependencies.forEach(dep => analysis.totalDependencies.add(dep));
            
            project.dependencies.forEach(dep => {
                analysis.commonDependencies[dep] = (analysis.commonDependencies[dep] || 0) + 1;
            });

            analysis.sizeAnalysis[project.id] = {
                totalSize: project.metrics.totalSize,
                componentCount: project.components.length,
                avgSize: project.metrics.totalSize / project.components.length
            };
        });

        analysis.patterns = await this.findSimilarPatterns();

        return analysis;
    }

    async findSimilarPatterns() {
        const patterns = [];
        
        this.projects.forEach(project => {
            project.components.forEach(comp => {
                const html = comp.html || '';
                
                if (html.includes('<button') && html.includes('<i class') && html.includes('</i>')) {
                    patterns.push({
                        type: 'button-with-icon',
                        description: 'Button containing icon elements',
                        component: comp.id,
                        confidence: 0.8
                    });
                }
                
                if (html.includes('card') || html.includes('Card') || 
                    (html.includes('class') && html.includes('card'))) {
                    patterns.push({
                        type: 'card-component',
                        description: 'Card-like component structure',
                        component: comp.id,
                        confidence: 0.7
                    });
                }

                if (html.includes('modal') || html.includes('dialog') || 
                    html.includes('Modal') || html.includes('Dialog')) {
                    patterns.push({
                        type: 'modal-component',
                        description: 'Modal/dialog component',
                        component: comp.id,
                        confidence: 0.9
                    });
                }
            });
        });

        const groupedPatterns = {};
        patterns.forEach(pattern => {
            if (!groupedPatterns[pattern.type]) {
                groupedPatterns[pattern.type] = {
                    type: pattern.type,
                    count: 0,
                    components: [],
                    description: pattern.description
                };
            }
            groupedPatterns[pattern.type].count++;
            groupedPatterns[pattern.type].components.push(pattern.component);
        });

        return Object.values(groupedPatterns).map(p => ({
            ...p,
            frequency: p.count / this.projects.length
        }));
    }

    calculateQualityScore() {
        let score = 100;
        
        this.projects.forEach(project => {
            if (project.metrics.totalSize > 100000) { 
                score -= 10;
            }
            
            if (project.dependencies.size > 20) {
                score -= 15;
            }
            
            const daysSinceUpdate = (Date.now() - project.metrics.lastUpdated) / (1000 * 60 * 60 * 24);
            if (daysSinceUpdate < 7) {
                score += 5;
            }
            
            const hasNamedComponents = project.components.some(c => c.name && c.name.length > 0);
            if (hasNamedComponents) {
                score += 10;
            }
        });
        
        return Math.max(0, Math.min(100, Math.round(score)));
    }

    async getRecommendations() {
        const recommendations = [];
        const analysis = await this.analyzeAllProjects();
        
        if (analysis.totalDependencies.size > 30) {
            recommendations.push({
                type: 'optimization',
                title: 'Reduce Dependencies',
                description: `Consider bundling or removing some of the ${analysis.totalDependencies.size} dependencies`,
                priority: 'high'
            });
        }
        
        this.projects.forEach(project => {
            if (project.metrics.totalSize > 500000) {
                recommendations.push({
                    type: 'optimization',
                    title: 'Optimize Large Components',
                    description: `Project "${project.id}" has ${(project.metrics.totalSize / 1024).toFixed(2)}KB of components`,
                    priority: 'medium'
                });
            }
        });
        
        const patterns = await this.findSimilarPatterns();
        patterns.forEach(pattern => {
            if (pattern.count > 3 && pattern.frequency > 0.5) {
                recommendations.push({
                    type: 'reusability',
                    title: 'Create Reusable Component',
                    description: `"${pattern.type}" pattern found in ${pattern.count} components`,
                    priority: 'low'
                });
            }
        });
        
        return recommendations.sort((a, b) => {
            const priorityOrder = { high: 0, medium: 1, low: 2 };
            return priorityOrder[a.priority] - priorityOrder[b.priority];
        });
    }

    async getAnalysis() {
        return await this.analyzeAllProjects();
    }

    async saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.projects));
        } catch (error) {
            console.error('Failed to save dependencies:', error);
        }
    }

    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            if (saved) {
                this.projects = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load dependencies:', error);
        }
    }
}

class ReusableComponentLibrary {
    constructor() {
        this.components = [
            {
                id: 'button-primary',
                name: 'Primary Button',
                description: 'Styled primary action button',
                code: `<button class="btn btn-primary" style="background: #6366f1; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer; font-weight: 500; transition: all 0.3s ease;">Click me</button>`,
                category: 'buttons',
                usageCount: 0
            },
            {
                id: 'card-basic',
                name: 'Basic Card',
                description: 'Simple card container with shadow',
                code: `<div class="card" style="background: white; border-radius: 12px; padding: 1.5rem; box-shadow: 0 4px 20px rgba(0,0,0,0.1); transition: transform 0.3s ease;">
                    <h3 style="margin-top: 0;">Card Title</h3>
                    <p style="color: #666; margin-bottom: 1rem;">Card content goes here</p>
                    <button class="btn btn-secondary" style="background: #f3f4f6; color: #374151; padding: 0.5rem 1rem; border: none; border-radius: 6px; cursor: pointer;">Action</button>
                </div>`,
                category: 'containers',
                usageCount: 0
            },
            {
                id: 'modal-basic',
                name: 'Basic Modal',
                description: 'Simple modal dialog with overlay',
                code: `<div id="modal" style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); display: flex; align-items: center; justify-content: center; z-index: 1000;">
                    <div style="background: white; padding: 2rem; border-radius: 12px; max-width: 500px; width: 90%;">
                        <h2 style="margin-top: 0;">Modal Title</h2>
                        <p>Modal content goes here</p>
                        <div style="display: flex; gap: 1rem; margin-top: 2rem;">
                            <button onclick="document.getElementById('modal').style.display='none'" style="background: #ef4444; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Close</button>
                            <button style="background: #10b981; color: white; padding: 0.75rem 1.5rem; border: none; border-radius: 8px; cursor: pointer;">Confirm</button>
                        </div>
                    </div>
                </div>`,
                category: 'dialogs',
                usageCount: 0
            },
            {
                id: 'nav-basic',
                name: 'Navigation Bar',
                description: 'Basic responsive navigation',
                code: `<nav style="background: white; padding: 1rem 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; max-width: 1200px; margin: 0 auto;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #6366f1;">Logo</div>
                        <div style="display: flex; gap: 2rem;">
                            <a href="#" style="color: #374151; text-decoration: none; font-weight: 500;">Home</a>
                            <a href="#" style="color: #374151; text-decoration: none; font-weight: 500;">About</a>
                            <a href="#" style="color: #374151; text-decoration: none; font-weight: 500;">Contact</a>
                        </div>
                    </div>
                </nav>`,
                category: 'navigation',
                usageCount: 0
            }
        ];
        this.loadUsageStats();
    }

    async loadComponents() {
        try {
            const saved = localStorage.getItem('reusable_components');
            if (saved) {
                const customComponents = JSON.parse(saved);
                this.components.push(...customComponents);
            }
        } catch (error) {
            console.error('Failed to load custom components:', error);
        }
        return this.components;
    }

    async saveComponent(component) {
        try {
            const saved = localStorage.getItem('reusable_components');
            let customComponents = saved ? JSON.parse(saved) : [];
            customComponents.push(component);
            localStorage.setItem('reusable_components', JSON.stringify(customComponents));
            this.components.push(component);
            return true;
        } catch (error) {
            console.error('Failed to save component:', error);
            return false;
        }
    }

    async useComponent(componentId) {
        const component = this.components.find(c => c.id === componentId);
        if (component) {
            component.usageCount++;
            this.saveUsageStats();
            
            await navigator.clipboard.writeText(component.code);
            
            this.showNotification(`Component "${component.name}" copied to clipboard!`);
            
            return component.code;
        }
        return null;
    }

    async getComponents(category = null) {
        if (category) {
            return this.components.filter(c => c.category === category);
        }
        return this.components.sort((a, b) => b.usageCount - a.usageCount);
    }

    async findSimilarComponents(html) {
        const componentTags = {};
        this.components.forEach(comp => {
            const tags = comp.code.match(/<([a-z][a-z0-9]*)\b/gi) || [];
            componentTags[comp.id] = new Set(tags.map(t => t.toLowerCase()));
        });
        
        const inputTags = new Set((html.match(/<([a-z][a-z0-9]*)\b/gi) || []).map(t => t.toLowerCase()));
        
        const similarities = this.components.map(comp => {
            const compTags = componentTags[comp.id];
            const intersection = [...inputTags].filter(tag => compTags.has(tag)).length;
            const union = new Set([...inputTags, ...compTags]).size;
            const similarity = union > 0 ? intersection / union : 0;
            
            return {
                component: comp,
                similarity
            };
        });
        
        return similarities
            .filter(s => s.similarity > 0.3)
            .sort((a, b) => b.similarity - a.similarity);
    }

    saveUsageStats() {
        try {
            const stats = this.components.reduce((acc, comp) => {
                acc[comp.id] = comp.usageCount;
                return acc;
            }, {});
            localStorage.setItem('component_usage_stats', JSON.stringify(stats));
        } catch (error) {
            console.error('Failed to save usage stats:', error);
        }
    }

    loadUsageStats() {
        try {
            const stats = localStorage.getItem('component_usage_stats');
            if (stats) {
                const parsed = JSON.parse(stats);
                this.components.forEach(comp => {
                    if (parsed[comp.id]) {
                        comp.usageCount = parsed[comp.id];
                    }
                });
            }
        } catch (error) {
            console.error('Failed to load usage stats:', error);
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
        
        if (!document.querySelector('#notification-styles')) {
            const style = document.createElement('style');
            style.id = 'notification-styles';
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateX(100%); opacity: 0; }
                    to { transform: translateX(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateX(0); opacity: 1; }
                    to { transform: translateX(100%); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }
    }
}

class DependencyVisualizer {
    constructor(containerId) {
        this.container = document.getElementById(containerId);
        this.graphData = null;
    }

    async visualize(projectData) {
        if (!this.container) return;
        
        const visualization = document.createElement('div');
        visualization.style.cssText = `
            position: relative;
            width: 100%;
            height: 100%;
            display: flex;
            align-items: center;
            justify-content: center;
        `;
        
        projectData.forEach((project, index) => {
            const angle = (index / projectData.length) * 2 * Math.PI;
            const radius = 150;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const node = document.createElement('div');
            node.textContent = project.id;
            node.style.cssText = `
                position: absolute;
                left: calc(50% + ${x}px);
                top: calc(50% + ${y}px);
                transform: translate(-50%, -50%);
                background: #6366f1;
                color: white;
                padding: 0.5rem 1rem;
                border-radius: 20px;
                font-size: 0.875rem;
                box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
                cursor: pointer;
                transition: all 0.3s ease;
                z-index: 2;
            `;
            
            node.addEventListener('mouseenter', () => {
                node.style.transform = 'translate(-50%, -50%) scale(1.1)';
                node.style.boxShadow = '0 6px 20px rgba(99, 102, 241, 0.5)';
            });
            
            node.addEventListener('mouseleave', () => {
                node.style.transform = 'translate(-50%, -50%) scale(1)';
                node.style.boxShadow = '0 4px 12px rgba(99, 102, 241, 0.3)';
            });
            
            node.addEventListener('click', () => {
                this.showProjectDetails(project);
            });
            
            visualization.appendChild(node);
        });
        
        this.container.innerHTML = '';
        this.container.appendChild(visualization);
    }

    showProjectDetails(project) {
        const details = document.createElement('div');
        details.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 2rem;
            border-radius: 12px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            z-index: 100;
            max-width: 400px;
            width: 90%;
        `;
        
        details.innerHTML = `
            <h3 style="margin-top: 0; color: #1f2937;">${project.id}</h3>
            <div style="margin-bottom: 1rem;">
                <strong>Components:</strong> ${project.components.length}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Dependencies:</strong> ${project.dependencies.size}
            </div>
            <div style="margin-bottom: 1rem;">
                <strong>Total Size:</strong> ${(project.metrics.totalSize / 1024).toFixed(2)} KB
            </div>
            <button onclick="this.parentElement.remove()" 
                    style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 6px; cursor: pointer;">
                Close
            </button>
        `;
        
        this.container.appendChild(details);
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    const loader = new ComponentLoader();
    loader.loadAllComponents();
});

// Export for use in other scripts
window.ComponentLoader = ComponentLoader;
window.ProjectDependencyManager = ProjectDependencyManager;
window.ReusableComponentLibrary = ReusableComponentLibrary;
window.DependencyVisualizer = DependencyVisualizer;