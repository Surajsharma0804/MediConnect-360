#!/bin/bash
# MediConnect 360 - Automated Backup Script

set -e

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backups/mediconnect"
S3_BUCKET="s3://mediconnect-backups"

echo "Starting backup at $TIMESTAMP"

# Backup PostgreSQL Database
echo "Backing up database..."
pg_dump $DATABASE_URL > "$BACKUP_DIR/db_$TIMESTAMP.sql"
gzip "$BACKUP_DIR/db_$TIMESTAMP.sql"

# Backup uploaded files
echo "Backing up files..."
tar -czf "$BACKUP_DIR/files_$TIMESTAMP.tar.gz" /app/uploads

# Upload to S3
echo "Uploading to S3..."
aws s3 cp "$BACKUP_DIR/db_$TIMESTAMP.sql.gz" "$S3_BUCKET/database/"
aws s3 cp "$BACKUP_DIR/files_$TIMESTAMP.tar.gz" "$S3_BUCKET/files/"

# Cleanup old backups (keep last 30 days)
echo "Cleaning up old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

# Verify backup
echo "Verifying backup..."
aws s3 ls "$S3_BUCKET/database/db_$TIMESTAMP.sql.gz"

echo "Backup completed successfully at $(date)"

# Send notification
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"✅ MediConnect backup completed: $TIMESTAMP\"}"
