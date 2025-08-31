#!/bin/bash

echo "Setting up SDR Grok database..."

# Wait for database to be ready
echo "Waiting for database to be ready..."
until docker compose exec -T db pg_isready -U postgres; do
  echo "Database not ready, waiting..."
  sleep 2
done

echo "Database is ready!"

# Run Prisma migrations
echo "Running Prisma migrations..."
cd backend
npx prisma migrate deploy
npx prisma generate

# Seed the database
echo "Seeding database..."
npx tsx src/prisma/seed.ts

echo "Database setup complete!"
