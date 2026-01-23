/**
 * ProjectVisibilityEngine
 * -----------------------
 * Centralized state engine responsible for determining
 * project visibility across search, filters, pagination,
 * and future discovery features.
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

    setPage(page) {
        this.state.page = page;
    }

    reset() {
        this.state.searchQuery = "";
        this.state.categories = new Set(["all"]);
        this.state.page = 1;
    }

    /* ------------------
     * Derived state
     * ------------------ */

    getVisibleProjects() {
        return this.projects.filter(project => {
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
}
