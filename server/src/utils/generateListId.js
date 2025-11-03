// server/src/utils/generateListId.js
const { customAlphabet } = require('nanoid');

/**
 * Generate a unique 6-character list ID
 * Format: LST-XXXXXX (e.g., LST-A1B2C3)
 * Uses alphanumeric characters (uppercase)
 */
function generateListId() {
  // Use only uppercase letters and numbers for clarity
  const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 6);
  return `LST-${nanoid()}`;
}

module.exports = generateListId;
