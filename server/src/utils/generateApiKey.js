// server/src/utils/generateApiKey.js
const crypto = require('crypto');

/**
 * Generate a secure API key for TrackMate webhooks
 * Format: tm_live_<32 random characters>
 *
 * @returns {string} API key in format tm_live_XXXXXXXX...
 */
function generateApiKey() {
  // Generate 32 random bytes and convert to hex (64 characters)
  const randomString = crypto.randomBytes(32).toString('hex');

  // Format: tm_live_<random>
  // tm = TrackMate prefix
  // live = environment (could also be 'test' for testing)
  return `tm_live_${randomString}`;
}

module.exports = generateApiKey;
