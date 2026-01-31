/**
 * @fileoverview Card Renderer Module
 * Responsible for generating HTML markup for project cards and list items.
 */

import { deadlineManager } from './projectDeadlineManager.js';

/**
 * Escapes HTML characters to prevent XSS.
 * @param {string} str - The string to escape.
 * @returns {string} The escaped string.
 */
function escapeHtml(str) {
    if (!str) return '';
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

/**
 * Capitalizes the first letter of a string.
 * @param {string} str - The string to capitalize.
 * @returns {string} The capitalized string.
 */
function capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Generates the source code URL for a project.
 * @param {string} link - The relative link to the project.
 * @returns {string} The absolute GitHub URL.
 */
function getSourceCodeUrl(link) {
    if (!link) return 'https://github.com/YadavAkhileshh/OpenPlayground';

    let path = link;
    // Remove leading ./
    if (path.startsWith('./')) {
        path = path.slice(2);
    }
    // Remove trailing /index.html or index.html
    path = path.replace(/\/index\.html$/, '').replace(/^index\.html$/, '');

    return `https://github.com/YadavAkhileshh/OpenPlayground/tree/main/${path}`;
}

/**
 * Generates deadline indicator HTML if project has a deadline
 * @param {string} projectTitle - The title of the project
 * @returns {string} HTML string for deadline indicator or empty string
 */
function getDeadlineIndicator(projectTitle) {
    const deadline = deadlineManager.getProjectDeadline(projectTitle);
    if (!deadline) return '';

    const importance = deadlineManager.getImportanceMetadata(deadline.importance);
    const daysLeft = deadlineManager.getDaysUntilDeadline(deadline.deadline);
    const statusText = deadlineManager.getDeadlineStatus(deadline.deadline);
    
    let statusClass = 'deadline-normal';
    if (daysLeft < 0) statusClass = 'deadline-overdue';
    else if (daysLeft <= 3) statusClass = 'deadline-urgent';
    else if (daysLeft <= 7) statusClass = 'deadline-soon';

    return `
        <div class="deadline-badge ${statusClass}">
            <div class="deadline-importance" style="background-color: ${importance.color};" title="Importance: ${importance.label}">
                <i class="${importance.icon}"></i>
            </div>
            <div class="deadline-info">
                <span class="deadline-date">${deadline.deadline}</span>
                <span class="deadline-status">${statusText}</span>
            </div>
        </div>
    `;
}

/**
 * Generates HTML for a project card.
 * @param {Object} project - The project data object.
 * @returns {string} The HTML string for the project card.
 */
export function createProjectCard(project) {
    const isBookmarked = window.bookmarksManager?.isBookmarked(project.title);
    const techHtml = project.tech?.map(t => `<span>${escapeHtml(t)}</span>`).join('') || '';
    const coverStyle = project.coverStyle || '';
    const coverClass = project.coverClass || '';
    const sourceUrl = getSourceCodeUrl(project.link);
    const deadlineIndicator = getDeadlineIndicator(project.title);

    // Create project data for tracking
    const projectDataStr = JSON.stringify({
        title: project.title,
        link: project.link,
        category: project.category,
        description: project.description || ''
    }).replace(/'/g, "\\'");

    // Note: We're using onclick handlers here to maintain compatibility with existing global functions
    // but ideally these should be event listeners attached after rendering.
    // Keeping it simple for this refactor to match existing pattern.

    // Create project data for Try It button
    const projectData = JSON.stringify({
        title: project.title,
        link: project.link,
        description: project.description || '',
        category: project.category
    }).replace(/'/g, "\\'");

    return `
        <div class="card" data-category="${escapeHtml(project.category)}" onclick="window.trackProjectView && window.trackProjectView(${projectDataStr.replace(/"/g, '&quot;')}); window.location.href='${escapeHtml(project.link)}'; event.stopPropagation();">
            <div class="card-actions">
                <button class="try-it-btn" 
                        onclick="event.preventDefault(); event.stopPropagation(); window.openCodePlayground && window.openCodePlayground(${projectData.replace(/"/g, '&quot;')});"
                        title="Try this project in Code Playground">
                    <i class="ri-play-circle-line"></i> Try It
                </button>
                <button class="bookmark-btn ${isBookmarked ? 'bookmarked' : ''}" 
                        data-project-title="${escapeHtml(project.title)}" 
                        onclick="event.preventDefault(); event.stopPropagation(); window.toggleProjectBookmark(this, '${escapeHtml(project.title)}', '${escapeHtml(project.link)}', '${escapeHtml(project.category)}', '${escapeHtml(project.description || '')}');"
                        title="${isBookmarked ? 'Remove from bookmarks' : 'Add to bookmarks'}">
                    <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                </button>
                <button class="deadline-btn" 
                        onclick="event.preventDefault(); event.stopPropagation(); window.openDeadlineModal('${escapeHtml(project.title)}');"
                        title="Set deadline and importance">
                    <i class="ri-calendar-line"></i>
                </button>
                <a href="${sourceUrl}" target="_blank" class="source-btn" 
                   onclick="event.stopPropagation();" 
                   title="View Source Code">
                    <i class="ri-github-fill"></i>
                </a>
            </div>
            ${deadlineIndicator}
            <div class="card-link">
                <div class="card-cover ${coverClass}" style="${coverStyle}">
                    <i class="${escapeHtml(project.icon || 'ri-code-s-slash-line')}"></i>
                </div>
                <div class="card-content">
                    <div class="card-header-flex">
                        <h3 class="card-heading">${escapeHtml(project.title)}</h3>
                        <span class="category-tag">${capitalize(project.category)}</span>
                    </div>
                    <p class="card-description">${escapeHtml(project.description || '')}</p>
                    <div class="card-tech">${techHtml}</div>
                </div>
            </div>
        </div>
    `;
}

/**
 * Generates HTML for a project list item.
 * @param {Object} project - The project data object.
 * @returns {string} The HTML string for the project list item.
 */
export function createProjectListCard(project) {
    const isBookmarked = window.bookmarksManager?.isBookmarked(project.title);
    const coverStyle = project.coverStyle || '';
    const coverClass = project.coverClass || '';
    const sourceUrl = getSourceCodeUrl(project.link);
    const deadline = deadlineManager.getProjectDeadline(project.title);
    const importance = deadline ? deadlineManager.getImportanceMetadata(deadline.importance) : null;

    // Create project data for Try It button
    const projectData = JSON.stringify({
        title: project.title,
        link: project.link,
        description: project.description || '',
        category: project.category
    }).replace(/'/g, "\\'");

    return `
        <div class="list-card">
            <div class="list-card-icon ${coverClass}" style="${coverStyle}">
                <i class="${escapeHtml(project.icon || 'ri-code-s-slash-line')}"></i>
            </div>
            <div class="list-card-content">
                <div class="list-card-title-wrapper">
                    <h4 class="list-card-title">${escapeHtml(project.title)}</h4>
                    ${deadline ? `<span class="list-card-deadline-badge" style="background-color: ${importance.color};" title="Importance: ${importance.label}">
                        <i class="${importance.icon}"></i>
                        ${deadline.deadline}
                    </span>` : ''}
                </div>
                <p class="list-card-description">${escapeHtml(project.description || '')}</p>
            </div>
            <div class="list-card-meta">
                <span class="list-card-category">${capitalize(project.category || 'project')}</span>
                <div class="list-card-actions">
                    <button class="list-card-btn try-it-list-btn" 
                            onclick="event.stopPropagation(); window.openCodePlayground && window.openCodePlayground(${projectData.replace(/"/g, '&quot;')});"
                            title="Try in Code Playground">
                        <i class="ri-play-circle-line"></i>
                    </button>
                    <button class="list-card-btn ${isBookmarked ? 'bookmarked' : ''}" 
                            onclick="event.stopPropagation(); window.toggleProjectBookmark(this, '${escapeHtml(project.title)}', '${escapeHtml(project.link)}', '${escapeHtml(project.category)}', '${escapeHtml(project.description || '')}');">
                        <i class="${isBookmarked ? 'ri-bookmark-fill' : 'ri-bookmark-line'}"></i>
                    </button>
                    <button class="list-card-btn" 
                            onclick="event.stopPropagation(); window.openDeadlineModal('${escapeHtml(project.title)}');"
                            title="Set deadline and importance">
                        <i class="ri-calendar-line"></i>
                    </button>
                    <a href="${escapeHtml(project.link)}" class="list-card-btn" title="Open Project">
                        <i class="ri-external-link-line"></i>
                    </a>
                    <a href="${sourceUrl}" target="_blank" class="list-card-btn" title="View Source Code">
                        <i class="ri-github-fill"></i>
                    </a>
                </div>
            </div>
        </div>
    `;
}
