const CONFIG = {
    // Engine Settings
    TICK_RATE_MS: 16, // roughly 60fps logic
    INITIAL_PRICE: 50000.00,
    INITIAL_SPREAD: 10.0,
    LOT_SIZE: 0.01,
    MAX_ORDER_BOOK_DEPTH: 100,

    // Performance Limits
    CHART_HISTORY_POINTS: 1000,
    MAX_TRADES_IN_MEMORY: 5000,

    // Simulation
    LATENCY_BASE_MS: 10,
    LATENCY_JITTER_MS: 5,

    // Display
    THEME_COLORS: {
        BID: '#00d287',
        ASK: '#ff3b69',
        MID: '#e2e8f0',
        GRID: '#222633',
        BACKGROUND: '#0a0b10'
    },

    // Bot Defaults
    BOT_DEPLOYMENT_MAX: 15,
};

window.CONFIG = CONFIG;
