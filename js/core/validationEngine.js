/**
 * ValidationEngine
 * ----------------
 * Shared utility for validating form fields and inputs.
 */

export const ValidationEngine = {
    /**
     * Common validation patterns
     */
    patterns: {
        email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        url: /^(https?:\/\/)?([\da-z.-]+)\.([a-z.]{2,6})([/\w .-]*)*\/?$/,
        name: /^[a-zA-Z\s]{2,50}$/
    },

    /**
     * Validate an email address
     * @param {string} email 
     * @returns {boolean}
     */
    validateEmail(email) {
        return this.patterns.email.test(email);
    },

    /**
     * Check if a string is empty or just whitespace
     * @param {string} str 
     * @returns {boolean}
     */
    isRequired(str) {
        return str !== null && str !== undefined && str.trim().length > 0;
    },

    /**
     * Check string length
     * @param {string} str 
     * @param {number} min 
     * @param {number} max 
     * @returns {boolean}
     */
    isValidLength(str, min = 0, max = Infinity) {
        const len = str.trim().length;
        return len >= min && len <= max;
    },

    /**
     * Validate multiple fields at once
     * @param {Object} data - Form data object { fieldName: value }
     * @param {Object} rules - Rules object { fieldName: { required: true, min: 5, type: 'email' } }
     * @returns {Object} - { isValid: boolean, errors: Object }
     */
    validate(data, rules) {
        const errors = {};
        let isValid = true;

        for (const field in rules) {
            const val = data[field] || "";
            const rule = rules[field];

            if (rule.required && !this.isRequired(val)) {
                errors[field] = "This field is required";
                isValid = false;
            } else if (val && rule.type === 'email' && !this.validateEmail(val)) {
                errors[field] = "Invalid email format";
                isValid = false;
            } else if (val && (rule.min || rule.max)) {
                if (!this.isValidLength(val, rule.min || 0, rule.max || Infinity)) {
                    errors[field] = `Length must be between ${rule.min || 0} and ${rule.max || '∞'} characters`;
                    isValid = false;
                }
            }
        }

        return { isValid, errors };
    }
};

window.ValidationEngine = ValidationEngine;
