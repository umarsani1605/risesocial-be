import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['tests/setup-env.js'],
    globalTeardown: ['tests/teardown.js'],
    globals: true,
    
    // Coverage configuration
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'json'],
      reportsDirectory: './coverage',
      
      // Include source files for coverage
      include: ['src/**/*.js'],
      
      // Exclude non-testable files
      exclude: [
        'node_modules/**',
        'src/schemas/**',
        'src/server.js',
        'prisma/**',
        'tests/**',
        '**/*.config.js',
      ],
      
      // Coverage thresholds (70% target)
      thresholds: {
        global: {
          lines: 70,
          functions: 70,
          branches: 70,
          statements: 70,
        },
      },
    },
    
    // Test file patterns
    include: ['tests/**/*.test.js'],
    
    // Timeout for tests
    testTimeout: 10000,
  },
});
