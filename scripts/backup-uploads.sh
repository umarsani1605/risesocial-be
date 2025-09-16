#!/bin/bash

# Backup Uploads Script
# Usage: ./backup-uploads.sh [backup|restore]

BACKUP_DIR="./backups"
UPLOADS_DIR="./uploads"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_NAME="uploads_backup_${TIMESTAMP}.tar.gz"

backup_uploads() {
    echo "🔄 Creating backup of uploads folder..."
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create tar.gz backup
    tar -czf "$BACKUP_DIR/$BACKUP_NAME" -C "$(dirname "$UPLOADS_DIR")" "$(basename "$UPLOADS_DIR")"
    
    if [ $? -eq 0 ]; then
        echo "✅ Backup created successfully: $BACKUP_DIR/$BACKUP_NAME"
        echo "📁 Backup size: $(du -h "$BACKUP_DIR/$BACKUP_NAME" | cut -f1)"
    else
        echo "❌ Backup failed!"
        exit 1
    fi
}

restore_uploads() {
    echo "🔄 Restoring uploads from backup..."
    
    # Find latest backup
    LATEST_BACKUP=$(ls -t "$BACKUP_DIR"/uploads_backup_*.tar.gz 2>/dev/null | head -1)
    
    if [ -z "$LATEST_BACKUP" ]; then
        echo "❌ No backup found in $BACKUP_DIR"
        exit 1
    fi
    
    echo "📦 Found backup: $LATEST_BACKUP"
    
    # Restore from backup
    tar -xzf "$LATEST_BACKUP" -C "$(dirname "$UPLOADS_DIR")"
    
    if [ $? -eq 0 ]; then
        echo "✅ Restore completed successfully!"
        echo "📁 Files restored:"
        find "$UPLOADS_DIR" -type f | wc -l
    else
        echo "❌ Restore failed!"
        exit 1
    fi
}

list_backups() {
    echo "📋 Available backups:"
    if [ -d "$BACKUP_DIR" ]; then
        ls -la "$BACKUP_DIR"/uploads_backup_*.tar.gz 2>/dev/null || echo "No backups found"
    else
        echo "Backup directory doesn't exist"
    fi
}

case "$1" in
    "backup")
        backup_uploads
        ;;
    "restore")
        restore_uploads
        ;;
    "list")
        list_backups
        ;;
    *)
        echo "Usage: $0 [backup|restore|list]"
        echo ""
        echo "Commands:"
        echo "  backup   - Create backup of uploads folder"
        echo "  restore  - Restore uploads from latest backup"
        echo "  list     - List available backups"
        exit 1
        ;;
esac
