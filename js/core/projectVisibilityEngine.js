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
            tech: "all",
            difficulty: "all",
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

    setTech(tech) {
        this.state.tech = tech.toLowerCase();
        this.state.page = 1;
    }

    setDifficulty(difficulty) {
        this.state.difficulty = difficulty.toLowerCase();
        this.state.page = 1;
    }

    setPage(page) {
        this.state.page = page;
    }

    reset() {
        this.state.searchQuery = "";
        this.state.category = "all";
        this.state.tech = "all";
        this.state.difficulty = "all";
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

            const projectTech = project.tech ? project.tech.map(t => t.toLowerCase()) : [];
            const matchesTech =
                this.state.tech === "all" ||
                projectTech.includes(this.state.tech);

            const projectDifficulty = project.difficulty ? project.difficulty.toLowerCase() : "";
            const matchesDifficulty =
                this.state.difficulty === "all" ||
                projectDifficulty === this.state.difficulty;

            return matchesSearch && matchesCategory && matchesTech && matchesDifficulty;
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
