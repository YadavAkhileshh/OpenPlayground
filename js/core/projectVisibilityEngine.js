/**
 * ProjectVisibilityEngine
 * -----------------------
 * Centralized state engine responsible for determining
 * project visibility across search, filters, pagination,
 * collections, and future discovery features.
 *
 * Acts as a single source of truth.
 * No DOM access. No UI logic.
 */

export class ProjectVisibilityEngine {
    constructor(projects = []) {
        this.projects = projects;

        this.state = {
            searchQuery: "",
            categories: new Set(["all"]),
            collection: null, // null = all, or collection id
            page: 1,
            itemsPerPage: 10,
        };
    }

    /* ------------------
     * State setters
     * ------------------ */

    setSearchQuery(query) {
        this.state.searchQuery = query.toLowerCase();
        this.state.page = 1;
    }

    toggleCategory(category) {
        const cat = category.toLowerCase();
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

    setCollection(collectionId) {
        this.state.collection = collectionId;
        this.state.page = 1;
    }

    setPage(page) {
        this.state.page = page;
    }

    reset() {
        this.state.searchQuery = "";
        this.state.categories = new Set(["all"]);
        this.state.collection = null;
        this.state.page = 1;
    }

    /* ------------------
     * Derived state
     * ------------------ */

    getVisibleProjects() {
        let filtered = this.projects;

        // Filter by collection if set
        if (this.state.collection && window.bookmarksManager) {
            const collectionProjects = window.bookmarksManager.getCollectionProjects(this.state.collection);
            const collectionTitles = new Set(collectionProjects.map(p => p.title.toLowerCase()));
            filtered = filtered.filter(project => 
                collectionTitles.has(project.title.toLowerCase())
            );
        }

        // Filter by search and category
        return filtered.filter(project => {
            const matchesSearch =
                project.title.toLowerCase().includes(this.state.searchQuery);

            const projectCat = project.category ? project.category.toLowerCase() : "";
            const matchesCategory =
                this.state.categories.has("all") ||
                this.state.categories.has(projectCat);

            return matchesSearch && matchesCategory;
        });
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
     * URL State helpers
     * ------------------ */

    toURLParams() {
        const params = new URLSearchParams();

        if (this.state.searchQuery) {
            params.set('search', this.state.searchQuery);
        }

        const cats = Array.from(this.state.categories);
        if (cats.length > 0 && !cats.includes('all')) {
            params.set('cats', cats.join(','));
        }

        if (this.state.collection) {
            params.set('collection', this.state.collection);
        }

        if (this.state.page > 1) {
            params.set('page', this.state.page.toString());
        }

        return params;
    }

    fromURLParams(params) {
        const search = params.get('search');
        if (search) {
            this.state.searchQuery = search.toLowerCase();
        }

        const cats = params.get('cats');
        if (cats) {
            this.state.categories.clear();
            cats.split(',').forEach(c => this.state.categories.add(c.toLowerCase()));
        }

        const collection = params.get('collection');
        if (collection) {
            this.state.collection = collection;
        }

        const page = parseInt(params.get('page'));
        if (page && !isNaN(page)) {
            this.state.page = page;
        }
    }
}
