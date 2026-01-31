/**
 * @fileoverview Deadline UI Module
 * Handles the UI for setting deadlines and importance on projects
 */

import { deadlineManager } from './projectDeadlineManager.js';

export class DeadlineUI {
    constructor() {
        if (window.deadlineUIInstance) {
            return window.deadlineUIInstance;
        }

        this.currentProjectTitle = null;
        this.modalElement = null;
        window.deadlineUIInstance = this;
    }

    /**
     * Initialize the deadline UI
     */
    init() {
        this.createModalHTML();
        this.setupGlobalFunctions();
    }

    /**
     * Create the modal HTML
     */
    createModalHTML() {
        const placeholder = document.getElementById('deadline-modal-placeholder');
        if (!placeholder) return;

        const modalHTML = `
            <div id="deadline-modal-overlay" class="deadline-modal-overlay" style="display: none;">
                <div class="deadline-modal">
                    <div class="deadline-modal-header">
                        <h2 id="deadline-modal-title">Set Project Deadline</h2>
                        <button class="deadline-modal-close" onclick="window.closeDeadlineModal();">
                            <i class="ri-close-line"></i>
                        </button>
                    </div>

                    <div id="current-deadline-display"></div>

                    <form id="deadline-form">
                        <div class="form-group">
                            <label for="deadline-date">Deadline Date <span style="color: #ff9800;">*</span></label>
                            <input type="date" id="deadline-date" name="deadline-date" required>
                        </div>

                        <div class="form-group">
                            <label>Importance Level <span style="color: #ff9800;">*</span></label>
                            <div class="importance-selector">
                                <label class="importance-option" data-importance="low">
                                    <input type="radio" name="importance" value="low" required>
                                    <div class="importance-option-icon" style="color: #4CAF50;">
                                        <i class="ri-arrow-down-line"></i>
                                    </div>
                                    <span class="importance-option-label">Low</span>
                                </label>
                                <label class="importance-option" data-importance="medium">
                                    <input type="radio" name="importance" value="medium">
                                    <div class="importance-option-icon" style="color: #FF9800;">
                                        <i class="ri-minus-line"></i>
                                    </div>
                                    <span class="importance-option-label">Medium</span>
                                </label>
                                <label class="importance-option" data-importance="high">
                                    <input type="radio" name="importance" value="high">
                                    <div class="importance-option-icon" style="color: #FF5252;">
                                        <i class="ri-arrow-up-line"></i>
                                    </div>
                                    <span class="importance-option-label">High</span>
                                </label>
                                <label class="importance-option" data-importance="critical">
                                    <input type="radio" name="importance" value="critical">
                                    <div class="importance-option-icon" style="color: #D32F2F;">
                                        <i class="ri-alert-line"></i>
                                    </div>
                                    <span class="importance-option-label">Critical</span>
                                </label>
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="deadline-notes">Notes (Optional)</label>
                            <textarea id="deadline-notes" name="deadline-notes" placeholder="Add any notes about this project..."></textarea>
                        </div>

                        <div class="deadline-info-box">
                            <strong>📋 Tip:</strong> Set realistic deadlines to stay organized. You can update or remove deadlines anytime.
                        </div>

                        <div class="deadline-modal-actions">
                            <button type="submit" class="btn-save">
                                <i class="ri-save-line"></i> Save Deadline
                            </button>
                            <button type="button" class="btn-cancel" onclick="window.closeDeadlineModal();">
                                <i class="ri-close-line"></i> Cancel
                            </button>
                            <button type="button" class="btn-delete" id="btn-delete-deadline" onclick="window.deleteProjectDeadline();" style="display: none;">
                                <i class="ri-delete-bin-line"></i> Remove
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        placeholder.innerHTML = modalHTML;
        this.modalElement = document.getElementById('deadline-modal-overlay');
        this.setupEventListeners();
    }

    /**
     * Setup event listeners
     */
    setupEventListeners() {
        const form = document.getElementById('deadline-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleFormSubmit(e));
        }

        // Handle importance option clicks
        document.querySelectorAll('.importance-option').forEach(option => {
            option.addEventListener('click', () => {
                document.querySelectorAll('.importance-option').forEach(o => o.classList.remove('selected'));
                option.classList.add('selected');
                const radio = option.querySelector('input[type="radio"]');
                if (radio) radio.checked = true;
            });
        });

        // Close modal when clicking outside
        if (this.modalElement) {
            this.modalElement.addEventListener('click', (e) => {
                if (e.target === this.modalElement) {
                    window.closeDeadlineModal();
                }
            });
        }
    }

    /**
     * Handle form submission
     */
    handleFormSubmit(e) {
        e.preventDefault();

        const deadline = document.getElementById('deadline-date').value;
        const importance = document.querySelector('input[name="importance"]:checked')?.value;
        const notes = document.getElementById('deadline-notes').value;

        if (!deadline || !importance) {
            alert('Please fill in all required fields');
            return;
        }

        const saved = deadlineManager.setProjectDeadline(this.currentProjectTitle, deadline, importance, notes);

        if (saved) {
            this.showNotification('Deadline saved successfully!');
            // Trigger a custom event for app.js to listen to
            window.dispatchEvent(new CustomEvent('deadlineUpdated', {
                detail: { projectTitle: this.currentProjectTitle }
            }));
            setTimeout(() => window.closeDeadlineModal(), 500);
        }
    }

    /**
     * Show notification
     */
    showNotification(message) {
        const notification = document.createElement('div');
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 16px 24px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
            z-index: 10001;
            animation: slideInDown 0.3s ease;
            font-weight: 500;
        `;
        notification.textContent = message;
        document.body.appendChild(notification);

        setTimeout(() => {
            notification.style.animation = 'slideUp 0.3s ease forwards';
            setTimeout(() => notification.remove(), 300);
        }, 2000);
    }

    /**
     * Open the deadline modal for a project
     */
    openModal(projectTitle) {
        this.currentProjectTitle = projectTitle;

        const form = document.getElementById('deadline-form');
        const dateInput = document.getElementById('deadline-date');
        const notesInput = document.getElementById('deadline-notes');
        const deleteBtn = document.getElementById('btn-delete-deadline');
        const titleElement = document.getElementById('deadline-modal-title');
        const currentDeadlineDisplay = document.getElementById('current-deadline-display');

        // Update title
        titleElement.textContent = `Set Deadline: ${projectTitle}`;

        // Reset form
        form.reset();
        document.querySelectorAll('.importance-option').forEach(o => o.classList.remove('selected'));

        // Check if project already has a deadline
        const existingDeadline = deadlineManager.getProjectDeadline(projectTitle);

        if (existingDeadline) {
            dateInput.value = existingDeadline.deadline;
            const importanceOption = document.querySelector(`.importance-option[data-importance="${existingDeadline.importance}"]`);
            if (importanceOption) {
                importanceOption.classList.add('selected');
                importanceOption.querySelector('input').checked = true;
            }
            notesInput.value = existingDeadline.notes || '';
            deleteBtn.style.display = 'block';

            // Show current deadline info
            const importance = deadlineManager.getImportanceMetadata(existingDeadline.importance);
            const daysLeft = deadlineManager.getDaysUntilDeadline(existingDeadline.deadline);
            const statusText = deadlineManager.getDeadlineStatus(existingDeadline.deadline);

            currentDeadlineDisplay.innerHTML = `
                <div class="current-deadline">
                    <div class="current-deadline-title">📌 Current Deadline</div>
                    <div class="current-deadline-details">
                        <span><i class="ri-calendar-line"></i> ${existingDeadline.deadline}</span>
                        <span><i style="background-color: ${importance.color}; padding: 2px 6px; border-radius: 3px; color: white; display: inline-block; width: auto; height: auto;">●</i> ${importance.label}</span>
                        <span><i class="ri-time-line"></i> ${statusText}</span>
                        ${existingDeadline.notes ? `<span><i class="ri-file-text-line"></i> ${existingDeadline.notes}</span>` : ''}
                    </div>
                </div>
            `;
        } else {
            deleteBtn.style.display = 'none';
            currentDeadlineDisplay.innerHTML = '';

            // Set today as default date
            const today = new Date().toISOString().split('T')[0];
            dateInput.value = today;
            const mediumOption = document.querySelector('.importance-option[data-importance="medium"]');
            if (mediumOption) {
                mediumOption.classList.add('selected');
                mediumOption.querySelector('input').checked = true;
            }
        }

        // Show modal
        if (this.modalElement) {
            this.modalElement.style.display = 'flex';
            document.body.style.overflow = 'hidden';
        }
    }

    /**
     * Close the deadline modal
     */
    closeModal() {
        if (this.modalElement) {
            this.modalElement.style.display = 'none';
            document.body.style.overflow = '';
        }
        this.currentProjectTitle = null;
    }

    /**
     * Delete project deadline
     */
    deleteDeadline() {
        if (!this.currentProjectTitle) return;

        if (confirm('Are you sure you want to remove this deadline?')) {
            deadlineManager.removeProjectDeadline(this.currentProjectTitle);
            this.showNotification('Deadline removed successfully!');
            // Trigger custom event
            window.dispatchEvent(new CustomEvent('deadlineUpdated', {
                detail: { projectTitle: this.currentProjectTitle }
            }));
            setTimeout(() => this.closeModal(), 500);
        }
    }

    /**
     * Setup global functions
     */
    setupGlobalFunctions() {
        window.openDeadlineModal = (projectTitle) => this.openModal(projectTitle);
        window.closeDeadlineModal = () => this.closeModal();
        window.deleteProjectDeadline = () => this.deleteDeadline();
    }
}

// Create and initialize singleton instance
export const deadlineUI = new DeadlineUI();
