#!/bin/bash

# Setup Test Database Script
# Creates test database and runs migrations

echo "Setting up test database..."

# Set environment to test
export NODE_ENV=test
export DATABASE_URL="postgresql://postgres:password@localhost:5432/risesocial_test?schema=public"

# Create test database if it doesn't exist
echo "Creating test database..."
psql -U postgres -h localhost -c "DROP DATABASE IF EXISTS risesocial_test;" 2>/dev/null || true
psql -U postgres -h localhost -c "CREATE DATABASE risesocial_test;" 2>/dev/null || true

# Run migrations on test database
echo "Running migrations..."
npx prisma migrate deploy --schema=./prisma/schema.prisma

echo "Test database setup complete!"
