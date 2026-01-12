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
        this.state.category = category.toLowerCase();
        this.state.page = 1;
    }

    setPage(page) {
        this.state.page = page;
    }

    reset() {
        this.state.searchQuery = "";
        this.state.category = "all";
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
                this.state.category === "all" ||
                projectCat === this.state.category;

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
