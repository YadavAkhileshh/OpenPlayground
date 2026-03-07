const crypto = require('crypto')

/**
 * Generate a short unique share code for boards.
 * @param {number} length - Length of the code (default 8)
 * @returns {string}
 */
function generateShareCode(length = 8) {
  return crypto.randomBytes(length).toString('base64url').slice(0, length)
}

module.exports = { generateShareCode }
