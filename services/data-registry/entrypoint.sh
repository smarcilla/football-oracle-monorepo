#!/bin/sh
set -e

# entrypoint.sh for data-registry service

if [ -z "$DATABASE_URL" ]; then
  echo "DATABASE_URL is not set; skipping migrations."
else
  export DATABASE_URL=$DATABASE_URL
  # Move to the service directory where prisma.config.js is located
  cd /app/services/data-registry
  
  if [ -f "prisma.config.js" ]; then
    echo "Found prisma.config.js in $(pwd)"
  else
    echo "WARNING: prisma.config.js NOT found in $(pwd)"
    ls -la
  fi
  
  PRISMA_SCHEMA="prisma/schema.prisma"
  
  echo "Applying migrations via 'prisma migrate deploy'..."
  # Use the local prisma binary to avoid downloading it again and to ensure Prisma 7 version
  ./node_modules/.bin/prisma migrate deploy --schema=$PRISMA_SCHEMA

  if [ "$NODE_ENV" != "production" ]; then
    echo "Development mode: ensuring client is up to date..."
  fi

  # Go back to /app for the CMD execution
  cd /app
fi

# Hand over to the command specified in the Dockerfile (CMD)
exec "$@"
