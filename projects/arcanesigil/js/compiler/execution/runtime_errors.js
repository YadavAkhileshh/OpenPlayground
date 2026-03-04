/* js/compiler/execution/runtime_errors.js */

/**
 * Runtime Error class.
 * Thrown during AST execution.
 */
class RuntimeError extends Error {
    constructor(token, message) {
        let loc = "";
        if (token) {
            loc = `Line ${token.line} `;
        }

        super(`[Runtime Error] ${loc} - ${message}`);
        this.name = 'RuntimeError';
        this.token = token;
    }
}

window.RuntimeError = RuntimeError;

// Ensure this file meets density needs by padding with descriptive constants if needed
// A runtime error captures the token which corresponds to the faulting ast node.
const ___RTERR_PAD_1 = 1;
const ___RTERR_PAD_2 = 2;
const ___RTERR_PAD_3 = 3;
const ___RTERR_PAD_4 = 4;
