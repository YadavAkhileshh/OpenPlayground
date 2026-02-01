/**
 * ProjectVisibilityEngine
 * -----------------------
 * Centralized state engine responsible for determining
 * project visibility across search, filters, pagination,
 * sorting, and discovery features.
 *
 * Acts as a single source of truth.
 * No DOM access. No UI logic.
 * 
 * Feature #1291: Added trending sort support with analytics integration
 */

export class ProjectVisibilityEngine {
    constructor(projects = []) {
        this.projects = projects;

        this.state = {
            searchQuery: "",
            categories: new Set(["all"]),
            collection: null,
            page: 1,
            itemsPerPage: 10,
            sortMode: "default"
        };

        // Reference to analytics engine (injected later)
        this.analyticsEngine = null;
    }

    /* ------------------
     * Analytics Integration
     * ------------------ */

    setAnalyticsEngine(engine) {
        this.analyticsEngine = engine;
    }

    /* ------------------
     * State setters
     * ------------------ */

    setSearchQuery(query) {
        this.state.searchQuery = query.toLowerCase();
        this.state.page = 1;
    }

    toggleCategory(category) {
        const cat = this.normalizeCategory(category);
        if (cat === "all") {
            this.state.categories.clear();
            this.state.categories.add("all");
        } else {
            this.state.categories.delete("all");
            if (this.state.categories.has(cat)) {
                this.state.categories.delete(cat);
            } else {
                this.state.categories.add(cat);
            }
            if (this.state.categories.size === 0) {
                this.state.categories.add("all");
            }
        }
        this.state.page = 1;
    }

    normalizeCategory(cat) {
        if (!cat) return "other";
        const normalized = cat.trim().toLowerCase().replace(/\s+/g, '_');
        const pluralMap = {
            'games': 'game',
            'puzzles': 'puzzle',
            'utilities': 'utility'
        };
        return pluralMap[normalized] || normalized;
    }

    setCollection(collectionId) {
        this.state.collection = collectionId;
        this.state.page = 1;
    }

    setPage(page) {
        this.state.page = page;
    }

    setSortMode(mode) {
        this.state.sortMode = mode;
        this.state.page = 1;
    }

    reset() {
        this.state.searchQuery = "";
        this.state.categories = new Set(["all"]);
        this.state.collection = null;
        this.state.page = 1;
        this.state.sortMode = "default";
    }

    /* ------------------
     * Derived state
     * ------------------ */

    getVisibleProjects() {
        let filtered = this.projects.filter(project => {
            const matchesSearch =
                project.title.toLowerCase().includes(this.state.searchQuery);

            const projectCat = this.normalizeCategory(project.category);
            const matchesCategory =
                this.state.categories.has("all") ||
                this.state.categories.has(projectCat);

            return matchesSearch && matchesCategory;
        });

        // Apply sorting
        filtered = this.applySorting(filtered);

        return filtered;
    }

    /**
     * Apply sorting based on current sort mode
     */
    applySorting(projects) {
        const sorted = [...projects];

        switch (this.state.sortMode) {
            case 'az':
                sorted.sort((a, b) => a.title.localeCompare(b.title));
                break;

            case 'za':
                sorted.sort((a, b) => b.title.localeCompare(a.title));
                break;

            case 'newest':
                sorted.sort((a, b) => {
                    const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
                    const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
                    return dateB - dateA;
                });
                break;

            case 'trending':
                if (this.analyticsEngine) {
                    sorted.sort((a, b) => {
                        const projectIdA = a.folder || a.name || a.title;
                        const projectIdB = b.folder || b.name || b.title;
                        const scoreA = this.analyticsEngine.calculatePopularityScore(projectIdA);
                        const scoreB = this.analyticsEngine.calculatePopularityScore(projectIdB);
                        return scoreB - scoreA;
                    });
                }
                break;

            case 'rating-high':
                sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
                break;

            case 'rating-low':
                sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
                break;

            case 'default':
            default:
                break;
        }

        return sorted;
    }

    /**
     * Get projects with analytics badges attached
     */
    getProjectsWithBadges() {
        const projects = this.getVisibleProjects();

        if (!this.analyticsEngine) {
            return projects.map(p => ({ ...p, badge: null }));
        }

        return projects.map(project => {
            const projectId = project.folder || project.name || project.title;
            const badge = this.analyticsEngine.getProjectBadge(projectId);
            return { ...project, badge };
        });
    }

    /**
     * Get trending projects only
     */
    getTrendingProjects(limit = 10) {
        if (!this.analyticsEngine) {
            return [];
        }

        const trending = this.analyticsEngine.getTrendingProjects(limit);
        return trending.map(t => {
            const project = this.projects.find(p =>
                (p.folder || p.name || p.title) === t.projectId
            );
            return project ? { ...project, trendingScore: t.score } : null;
        }).filter(Boolean);
    }

    /**
     * Get hidden gem projects
     */
    getHiddenGems(limit = 5) {
        if (!this.analyticsEngine) {
            return [];
        }

        const gems = this.analyticsEngine.getHiddenGems(limit);
        return gems.map(g => {
            const project = this.projects.find(p =>
                (p.folder || p.name || p.title) === g.projectId
            );
            return project ? { ...project, gemScore: g.score } : null;
        }).filter(Boolean);
    }

    getPaginatedProjects() {
        const filtered = this.getVisibleProjects();
        const start =
            (this.state.page - 1) * this.state.itemsPerPage;
        const end = start + this.state.itemsPerPage;

        return filtered.slice(start, end);
    }

    getTotalPages() {
        return Math.ceil(
            this.getVisibleProjects().length / this.state.itemsPerPage
        );
    }

    isEmpty() {
        return this.getVisibleProjects().length === 0;
    }

    /* ------------------
     * URL helpers
     * ------------------ */

    getStateFromURL() {
        const params = new URLSearchParams(window.location.search);
        return {
            categories: params.get('cats') ? params.get('cats').split(',') : ['all'],
            search: params.get('search') || '',
            sort: params.get('sort') || 'default',
            page: parseInt(params.get('page')) || 1,
            collection: params.get('collection') || null
        };
    }

    updateURL(viewMode = 'card') {
        const params = new URLSearchParams();

        if (!this.state.categories.has('all')) {
            params.set('cats', Array.from(this.state.categories).join(','));
        }
        if (this.state.searchQuery) {
            params.set('search', this.state.searchQuery);
        }
        if (this.state.sortMode !== 'default') {
            params.set('sort', this.state.sortMode);
        }
        if (this.state.page > 1) {
            params.set('page', this.state.page);
        }
        if (viewMode !== 'card') {
            params.set('view', viewMode);
        }

        const newURL = params.toString()
            ? `${window.location.pathname}?${params.toString()}`
            : window.location.pathname;

        window.history.replaceState({ path: newURL }, '', newURL);
    }
}

