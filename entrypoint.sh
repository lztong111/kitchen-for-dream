#!/bin/sh
set -e

cd /app/server

npx tsx src/db/migrate.ts

if [ ! -f /app/data/.seeded ]; then
  npx tsx src/db/seed.ts
  touch /app/data/.seeded
fi

cd /app
exec npx tsx server/src/app.ts
