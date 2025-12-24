/**
 * Global Test Teardown
 * Runs after all tests complete to clean up resources
 */

import { closeConnection } from './helpers/testDb.js';

export default async function teardown() {
  console.log('🧹 Running global test teardown...');
  
  try {
    // Close database connection
    await closeConnection();
    console.log('✅ Database connection closed');
  } catch (error) {
    console.error('❌ Error during teardown:', error.message);
  }
}
