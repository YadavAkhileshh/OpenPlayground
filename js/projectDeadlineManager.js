/**
 * @fileoverview Project Deadline and Importance Manager
 * Manages project deadlines, importance levels, and related metadata using localStorage
 */

export class ProjectDeadlineManager {
    constructor() {
        if (window.projectDeadlineManagerInstance) {
            return window.projectDeadlineManagerInstance;
        }

        this.STORAGE_KEY = 'projectDeadlines';
        this.IMPORTANCE_LEVELS = {
            low: { label: 'Low', value: 1, icon: 'ri-arrow-down-line', color: '#4CAF50' },
            medium: { label: 'Medium', value: 2, icon: 'ri-minus-line', color: '#FF9800' },
            high: { label: 'High', value: 3, icon: 'ri-arrow-up-line', color: '#FF5252' },
            critical: { label: 'Critical', value: 4, icon: 'ri-alert-line', color: '#D32F2F' }
        };

        this.deadlineData = this.loadFromStorage();
        window.projectDeadlineManagerInstance = this;
    }

    /**
     * Load deadline data from localStorage
     * @returns {Object} The deadline data object
     */
    loadFromStorage() {
        try {
            const data = localStorage.getItem(this.STORAGE_KEY);
            return data ? JSON.parse(data) : {};
        } catch (error) {
            console.error('Error loading deadline data:', error);
            return {};
        }
    }

    /**
     * Save deadline data to localStorage
     */
    saveToStorage() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.deadlineData));
        } catch (error) {
            console.error('Error saving deadline data:', error);
        }
    }

    /**
     * Set or update deadline and importance for a project
     * @param {string} projectTitle - The title of the project
     * @param {string} deadline - The deadline date (YYYY-MM-DD format)
     * @param {string} importance - The importance level (low, medium, high, critical)
     * @param {string} notes - Optional notes about the project
     */
    setProjectDeadline(projectTitle, deadline, importance, notes = '') {
        if (!this.IMPORTANCE_LEVELS[importance]) {
            console.error('Invalid importance level:', importance);
            return false;
        }

        this.deadlineData[projectTitle] = {
            deadline: deadline,
            importance: importance,
            notes: notes,
            createdAt: this.deadlineData[projectTitle]?.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        this.saveToStorage();
        return true;
    }

    /**
     * Get deadline data for a project
     * @param {string} projectTitle - The title of the project
     * @returns {Object|null} The deadline data or null if not found
     */
    getProjectDeadline(projectTitle) {
        return this.deadlineData[projectTitle] || null;
    }

    /**
     * Remove deadline for a project
     * @param {string} projectTitle - The title of the project
     */
    removeProjectDeadline(projectTitle) {
        delete this.deadlineData[projectTitle];
        this.saveToStorage();
    }

    /**
     * Check if a project has a deadline
     * @param {string} projectTitle - The title of the project
     * @returns {boolean} True if project has a deadline
     */
    hasDeadline(projectTitle) {
        return projectTitle in this.deadlineData;
    }

    /**
     * Get all projects with deadlines sorted by date
     * @returns {Array} Array of projects with their deadline data
     */
    getAllWithDeadlines() {
        return Object.entries(this.deadlineData)
            .map(([projectTitle, data]) => ({
                projectTitle,
                ...data
            }))
            .sort((a, b) => new Date(a.deadline) - new Date(b.deadline));
    }

    /**
     * Get projects by importance level
     * @param {string} importanceLevel - The importance level to filter by
     * @returns {Array} Array of projects with specified importance level
     */
    getByImportance(importanceLevel) {
        return Object.entries(this.deadlineData)
            .filter(([_, data]) => data.importance === importanceLevel)
            .map(([projectTitle, data]) => ({
                projectTitle,
                ...data
            }));
    }

    /**
     * Get projects that are overdue
     * @returns {Array} Array of overdue projects
     */
    getOverdueProjects() {
        const today = new Date().toISOString().split('T')[0];
        return Object.entries(this.deadlineData)
            .filter(([_, data]) => data.deadline < today)
            .map(([projectTitle, data]) => ({
                projectTitle,
                ...data
            }));
    }

    /**
     * Get projects due within N days
     * @param {number} days - Number of days from today
     * @returns {Array} Array of projects due soon
     */
    getUpcomingProjects(days = 7) {
        const today = new Date();
        const futureDate = new Date(today.getTime() + days * 24 * 60 * 60 * 1000);
        const todayStr = today.toISOString().split('T')[0];
        const futureDateStr = futureDate.toISOString().split('T')[0];

        return Object.entries(this.deadlineData)
            .filter(([_, data]) => {
                return data.deadline >= todayStr && data.deadline <= futureDateStr;
            })
            .map(([projectTitle, data]) => ({
                projectTitle,
                ...data
            }));
    }

    /**
     * Get the days remaining until deadline
     * @param {string} deadline - The deadline date (YYYY-MM-DD format)
     * @returns {number} Number of days remaining (negative if overdue)
     */
    getDaysUntilDeadline(deadline) {
        const deadlineDate = new Date(deadline);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const timeDiff = deadlineDate - today;
        return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    }

    /**
     * Get formatted deadline status
     * @param {string} deadline - The deadline date
     * @returns {string} Formatted status string
     */
    getDeadlineStatus(deadline) {
        const daysLeft = this.getDaysUntilDeadline(deadline);
        if (daysLeft < 0) {
            return `${Math.abs(daysLeft)} days overdue`;
        } else if (daysLeft === 0) {
            return 'Due today';
        } else if (daysLeft === 1) {
            return 'Due tomorrow';
        } else {
            return `${daysLeft} days remaining`;
        }
    }

    /**
     * Get importance level metadata
     * @param {string} level - The importance level
     * @returns {Object} The importance level metadata
     */
    getImportanceMetadata(level) {
        return this.IMPORTANCE_LEVELS[level] || null;
    }

    /**
     * Sort projects by deadline
     * @param {Array} projects - Array of project objects
     * @returns {Array} Sorted array
     */
    sortByDeadline(projects) {
        const projectsWithDeadlines = projects.filter(p => this.hasDeadline(p.title));
        const projectsWithoutDeadlines = projects.filter(p => !this.hasDeadline(p.title));

        projectsWithDeadlines.sort((a, b) => {
            const dataA = this.getProjectDeadline(a.title);
            const dataB = this.getProjectDeadline(b.title);
            return new Date(dataA.deadline) - new Date(dataB.deadline);
        });

        return [...projectsWithDeadlines, ...projectsWithoutDeadlines];
    }

    /**
     * Sort projects by importance
     * @param {Array} projects - Array of project objects
     * @returns {Array} Sorted array (critical to low)
     */
    sortByImportance(projects) {
        const projectsWithImportance = projects.filter(p => this.hasDeadline(p.title));
        const projectsWithoutImportance = projects.filter(p => !this.hasDeadline(p.title));

        projectsWithImportance.sort((a, b) => {
            const dataA = this.getProjectDeadline(a.title);
            const dataB = this.getProjectDeadline(b.title);
            const valueA = this.IMPORTANCE_LEVELS[dataA.importance]?.value || 0;
            const valueB = this.IMPORTANCE_LEVELS[dataB.importance]?.value || 0;
            return valueB - valueA;
        });

        return [...projectsWithImportance, ...projectsWithoutImportance];
    }

    /**
     * Export deadline data as JSON
     * @returns {string} JSON string of deadline data
     */
    exportData() {
        return JSON.stringify(this.deadlineData, null, 2);
    }

    /**
     * Import deadline data from JSON
     * @param {string} jsonData - JSON string to import
     * @returns {boolean} True if import successful
     */
    importData(jsonData) {
        try {
            const data = JSON.parse(jsonData);
            this.deadlineData = { ...this.deadlineData, ...data };
            this.saveToStorage();
            return true;
        } catch (error) {
            console.error('Error importing deadline data:', error);
            return false;
        }
    }

    /**
     * Clear all deadline data
     */
    clearAllData() {
        this.deadlineData = {};
        this.saveToStorage();
    }
}

// Create singleton instance
export const deadlineManager = new ProjectDeadlineManager();
