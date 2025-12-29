import { config } from 'dotenv';

config({ path: '.env.test' });

function verifyTestDatabaseConfig() {
  const dbUrl = process.env.DATABASE_URL || '';
  const nodeEnv = process.env.NODE_ENV || '';

  const isTestDb = dbUrl.includes('_test') || dbUrl.includes('test');
  const isTestEnv = nodeEnv === 'test';

  if (!isTestDb && !isTestEnv) {
    console.error('❌ SAFETY CHECK FAILED: Not using test database!');
    console.error('DATABASE_URL must contain "_test" or "test" in the name.');
    console.error(`Current DATABASE_URL: ${dbUrl}`);
    console.error('This prevents accidental data loss in production/development databases.');
    process.exit(1);
  }

  const productionKeywords = ['production', 'prod', 'live', 'main'];
  const hasProductionKeyword = productionKeywords.some((keyword) => dbUrl.toLowerCase().includes(keyword));

  if (hasProductionKeyword) {
    console.error('❌ SAFETY CHECK FAILED: Database URL contains production keywords!');
    console.error(`Current DATABASE_URL: ${dbUrl}`);
    console.error('Tests should never run against production databases.');
    process.exit(1);
  }

  console.log('✅ Test database configuration verified');
  console.log(`   Using database: ${dbUrl.split('@')[1] || 'test database'}`);
  console.log(`   Environment: ${nodeEnv}`);
}

verifyTestDatabaseConfig();
