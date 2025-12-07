#!/bin/bash
# MediConnect 360 - Disaster Recovery Script

set -e

BACKUP_TIMESTAMP=$1
S3_BUCKET="s3://mediconnect-backups"

if [ -z "$BACKUP_TIMESTAMP" ]; then
  echo "Usage: ./disaster-recovery.sh <backup_timestamp>"
  echo "Example: ./disaster-recovery.sh 20251207_120000"
  exit 1
fi

echo "Starting disaster recovery for backup: $BACKUP_TIMESTAMP"

# Download backup from S3
echo "Downloading backup from S3..."
aws s3 cp "$S3_BUCKET/database/db_$BACKUP_TIMESTAMP.sql.gz" /tmp/
aws s3 cp "$S3_BUCKET/files/files_$BACKUP_TIMESTAMP.tar.gz" /tmp/

# Restore database
echo "Restoring database..."
gunzip /tmp/db_$BACKUP_TIMESTAMP.sql.gz
psql $DATABASE_URL < /tmp/db_$BACKUP_TIMESTAMP.sql

# Restore files
echo "Restoring files..."
tar -xzf /tmp/files_$BACKUP_TIMESTAMP.tar.gz -C /app/

# Verify restoration
echo "Verifying restoration..."
psql $DATABASE_URL -c "SELECT COUNT(*) FROM users;"

# Restart services
echo "Restarting services..."
kubectl rollout restart deployment/mediconnect-backend
kubectl rollout restart deployment/mediconnect-frontend

echo "Disaster recovery completed successfully!"

# Send notification
curl -X POST $SLACK_WEBHOOK_URL \
  -H 'Content-Type: application/json' \
  -d "{\"text\":\"🚨 MediConnect disaster recovery completed: $BACKUP_TIMESTAMP\"}"
