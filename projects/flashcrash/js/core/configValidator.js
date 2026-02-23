/**
 * Centralized config validator to ensure system constraints before boot
 */
class ConfigValidator {
    static validate(config) {
        const errors = [];
        const warnings = [];

        if (!config) {
            errors.push("Config object is missing completely");
            return { valid: false, errors, warnings };
        }

        if (typeof config.TICK_RATE_MS !== 'number' || config.TICK_RATE_MS <= 0) {
            errors.push("TICK_RATE_MS must be a positive number");
        } else if (config.TICK_RATE_MS < 5) {
            warnings.push("TICK_RATE_MS < 5ms may cause high CPU starvation");
        }

        if (typeof config.INITIAL_PRICE !== 'number' || config.INITIAL_PRICE <= 0) {
            errors.push("INITIAL_PRICE must be a strictly positive number");
        }

        if (config.MAX_ORDER_BOOK_DEPTH > 500) {
            warnings.push("MAX_ORDER_BOOK_DEPTH > 500 might severely impact render loop FPS");
        }

        if (!config.THEME_COLORS || !config.THEME_COLORS.BID || !config.THEME_COLORS.ASK) {
            errors.push("THEME_COLORS requires explicit BID and ASK definitions");
        }

        return {
            valid: errors.length === 0,
            errors,
            warnings
        };
    }
}

window.ConfigValidator = ConfigValidator;
