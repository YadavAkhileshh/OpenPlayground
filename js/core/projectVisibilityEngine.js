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
            category: "all",
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

    setCategory(category) {
        this.state.category = category;
        this.state.page = 1;
    }

    setPage(page) {
        this.state.page = page;
    }

    /* ------------------
     * Derived state
     * ------------------ */

    getFilteredProjects() {
        return this.projects.filter(project => {
            const matchesSearch =
                project.title.toLowerCase().includes(this.state.searchQuery);

            const matchesCategory =
                this.state.category === "all" ||
                project.category === this.state.category;

            return matchesSearch && matchesCategory;
        });
    }

    getPaginatedProjects() {
        const filtered = this.getFilteredProjects();
        const start =
            (this.state.page - 1) * this.state.itemsPerPage;
        const end = start + this.state.itemsPerPage;

        return filtered.slice(start, end);
    }

    getTotalPages() {
        return Math.ceil(
            this.getFilteredProjects().length / this.state.itemsPerPage
        );
    }

    isEmpty() {
        return this.getFilteredProjects().length === 0;
    }
}
