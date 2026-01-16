// ===============================
// OpenPlayground - Dashboard
// ===============================

import {
    doc,
    getDoc,
    setDoc,
    updateDoc,
    arrayUnion,
    arrayRemove
} from 'https://www.gstatic.com/firebasejs/9.22.0/firebase-firestore.js';

class DashboardManager {
    constructor() {
        this.currentUser = null;
        this.savedProjects = [];
        this.completedProjects = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.setupAuthListener();
    }

    setupEventListeners() {
        // Modal controls
        const dashboardLink = document.getElementById('dashboardLink');
        const dashboardModalClose = document.getElementById('dashboardModalClose');

        // Tab switching
        const dashboardTabs = document.querySelectorAll('.dashboard-tab');

        dashboardLink?.addEventListener('click', (e) => {
            e.preventDefault();
            this.showDashboard();
        });

        dashboardModalClose?.addEventListener('click', () => this.hideDashboard());

        dashboardTabs.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab.dataset.tab));
        });

        // Close modal on outside click
        document.getElementById('dashboardModal')?.addEventListener('click', (e) => {
            if (e.target.id === 'dashboardModal') {
                this.hideDashboard();
            }
        });

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && document.getElementById('dashboardModal').style.display !== 'none') {
                this.hideDashboard();
            }
        });
    }

    setupAuthListener() {
        document.addEventListener('authStateChanged', (e) => {
            this.currentUser = e.detail.user;
            if (this.currentUser) {
                this.loadUserData();
            } else {
                this.clearUserData();
            }
        });
    }

    async loadUserData() {
        if (!this.currentUser) return;

        try {
            const userDocRef = doc(window.db, 'users', this.currentUser.uid);
            const userDoc = await getDoc(userDocRef);

            if (userDoc.exists()) {
                const data = userDoc.data();
                this.savedProjects = data.savedProjects || [];
                this.completedProjects = data.completedProjects || [];
            } else {
                // Initialize user document
                await setDoc(userDocRef, {
                    savedProjects: [],
                    completedProjects: [],
                    createdAt: new Date()
                });
                this.savedProjects = [];
                this.completedProjects = [];
            }

            this.updateProjectActions();
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    }

    clearUserData() {
        this.savedProjects = [];
        this.completedProjects = [];
        this.updateProjectActions();
    }

    async saveProject(projectId) {
        if (!this.currentUser) {
            window.AuthManager.showAuthModal('login');
            return;
        }

        try {
            const userDocRef = doc(window.db, 'users', this.currentUser.uid);

            if (this.savedProjects.includes(projectId)) {
                // Remove from saved
                await updateDoc(userDocRef, {
                    savedProjects: arrayRemove(projectId)
                });
                this.savedProjects = this.savedProjects.filter(id => id !== projectId);
            } else {
                // Add to saved
                await updateDoc(userDocRef, {
                    savedProjects: arrayUnion(projectId)
                });
                this.savedProjects.push(projectId);
            }

            this.updateProjectActions();
        } catch (error) {
            console.error('Error saving project:', error);
        }
    }

    async completeProject(projectId) {
        if (!this.currentUser) {
            window.AuthManager.showAuthModal('login');
            return;
        }

        try {
            const userDocRef = doc(window.db, 'users', this.currentUser.uid);

            if (this.completedProjects.includes(projectId)) {
                // Remove from completed
                await updateDoc(userDocRef, {
                    completedProjects: arrayRemove(projectId)
                });
                this.completedProjects = this.completedProjects.filter(id => id !== projectId);
            } else {
                // Add to completed
                await updateDoc(userDocRef, {
                    completedProjects: arrayUnion(projectId)
                });
                this.completedProjects.push(projectId);
            }

            this.updateProjectActions();
        } catch (error) {
            console.error('Error completing project:', error);
        }
    }

    updateProjectActions() {
        // Update all project cards with current save/complete status
        document.querySelectorAll('.card').forEach(card => {
            const projectId = card.dataset.projectId;
            if (!projectId) return;

            const saveBtn = card.querySelector('.save-btn');
            const completeBtn = card.querySelector('.complete-btn');

            if (saveBtn) {
                const isSaved = this.savedProjects.includes(projectId);
                saveBtn.classList.toggle('active', isSaved);
                saveBtn.innerHTML = `<i class="ri-${isSaved ? 'bookmark-fill' : 'bookmark-line'}"></i> ${isSaved ? 'Saved' : 'Save'}`;
            }

            if (completeBtn) {
                const isCompleted = this.completedProjects.includes(projectId);
                completeBtn.classList.toggle('active', isCompleted);
                completeBtn.innerHTML = `<i class="ri-${isCompleted ? 'check-circle-fill' : 'check-line'}"></i> ${isCompleted ? 'Completed' : 'Completed'}`;
            }
        });
    }

    showDashboard() {
        if (!this.currentUser) {
            window.AuthManager.showAuthModal('login');
            return;
        }

        const modal = document.getElementById('dashboardModal');
        modal.style.display = 'flex';

        this.renderDashboard();
    }

    hideDashboard() {
        document.getElementById('dashboardModal').style.display = 'none';
    }

    switchTab(tabName) {
        // Update tab buttons
        document.querySelectorAll('.dashboard-tab').forEach(tab => {
            tab.classList.toggle('active', tab.dataset.tab === tabName);
        });

        // Update content
        document.querySelectorAll('.dashboard-projects').forEach(content => {
            content.style.display = content.id === `${tabName}Projects` ? 'block' : 'none';
        });
    }

    renderDashboard() {
        this.renderSavedProjects();
        this.renderCompletedProjects();
    }

    renderSavedProjects() {
        const container = document.getElementById('savedProjects');

        if (this.savedProjects.length === 0) {
            container.innerHTML = `
                <div class="dashboard-empty">
                    <i class="ri-bookmark-line"></i>
                    <p>No saved projects yet</p>
                    <small>Click the bookmark icon on any project to save it here</small>
                </div>
            `;
            return;
        }

        // Get project data from projects.json (you'll need to load this)
        this.getProjectsData().then(projects => {
            const savedProjectCards = this.savedProjects
                .map(projectId => projects.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === projectId))
                .filter(Boolean)
                .map(project => this.createDashboardProjectCard(project, 'saved'));

            container.innerHTML = savedProjectCards.join('');
        });
    }

    renderCompletedProjects() {
        const container = document.getElementById('completedProjects');

        if (this.completedProjects.length === 0) {
            container.innerHTML = `
                <div class="dashboard-empty">
                    <i class="ri-check-circle-line"></i>
                    <p>No completed projects yet</p>
                    <small>Mark projects as completed to track your progress</small>
                </div>
            `;
            return;
        }

        // Get project data from projects.json
        this.getProjectsData().then(projects => {
            const completedProjectCards = this.completedProjects
                .map(projectId => projects.find(p => p.title.toLowerCase().replace(/\s+/g, '-') === projectId))
                .filter(Boolean)
                .map(project => this.createDashboardProjectCard(project, 'completed'));

            container.innerHTML = completedProjectCards.join('');
        });
    }

    createDashboardProjectCard(project, type) {
        const projectId = project.title.toLowerCase().replace(/\s+/g, '-');
        return `
            <div class="dashboard-project-card" data-project-id="${projectId}">
                <div class="dashboard-project-info">
                    <h4>${project.title}</h4>
                    <p>${project.description}</p>
                    <div class="dashboard-project-meta">
                        <span class="category-tag">${project.category}</span>
                        <span class="difficulty-tag">${project.difficulty || 'Intermediate'}</span>
                    </div>
                </div>
                <div class="dashboard-project-actions">
                    <a href="${project.link}" target="_blank" class="dashboard-btn primary">
                        <i class="ri-external-link-line"></i> View Project
                    </a>
                    <button class="dashboard-btn secondary remove-btn" data-project="${projectId}" data-type="${type}">
                        <i class="ri-close-line"></i> Remove
                    </button>
                </div>
            </div>
        `;
    }

    async getProjectsData() {
        // Load projects data - you might want to cache this
        if (!this.projectsData) {
            try {
                const response = await fetch('./projects.json');
                this.projectsData = await response.json();
            } catch (error) {
                console.error('Error loading projects data:', error);
                return [];
            }
        }
        return this.projectsData;
    }
}

// Initialize dashboard manager
const dashboardManager = new DashboardManager();

// Export for global access
window.DashboardManager = dashboardManager;
