import midtrans from 'midtrans-client';
import { getLogger } from '../lib/loggerContext.js';

/**
 * Midtrans Snap Client Configuration
 * Handles environment switching between sandbox and production
 */

const mode = process.env.MIDTRANS_MODE;
const logger = getLogger();

const serverKey = mode === 'PRODUCTION' ? process.env.MIDTRANS_SERVER_KEY : process.env.MIDTRANS_SANDBOX_SERVER_KEY;
const clientKey = mode === 'PRODUCTION' ? process.env.MIDTRANS_CLIENT_KEY : process.env.MIDTRANS_SANDBOX_CLIENT_KEY;

if (!serverKey) {
  throw new Error(`Missing ${mode === 'PRODUCTION' ? 'MIDTRANS_SERVER_KEY' : 'MIDTRANS_SANDBOX_SERVER_KEY'} environment variable`);
}

/**
 * Midtrans Snap instance for creating transaction tokens
 * Used for server-side transaction creation
 */
export const snap = new midtrans.Snap({
  isProduction: mode === 'PRODUCTION',
  serverKey: serverKey,
  clientKey: clientKey,
});

/**
 * Get server key for webhook verification
 * @returns {string} Server key for current environment
 */
export const getServerKey = () => {
  return serverKey;
};

/**
 * Get current environment mode
 * @returns {boolean} True if production, false if sandbox
 */
export const isProductionMode = () => mode === 'PRODUCTION';

/**
 * Get Midtrans base URL for current environment
 * @returns {string} Base URL for API calls
 */
export const getBaseUrl = () => {
  return mode === 'PRODUCTION'
    ? process.env.MIDTRANS_PRODUCTION_URL || 'https://api.midtrans.com'
    : process.env.MIDTRANS_SANDBOX_URL || 'https://api.sandbox.midtrans.com';
};
