# Test Infrastructure Documentation

## Test Database Isolation

This testing infrastructure implements strict database isolation to prevent accidental data loss in production or development databases.

### Safety Mechanisms

#### 1. Database Name Verification
The test infrastructure verifies that the database URL contains `_test` or `test` in the name:
```
✅ Valid: postgresql://localhost:5432/risesocial_test
❌ Invalid: postgresql://localhost:5432/risesocial
```

#### 2. Production Keyword Detection
The system prevents using databases with production-related keywords:
- `production`
- `prod`
- `live`
- `main`

#### 3. Environment Variable Check
Tests verify that `NODE_ENV` is set to `test` when running.

#### 4. Multiple Safety Layers
Safety checks are performed at multiple points:
- **Setup phase**: `tests/setup-env.js` verifies configuration before any tests run
- **Database helper**: `tests/helpers/testDb.js` verifies before creating Prisma client
- **Reset operations**: Verification before truncating tables

### Configuration

#### Test Environment File (`.env.test`)
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/risesocial_test?schema=public"
NODE_ENV=test
```

#### Vitest Configuration
The `vitest.config.js` includes:
- `setupFiles`: Loads test environment and verifies configuration
- `globalTeardown`: Closes database connections after all tests

### Database Cleanup

#### Automatic Cleanup
The `resetDatabase()` function truncates all tables while preserving the schema:
```javascript
import { resetDatabase } from './helpers/testDb.js';

beforeEach(async () => {
  await resetDatabase(); // Clean state for each test
});
```

#### Connection Management
Database connections are automatically closed after all tests complete via the global teardown hook.

### Running Tests

```bash
# Run all tests
npm test

# Run specific test category
npm run test:unit
npm run test:integration
npm run test:e2e

# Run with coverage
npm run test:coverage
```

### Safety Check Failures

If safety checks fail, you'll see an error like:
```
❌ SAFETY CHECK FAILED: Not using test database!
DATABASE_URL must contain "_test" or "test" in the name.
Current DATABASE_URL: postgresql://localhost:5432/risesocial
This prevents accidental data loss in production/development databases.
```

**Solution**: Update your `.env.test` file to use a test database with `_test` in the name.

### Best Practices

1. **Always use a separate test database** - Never point tests at development or production databases
2. **Use `beforeEach` for cleanup** - Reset database state before each test for isolation
3. **Close connections properly** - The global teardown handles this automatically
4. **Verify test database** - Check that `isTestDatabase()` returns `true` in your tests

### Test Organization

```
tests/
├── helpers/          # Test utilities and helpers
│   ├── testDb.js    # Database operations
│   └── testServer.js # Server setup
├── unit/            # Unit tests (mocked dependencies)
├── integration/     # Integration tests (real database)
├── e2e/             # End-to-end tests (full HTTP flow)
├── setup-env.js     # Global setup (loads .env.test)
├── teardown.js      # Global teardown (closes connections)
└── README.md        # This file
```

## Troubleshooting

### Database Connection Issues
If tests fail to connect to the database:
1. Ensure PostgreSQL is running
2. Verify database credentials in `.env.test`
3. Check that the test database exists: `createdb risesocial_test`

### Safety Check Failures
If you see safety check errors:
1. Verify `.env.test` has correct `DATABASE_URL`
2. Ensure database name contains `_test` or `test`
3. Check that `NODE_ENV=test` is set

### Cleanup Issues
If tests leave data behind:
1. Check that `resetDatabase()` is called in `beforeEach`
2. Verify all tables are listed in the truncation order
3. Ensure foreign key constraints are respected in the table order
