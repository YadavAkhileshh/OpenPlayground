export default class Router {
    constructor() {
        this.routes = {
            'focus': document.getElementById('view-focus'),
            'tasks': document.getElementById('view-tasks'),
            'analytics': document.getElementById('view-analytics')
        };

        this.navButtons = document.querySelectorAll('.nav-btn');
        this.init();
    }

    init() {
        this.navButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = btn.dataset.view;
                this.navigate(target);
            });
        });

        // Default to focus
        this.navigate('focus');
    }

    navigate(viewName) {
        // Validation
        if (!this.routes[viewName]) return;

        // Update Nav State
        this.navButtons.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.view === viewName);
        });

        // Update View State
        Object.values(this.routes).forEach(el => {
            if (el) {
                el.style.display = 'none';
                el.classList.remove('view-enter');
            }
        });

        const targetEl = this.routes[viewName];
        if (targetEl) {
            targetEl.style.display = 'grid'; // Default flex/grid for dashboard
            targetEl.classList.add('view-enter');

            // Special handling if view needs different display type
            if (viewName === 'tasks' || viewName === 'analytics') {
                targetEl.style.display = 'block';
            }
        }
    }
}
