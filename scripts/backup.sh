#!/usr/bin/env bash
# Backup and restore for the Aurum Blog SQLite database + uploaded media.
# For production Postgres deployments, swap the `cp` of dev.db for `pg_dump $DATABASE_URL`.
set -euo pipefail

TIMESTAMP=$(date +%Y%m%d-%H%M%S)
OUT_DIR="backups"
mkdir -p "$OUT_DIR"

ARCHIVE="$OUT_DIR/aurum-backup-$TIMESTAMP.tar.gz"

tar -czf "$ARCHIVE" \
  --exclude='public/uploads/.gitkeep' \
  prisma/dev.db public/uploads 2>/dev/null || true

echo "Backup written to $ARCHIVE"
echo "To restore: tar -xzf $ARCHIVE -C ."
