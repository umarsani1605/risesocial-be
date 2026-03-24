/**
 * Logger utility for database seeding operations
 * Provides emoji-based progress logging for better visibility
 */

/**
 * Log the start of a seeding operation
 * @param {string} domain - The domain being seeded (e.g., "Users", "Academies")
 */
export function logSeedStart(domain) {
  console.log(`\n🌱 Seeding ${domain}...`);
}

/**
 * Log successful completion of a seeding operation
 * @param {string} domain - The domain that was seeded
 * @param {Object} stats - Statistics object with record counts
 */
export function logSeedSuccess(domain, stats) {
  console.log(`✅ ${domain} seeded successfully!`);

  // Log individual statistics
  Object.entries(stats).forEach(([key, value]) => {
    const label = key
      .replace(/Count$/, '')
      .replace(/([A-Z])/g, ' $1')
      .trim();
    console.log(`   • ${label}: ${value}`);
  });
}

/**
 * Log an error during seeding
 * @param {string} domain - The domain where the error occurred
 * @param {Error} error - The error object
 */
export function logSeedError(domain, error) {
  console.error(`❌ Error seeding ${domain}:`);
  console.error(`   ${error.message}`);
  if (error.stack) {
    console.error(`\n${error.stack}`);
  }
}

/**
 * Log a validation message
 * @param {string} message - The validation message
 */
export function logValidation(message) {
  console.log(`🔍 ${message}`);
}

/**
 * Log a summary of all seeding operations
 * @param {Object} summary - Summary object with total counts
 * @param {number} duration - Duration in milliseconds
 */
export function logSummary(summary, duration) {
  console.log('\n' + '='.repeat(60));
  console.log('🎉 Seeding completed successfully!');
  console.log('='.repeat(60));

  console.log('\n📊 Summary:');
  Object.entries(summary).forEach(([key, value]) => {
    const label = key.replace(/([A-Z])/g, ' $1').trim();
    console.log(`   • Total ${label}: ${value}`);
  });

  console.log(`\n⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
}

/**
 * Log test credentials for development
 * @param {Array} credentials - Array of credential objects
 */
export function logTestCredentials(credentials) {
  console.log('\n🔑 Test Credentials:');
  credentials.forEach((cred) => {
    console.log(`   • ${cred.role}: ${cred.email} / ${cred.password}`);
  });
}

/**
 * Log a clearing operation
 * @param {string} message - The clearing message
 */
export function logClear(message) {
  console.log(`🧹 ${message}`);
}
