/**
 * ViewCounter - Tracks project views using localStorage
 * Manages view counts for all projects
 */
class ViewCounter {
  constructor() {
    this.storageKey = 'openplayground_view_counts';
    this.counts = this.loadCounts();
  }

  /**
   * Load all view counts from localStorage
   */
  loadCounts() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      return stored ? JSON.parse(stored) : {};
    } catch (e) {
      console.warn('⚠️ ViewCounter: Failed to load from localStorage', e);
      return {};
    }
  }

  /**
   * Save counts to localStorage
   */
  saveCounts() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.counts));
    } catch (e) {
      console.warn('⚠️ ViewCounter: Failed to save to localStorage', e);
    }
  }

  /**
   * Increment view count for a project
   * @param {string|number} projectId - Project identifier (index or ID)
   */
  incrementView(projectId) {
    const id = String(projectId);
    this.counts[id] = (this.counts[id] || 0) + 1;
    this.saveCounts();
    return this.counts[id];
  }

  /**
   * Get view count for a project
   * @param {string|number} projectId - Project identifier
   * @returns {number} View count (0 if never viewed)
   */
  getViewCount(projectId) {
    return this.counts[String(projectId)] || 0;
  }

  /**
   * Get all view counts
   * @returns {object} Object with all project view counts
   */
  getAllCounts() {
    return { ...this.counts };
  }

  /**
   * Reset all view counts (for testing)
   */
  resetAll() {
    this.counts = {};
    this.saveCounts();
  }

  /**
   * Get top N projects by views
   * @param {number} limit - How many top projects to return
   * @returns {array} Array of {id, count} sorted by views
   */
  getTopViewed(limit = 10) {
    return Object.entries(this.counts)
      .map(([id, count]) => ({ id, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }
}

// Create global instance
window.viewCounter = new ViewCounter();
console.log('✅ ViewCounter initialized');
