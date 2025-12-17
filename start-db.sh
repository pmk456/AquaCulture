#!/usr/bin/env bash
set -e

DB_NAME="aquaculture_crm"
DB_USER="${DB_USER:-$(whoami)}"
SERVICE_NAME="postgresql@14"

echo "Starting PostgreSQL ($SERVICE_NAME) via Homebrew..."
brew services start "$SERVICE_NAME" >/dev/null 2>&1 || true

echo "Waiting for Postgres to accept connections..."
until pg_isready -h localhost -U "$DB_USER" >/dev/null 2>&1; do
  sleep 1
done

echo "Postgres is up."

# Check if database exists
DB_EXISTS=$(psql -h localhost -U "$DB_USER" -d postgres -tAc "SELECT 1 FROM pg_database WHERE datname='$DB_NAME'" || echo "0")

if [ "$DB_EXISTS" != "1" ]; then
  echo "Creating database '$DB_NAME'..."
  createdb -h localhost -U "$DB_USER" "$DB_NAME"
else
  echo "Database '$DB_NAME' already exists."
fi

echo "Current databases:"
psql -h localhost -U "$DB_USER" -d postgres -c "\l" | grep "$DB_NAME" || true

echo "Database ready: $DB_NAME (user: $DB_USER)"