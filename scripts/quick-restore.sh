#!/bin/bash

# Quick Restore Uploads Script
# This script helps restore uploads from various sources

echo "🚀 Quick Restore Uploads Script"
echo "================================"

# Check current status
echo "📊 Current uploads status:"
if [ -d "uploads" ]; then
    FILE_COUNT=$(find uploads -type f | wc -l)
    echo "✅ Uploads folder exists with $FILE_COUNT files"
else
    echo "❌ Uploads folder not found"
fi

echo ""
echo "🔧 Choose restore method:"
echo "1. Create backup of current uploads"
echo "2. Restore from local backup"
echo "3. Sync to production server"
echo "4. Check file integrity"
echo "5. Exit"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        echo "🔄 Creating backup..."
        mkdir -p backups
        tar -czf "backups/uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz" uploads/
        echo "✅ Backup created!"
        ;;
    2)
        echo "🔄 Restoring from backup..."
        if [ -d "backups" ]; then
            LATEST_BACKUP=$(ls -t backups/uploads_backup_*.tar.gz 2>/dev/null | head -1)
            if [ -n "$LATEST_BACKUP" ]; then
                echo "📦 Found backup: $LATEST_BACKUP"
                tar -xzf "$LATEST_BACKUP"
                echo "✅ Restore completed!"
            else
                echo "❌ No backup found"
            fi
        else
            echo "❌ Backups directory not found"
        fi
        ;;
    3)
        read -p "Enter production server IP: " PROD_IP
        read -p "Enter username (default: root): " USERNAME
        USERNAME=${USERNAME:-root}
        
        echo "🔄 Syncing to production server $PROD_IP..."
        rsync -avz --progress uploads/ "$USERNAME@$PROD_IP:/path/to/uploads/"
        ;;
    4)
        echo "🔍 Checking file integrity..."
        if [ -d "uploads" ]; then
            echo "📁 Images: $(find uploads/images -type f 2>/dev/null | wc -l)"
            echo "📁 Documents: $(find uploads/documents -type f 2>/dev/null | wc -l)"
            echo "📁 Total: $(find uploads -type f | wc -l)"
        fi
        ;;
    5)
        echo "👋 Goodbye!"
        exit 0
        ;;
    *)
        echo "❌ Invalid choice"
        exit 1
        ;;
esac
