// ===============================
// Analytics Engine for OpenPlayground
// Local telemetry tracking for project interactions
// Feature #1291: Advanced Project Analytics & Local Trending Engine
// ===============================

class AnalyticsEngine {
    constructor() {
        this.storageKey = 'project_analytics';
        this.sessionKey = 'analytics_session';
        this.trendingCacheKey = 'trending_cache';
        this.data = this.loadFromStorage();
        this.sessionData = this.loadSessionData();
        this.trendingCache = null;
        this.trendingCacheExpiry = 5 * 60 * 1000; // 5 minutes cache
        
        // Configuration for trending algorithm
        this.config = {
            // Time decay factor (older interactions worth less)
            decayHalfLife: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
            // Weights for different interaction types
            weights: {
                click: 1,
                view: 0.5,
                timeSpent: 0.1, // per second
                bookmark: 3,
                share: 2
            },
            // Minimum interactions to be considered for trending
            minInteractions: 2,
            // Hidden gem threshold (high quality, low visibility)
            hiddenGemMinScore: 5,
            hiddenGemMaxViews: 10
        };
        
        this.initializeSessionTracking();
    }

    // ===============================
    // Data Structure
    // ===============================
    
    getDefaultProjectData() {
        return {
            clicks: 0,
            views: 0,
            totalTimeSpent: 0, // in seconds
            bookmarks: 0,
            shares: 0,
            lastInteraction: null,
            firstInteraction: null,
            sessions: [], // Array of session timestamps
            dailyStats: {} // { 'YYYY-MM-DD': { clicks, views, timeSpent } }
        };
    }

    // ===============================
    // Core Tracking Methods
    // ===============================

    /**
     * Track a project click (opening a project)
     */
    trackClick(projectId, metadata = {}) {
        this.ensureProjectExists(projectId);
        const now = Date.now();
        
        this.data[projectId].clicks++;
        this.data[projectId].lastInteraction = now;
        if (!this.data[projectId].firstInteraction) {
            this.data[projectId].firstInteraction = now;
        }
        this.data[projectId].sessions.push(now);
        
        // Update daily stats
        this.updateDailyStats(projectId, 'clicks', 1);
        
        // Start time tracking for this project
        this.startTimeTracking(projectId);
        
        this.saveToStorage();
        this.invalidateTrendingCache();
        
        console.log(`📊 Analytics: Click tracked for ${projectId}`);
        
        return this.getProjectStats(projectId);
    }

    /**
     * Track a project view (card visible in viewport)
     */
    trackView(projectId) {
        this.ensureProjectExists(projectId);
        const now = Date.now();
        
        // Debounce views - only count once per session
        const lastView = this.sessionData.viewedProjects?.[projectId];
        if (lastView && (now - lastView) < 60000) { // 1 minute debounce
            return;
        }
        
        this.data[projectId].views++;
        this.data[projectId].lastInteraction = now;
        if (!this.data[projectId].firstInteraction) {
            this.data[projectId].firstInteraction = now;
        }
        
        // Track in session
        if (!this.sessionData.viewedProjects) {
            this.sessionData.viewedProjects = {};
        }
        this.sessionData.viewedProjects[projectId] = now;
        
        this.updateDailyStats(projectId, 'views', 1);
        this.saveToStorage();
        this.saveSessionData();
    }

    /**
     * Track time spent on a project
     */
    trackTimeSpent(projectId, seconds) {
        if (seconds <= 0) return;
        
        this.ensureProjectExists(projectId);
        this.data[projectId].totalTimeSpent += seconds;
        this.updateDailyStats(projectId, 'timeSpent', seconds);
        this.saveToStorage();
        this.invalidateTrendingCache();
    }

    /**
     * Track bookmark action
     */
    trackBookmark(projectId, isAdding = true) {
        this.ensureProjectExists(projectId);
        if (isAdding) {
            this.data[projectId].bookmarks++;
        }
        this.data[projectId].lastInteraction = Date.now();
        this.saveToStorage();
        this.invalidateTrendingCache();
    }

    /**
     * Track share action
     */
    trackShare(projectId) {
        this.ensureProjectExists(projectId);
        this.data[projectId].shares++;
        this.data[projectId].lastInteraction = Date.now();
        this.saveToStorage();
        this.invalidateTrendingCache();
    }

    // ===============================
    // Time Tracking
    // ===============================

    startTimeTracking(projectId) {
        // Stop any existing tracking
        this.stopTimeTracking();
        
        this.sessionData.currentProject = projectId;
        this.sessionData.trackingStartTime = Date.now();
        this.saveSessionData();
    }

    stopTimeTracking() {
        if (this.sessionData.currentProject && this.sessionData.trackingStartTime) {
            const elapsed = Math.floor((Date.now() - this.sessionData.trackingStartTime) / 1000);
            if (elapsed > 0 && elapsed < 3600) { // Max 1 hour per session
                this.trackTimeSpent(this.sessionData.currentProject, elapsed);
            }
        }
        
        this.sessionData.currentProject = null;
        this.sessionData.trackingStartTime = null;
        this.saveSessionData();
    }

    // ===============================
    // Trending Algorithm
    // ===============================

    /**
     * Calculate popularity score for a project with time decay
     */
    calculatePopularityScore(projectId) {
        const data = this.data[projectId];
        if (!data) return 0;

        const now = Date.now();
        const { weights, decayHalfLife } = this.config;
        
        // Calculate base score from interactions
        let baseScore = 0;
        baseScore += data.clicks * weights.click;
        baseScore += data.views * weights.view;
        baseScore += data.totalTimeSpent * weights.timeSpent;
        baseScore += data.bookmarks * weights.bookmark;
        baseScore += data.shares * weights.share;
        
        // Apply time decay based on last interaction
        if (data.lastInteraction) {
            const age = now - data.lastInteraction;
            const decayFactor = Math.pow(0.5, age / decayHalfLife);
            baseScore *= decayFactor;
        }
        
        // Boost recent activity (last 24 hours)
        const recentScore = this.getRecentActivityScore(projectId, 24);
        baseScore += recentScore * 2; // Double weight for recent activity
        
        return Math.round(baseScore * 100) / 100;
    }

    /**
     * Get activity score for the last N hours
     */
    getRecentActivityScore(projectId, hours = 24) {
        const data = this.data[projectId];
        if (!data || !data.dailyStats) return 0;

        const now = new Date();
        const cutoff = now.getTime() - (hours * 60 * 60 * 1000);
        let score = 0;

        // Check today and yesterday
        const dates = [
            this.formatDate(now),
            this.formatDate(new Date(now.getTime() - 24 * 60 * 60 * 1000))
        ];

        dates.forEach(date => {
            const dayStats = data.dailyStats[date];
            if (dayStats) {
                score += (dayStats.clicks || 0) * this.config.weights.click;
                score += (dayStats.views || 0) * this.config.weights.view;
                score += (dayStats.timeSpent || 0) * this.config.weights.timeSpent;
            }
        });

        return score;
    }

    /**
     * Get trending projects sorted by popularity
     */
    getTrendingProjects(limit = 10) {
        // Check cache
        if (this.trendingCache && this.trendingCache.expiry > Date.now()) {
            return this.trendingCache.data.slice(0, limit);
        }

        const projectScores = [];
        
        for (const projectId in this.data) {
            const data = this.data[projectId];
            const totalInteractions = data.clicks + data.views;
            
            if (totalInteractions >= this.config.minInteractions) {
                projectScores.push({
                    projectId,
                    score: this.calculatePopularityScore(projectId),
                    clicks: data.clicks,
                    views: data.views,
                    timeSpent: data.totalTimeSpent,
                    bookmarks: data.bookmarks
                });
            }
        }

        // Sort by score descending
        projectScores.sort((a, b) => b.score - a.score);
        
        // Cache results
        this.trendingCache = {
            data: projectScores,
            expiry: Date.now() + this.trendingCacheExpiry
        };
        
        return projectScores.slice(0, limit);
    }

    /**
     * Get hidden gem projects (high quality, low visibility)
     */
    getHiddenGems(limit = 5) {
        const gems = [];
        
        for (const projectId in this.data) {
            const data = this.data[projectId];
            const score = this.calculatePopularityScore(projectId);
            
            // Hidden gem criteria: decent engagement but few views
            if (score >= this.config.hiddenGemMinScore && 
                data.views <= this.config.hiddenGemMaxViews) {
                gems.push({
                    projectId,
                    score,
                    views: data.views,
                    clicks: data.clicks,
                    avgTimeSpent: data.clicks > 0 ? data.totalTimeSpent / data.clicks : 0
                });
            }
        }

        // Sort by score descending
        gems.sort((a, b) => b.score - a.score);
        
        return gems.slice(0, limit);
    }

    /**
     * Check if a project is trending
     */
    isTrending(projectId, topN = 10) {
        const trending = this.getTrendingProjects(topN);
        return trending.some(t => t.projectId === projectId);
    }

    /**
     * Check if a project is a hidden gem
     */
    isHiddenGem(projectId) {
        const gems = this.getHiddenGems(10);
        return gems.some(g => g.projectId === projectId);
    }

    /**
     * Get badge type for a project
     */
    getProjectBadge(projectId) {
        if (this.isTrending(projectId, 5)) {
            return { type: 'trending', label: '🔥 Trending', class: 'badge-trending' };
        }
        if (this.isHiddenGem(projectId)) {
            return { type: 'hidden-gem', label: '💎 Hidden Gem', class: 'badge-hidden-gem' };
        }
        return null;
    }

    // ===============================
    // Statistics & Reports
    // ===============================

    /**
     * Get stats for a specific project
     */
    getProjectStats(projectId) {
        const data = this.data[projectId];
        if (!data) return null;

        return {
            projectId,
            clicks: data.clicks,
            views: data.views,
            totalTimeSpent: data.totalTimeSpent,
            avgTimeSpent: data.clicks > 0 ? Math.round(data.totalTimeSpent / data.clicks) : 0,
            bookmarks: data.bookmarks,
            shares: data.shares,
            lastInteraction: data.lastInteraction,
            firstInteraction: data.firstInteraction,
            popularityScore: this.calculatePopularityScore(projectId),
            badge: this.getProjectBadge(projectId)
        };
    }

    /**
     * Get user activity summary
     */
    getUserActivitySummary() {
        let totalClicks = 0;
        let totalViews = 0;
        let totalTimeSpent = 0;
        let uniqueProjects = 0;
        const categoryStats = {};

        for (const projectId in this.data) {
            const data = this.data[projectId];
            totalClicks += data.clicks;
            totalViews += data.views;
            totalTimeSpent += data.totalTimeSpent;
            if (data.clicks > 0 || data.views > 0) {
                uniqueProjects++;
            }
        }

        // Get most visited projects
        const mostVisited = Object.entries(this.data)
            .map(([id, data]) => ({ projectId: id, clicks: data.clicks, timeSpent: data.totalTimeSpent }))
            .filter(p => p.clicks > 0)
            .sort((a, b) => b.clicks - a.clicks)
            .slice(0, 5);

        return {
            totalClicks,
            totalViews,
            totalTimeSpent,
            uniqueProjects,
            mostVisited,
            averageTimePerProject: uniqueProjects > 0 ? Math.round(totalTimeSpent / uniqueProjects) : 0
        };
    }

    /**
     * Get activity for a date range
     */
    getActivityByDateRange(startDate, endDate) {
        const activity = {};
        const start = new Date(startDate);
        const end = new Date(endDate);

        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const dateStr = this.formatDate(d);
            activity[dateStr] = { clicks: 0, views: 0, timeSpent: 0 };

            for (const projectId in this.data) {
                const dayStats = this.data[projectId].dailyStats?.[dateStr];
                if (dayStats) {
                    activity[dateStr].clicks += dayStats.clicks || 0;
                    activity[dateStr].views += dayStats.views || 0;
                    activity[dateStr].timeSpent += dayStats.timeSpent || 0;
                }
            }
        }

        return activity;
    }

    /**
     * Get category engagement stats
     */
    getCategoryEngagement(projectsData) {
        const categoryStats = {};

        for (const projectId in this.data) {
            const project = projectsData?.find(p => p.name === projectId || p.folder === projectId);
            if (project && project.category) {
                if (!categoryStats[project.category]) {
                    categoryStats[project.category] = {
                        clicks: 0,
                        views: 0,
                        timeSpent: 0,
                        projects: 0
                    };
                }
                categoryStats[project.category].clicks += this.data[projectId].clicks;
                categoryStats[project.category].views += this.data[projectId].views;
                categoryStats[project.category].timeSpent += this.data[projectId].totalTimeSpent;
                categoryStats[project.category].projects++;
            }
        }

        return categoryStats;
    }

    // ===============================
    // Helper Methods
    // ===============================

    ensureProjectExists(projectId) {
        if (!this.data[projectId]) {
            this.data[projectId] = this.getDefaultProjectData();
        }
    }

    updateDailyStats(projectId, metric, value) {
        const today = this.formatDate(new Date());
        if (!this.data[projectId].dailyStats) {
            this.data[projectId].dailyStats = {};
        }
        if (!this.data[projectId].dailyStats[today]) {
            this.data[projectId].dailyStats[today] = { clicks: 0, views: 0, timeSpent: 0 };
        }
        this.data[projectId].dailyStats[today][metric] += value;
    }

    formatDate(date) {
        return date.toISOString().split('T')[0];
    }

    invalidateTrendingCache() {
        this.trendingCache = null;
    }

    // ===============================
    // Session Management
    // ===============================

    initializeSessionTracking() {
        // Stop time tracking when page unloads
        window.addEventListener('beforeunload', () => {
            this.stopTimeTracking();
        });

        // Also stop when visibility changes
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.stopTimeTracking();
            }
        });
    }

    loadSessionData() {
        try {
            const saved = sessionStorage.getItem(this.sessionKey);
            return saved ? JSON.parse(saved) : { viewedProjects: {} };
        } catch (error) {
            console.error('Failed to load session data:', error);
            return { viewedProjects: {} };
        }
    }

    saveSessionData() {
        try {
            sessionStorage.setItem(this.sessionKey, JSON.stringify(this.sessionData));
        } catch (error) {
            console.error('Failed to save session data:', error);
        }
    }

    // ===============================
    // Storage
    // ===============================

    loadFromStorage() {
        try {
            const saved = localStorage.getItem(this.storageKey);
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.error('Failed to load analytics data:', error);
            return {};
        }
    }

    saveToStorage() {
        try {
            localStorage.setItem(this.storageKey, JSON.stringify(this.data));
        } catch (error) {
            console.error('Failed to save analytics data:', error);
        }
    }

    /**
     * Export analytics data
     */
    exportData() {
        return {
            version: '1.0',
            exportedAt: new Date().toISOString(),
            data: this.data,
            summary: this.getUserActivitySummary()
        };
    }

    /**
     * Clear all analytics data
     */
    clearAllData() {
        this.data = {};
        this.sessionData = { viewedProjects: {} };
        this.trendingCache = null;
        this.saveToStorage();
        this.saveSessionData();
        console.log('📊 Analytics: All data cleared');
    }

    /**
     * Prune old data (older than specified days)
     */
    pruneOldData(daysToKeep = 90) {
        const cutoff = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);
        let pruned = 0;

        for (const projectId in this.data) {
            const data = this.data[projectId];
            
            // Prune old daily stats
            if (data.dailyStats) {
                for (const date in data.dailyStats) {
                    if (new Date(date).getTime() < cutoff) {
                        delete data.dailyStats[date];
                        pruned++;
                    }
                }
            }

            // Prune old sessions
            if (data.sessions) {
                data.sessions = data.sessions.filter(s => s > cutoff);
            }
        }

        this.saveToStorage();
        console.log(`📊 Analytics: Pruned ${pruned} old records`);
        return pruned;
    }
}

// Create global instance
const analyticsEngine = new AnalyticsEngine();

// Export for use in other scripts
window.AnalyticsEngine = AnalyticsEngine;
window.analyticsEngine = analyticsEngine;

export { AnalyticsEngine, analyticsEngine };
