#!/bin/bash

# MediConnect 360 - Database Backup Script
set -e

# Load environment variables
if [ -f .env ]; then
    source .env
fi

# Default values
POSTGRES_USER=${POSTGRES_USER:-postgres}
POSTGRES_DB=${POSTGRES_DB:-mediconnect}
BACKUP_DIR=${BACKUP_DIR:-./backups}

# Create backup directory
mkdir -p $BACKUP_DIR

# Generate timestamp
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")

# Backup PostgreSQL
echo "Creating PostgreSQL backup..."
pg_dump -h postgres -U $POSTGRES_USER -d $POSTGRES_DB > $BACKUP_DIR/postgres_backup_$TIMESTAMP.sql

# Backup Redis (if running)
echo "Creating Redis backup..."
redis-cli -h redis --rdb $BACKUP_DIR/redis_backup_$TIMESTAMP.rdb

# Compress backups
echo "Compressing backups..."
tar -czf $BACKUP_DIR/mediconnect_backup_$TIMESTAMP.tar.gz $BACKUP_DIR/*_backup_$TIMESTAMP.*

# Clean up individual files
rm $BACKUP_DIR/postgres_backup_$TIMESTAMP.sql
rm $BACKUP_DIR/redis_backup_$TIMESTAMP.rdb

# Remove backups older than 7 days
find $BACKUP_DIR -name "mediconnect_backup_*.tar.gz" -mtime +7 -delete

echo "Backup completed: $BACKUP_DIR/mediconnect_backup_$TIMESTAMP.tar.gz"