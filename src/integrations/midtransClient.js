import midtrans from 'midtrans-client';

/**
 * Midtrans Snap Client Configuration
 * Handles environment switching between sandbox and production
 *
 * Environment variables required:
 * - MIDTRANS_MODE: 'sandbox' or 'production'
 * - MIDTRANS_SANDBOX_SERVER_KEY: Sandbox server key
 * - MIDTRANS_SANDBOX_CLIENT_KEY: Sandbox client key
 * - MIDTRANS_SERVER_KEY: Production server key
 * - MIDTRANS_CLIENT_KEY: Production client key
 */

const isProduction = process.env.MIDTRANS_MODE === 'production';

// Get appropriate keys based on environment
const serverKey = isProduction ? process.env.MIDTRANS_SERVER_KEY : process.env.MIDTRANS_SANDBOX_SERVER_KEY;

const clientKey = isProduction ? process.env.MIDTRANS_CLIENT_KEY : process.env.MIDTRANS_SANDBOX_CLIENT_KEY;

// Validate required environment variables
if (!serverKey) {
  throw new Error(`Missing ${isProduction ? 'MIDTRANS_SERVER_KEY' : 'MIDTRANS_SANDBOX_SERVER_KEY'} environment variable`);
}

if (!clientKey) {
  throw new Error(`Missing ${isProduction ? 'MIDTRANS_CLIENT_KEY' : 'MIDTRANS_SANDBOX_CLIENT_KEY'} environment variable`);
}

/**
 * Midtrans Snap instance for creating transaction tokens
 * Used for server-side transaction creation
 */
export const snap = new midtrans.Snap({
  isProduction,
  serverKey,
  clientKey,
});

/**
 * Midtrans Core API instance for transaction status queries
 * Used for webhook verification and status polling
 */
export const coreApi = new midtrans.CoreApi({
  isProduction,
  serverKey,
  clientKey,
});

/**
 * Get client key for frontend usage
 * @returns {string} Client key for current environment
 */
export const getClientKey = () => clientKey;

/**
 * Get server key for webhook verification
 * @returns {string} Server key for current environment
 */
export const getServerKey = () => serverKey;

/**
 * Get current environment mode
 * @returns {boolean} True if production, false if sandbox
 */
export const isProductionMode = () => isProduction;

/**
 * Get Midtrans base URL for current environment
 * @returns {string} Base URL for API calls
 */
export const getBaseUrl = () => {
  return isProduction
    ? process.env.MIDTRANS_PRODUCTION_URL || 'https://api.midtrans.com'
    : process.env.MIDTRANS_SANDBOX_URL || 'https://api.sandbox.midtrans.com';
};

// Log configuration on startup (without exposing sensitive keys)
console.log(`🔧 [MidtransClient] Initialized in ${isProduction ? 'PRODUCTION' : 'SANDBOX'} mode`);
console.log(`🔗 [MidtransClient] Base URL: ${getBaseUrl()}`);
console.log(`🔑 [MidtransClient] Server Key: ${serverKey.substring(0, 10)}...`);
console.log(`🔑 [MidtransClient] Client Key: ${clientKey.substring(0, 10)}...`);
