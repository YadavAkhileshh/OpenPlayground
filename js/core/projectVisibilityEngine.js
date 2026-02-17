/**
 * ProjectVisibilityEngine
 * -----------------------
 * Centralized state engine responsible for determining
 * project visibility across search, filters, pagination,
 * sorting, and discovery features.
 *
 * Acts as a single source of truth.
 * No DOM access. No UI logic.
 *
 * Feature #1291: Added trending sort support with analytics integration
 */

export class ProjectVisibilityEngine {
  constructor(projects = []) {
    this.projects = projects;

    this.state = {
      searchQuery: '',
      categories: new Set(['all']), // SINGLE active category
      collection: null,
      page: 1,
      itemsPerPage: 10,
      sortMode: 'default',
    };

    this.analyticsEngine = null;
  }

  /* ------------------
   * Analytics Integration
   * ------------------ */

  setAnalyticsEngine(engine) {
    this.analyticsEngine = engine;
  }

  /* ------------------
   * State setters
   * ------------------ */

  setSearchQuery(query) {
    this.state.searchQuery = query.toLowerCase();
    this.state.page = 1;
  }

  /**
   * SINGLE CATEGORY MODE
   * Replaces any existing category with the new one
   */
  setCategory(category) {
    const cat = this.normalizeCategory(category) || 'all';

    this.state.categories.clear();
    this.state.categories.add(cat);
    this.state.page = 1;
  }

  /**
   * Reset category back to "all"
   */
  clearCategories() {
    this.state.categories.clear();
    this.state.categories.add('all');
    this.state.page = 1;
  }

  normalizeCategory(cat) {
    if (!cat) return 'other';
    const normalized = cat.trim().toLowerCase().replace(/\s+/g, '_');

    const pluralMap = {
      games: 'game',
      puzzles: 'puzzle',
      utilities: 'utility',
    };

    return pluralMap[normalized] || normalized;
  }

  setCollection(collectionId) {
    this.state.collection = collectionId;
    this.state.page = 1;
  }

  setPage(page) {
    this.state.page = page;
  }

  setSortMode(mode) {
    this.state.sortMode = mode;
    this.state.page = 1;
  }

  reset() {
    this.state.searchQuery = '';
    this.state.categories = new Set(['all']);
    this.state.collection = null;
    this.state.page = 1;
    this.state.sortMode = 'default';
  }

  /* ------------------
   * Derived state
   * ------------------ */

  getVisibleProjects() {
    let filtered = this.projects.filter((project) => {
      const matchesSearch = project.title
        .toLowerCase()
        .includes(this.state.searchQuery);

      const projectCat = this.normalizeCategory(project.category);
      const matchesCategory =
        this.state.categories.has('all') ||
        this.state.categories.has(projectCat);

      return matchesSearch && matchesCategory;
    });

    return this.applySorting(filtered);
  }

  applySorting(projects) {
    const sorted = [...projects];

    switch (this.state.sortMode) {
      case 'az':
        sorted.sort((a, b) => a.title.localeCompare(b.title));
        break;

      case 'za':
        sorted.sort((a, b) => b.title.localeCompare(a.title));
        break;

      case 'newest':
        sorted.sort((a, b) => {
          const dateA = a.dateAdded ? new Date(a.dateAdded) : new Date(0);
          const dateB = b.dateAdded ? new Date(b.dateAdded) : new Date(0);
          return dateB - dateA;
        });
        break;

      case 'trending':
        if (this.analyticsEngine) {
          sorted.sort((a, b) => {
            const idA = a.folder || a.name || a.title;
            const idB = b.folder || b.name || b.title;
            return (
              this.analyticsEngine.calculatePopularityScore(idB) -
              this.analyticsEngine.calculatePopularityScore(idA)
            );
          });
        }
        break;

      case 'rating-high':
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;

      case 'rating-low':
        sorted.sort((a, b) => (a.rating || 0) - (b.rating || 0));
        break;

      case 'default':
      default:
        break;
    }

    return sorted;
  }

  getProjectsWithBadges() {
    const projects = this.getVisibleProjects();

    if (!this.analyticsEngine) {
      return projects.map((p) => ({ ...p, badge: null }));
    }

    return projects.map((project) => {
      const id = project.folder || project.name || project.title;
      return {
        ...project,
        badge: this.analyticsEngine.getProjectBadge(id),
      };
    });
  }

  getTrendingProjects(limit = 10) {
    if (!this.analyticsEngine) return [];

    return this.analyticsEngine
      .getTrendingProjects(limit)
      .map((t) => {
        const project = this.projects.find(
          (p) => (p.folder || p.name || p.title) === t.projectId,
        );
        return project ? { ...project, trendingScore: t.score } : null;
      })
      .filter(Boolean);
  }

  getHiddenGems(limit = 5) {
    if (!this.analyticsEngine) return [];

    return this.analyticsEngine
      .getHiddenGems(limit)
      .map((g) => {
        const project = this.projects.find(
          (p) => (p.folder || p.name || p.title) === g.projectId,
        );
        return project ? { ...project, gemScore: g.score } : null;
      })
      .filter(Boolean);
  }

  getPaginatedProjects() {
    const filtered = this.getVisibleProjects();
    const start = (this.state.page - 1) * this.state.itemsPerPage;
    return filtered.slice(start, start + this.state.itemsPerPage);
  }

  getTotalPages() {
    return Math.ceil(
      this.getVisibleProjects().length / this.state.itemsPerPage,
    );
  }

  isEmpty() {
    return this.getVisibleProjects().length === 0;
  }

  /* ------------------
   * URL helpers
   * ------------------ */

  updateURL(viewMode = 'card') {
    const params = new URLSearchParams();

    if (!this.state.categories.has('all')) {
      params.set('cats', [...this.state.categories].join(','));
    }
    if (this.state.searchQuery) {
      params.set('search', this.state.searchQuery);
    }
    if (this.state.sortMode !== 'default') {
      params.set('sort', this.state.sortMode);
    }
    if (this.state.page > 1) {
      params.set('page', this.state.page);
    }
    if (viewMode !== 'card') {
      params.set('view', viewMode);
    }

    const newURL = params.toString()
      ? `${window.location.pathname}?${params}`
      : window.location.pathname;

    window.history.replaceState({ path: newURL }, '', newURL);
  }

  getStateFromURL() {
    const params = new URLSearchParams(window.location.search);

    const result = {
      search: params.get('search') || '',
      categories: [],
      page: parseInt(params.get('page'), 10) || 1,
      sort: params.get('sort') || 'default',
      view: params.get('view') || 'card',
    };

    const cats = params.get('cats');
    if (cats) {
      result.categories = cats.split(',').map((c) => c.trim().toLowerCase());
    }

    return result;
  }
}
