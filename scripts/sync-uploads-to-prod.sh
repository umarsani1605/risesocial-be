#!/bin/bash

# Sync Uploads to Production Script
# Usage: ./sync-uploads-to-prod.sh [prod-server-ip]

PROD_SERVER=${1:-"your-production-server-ip"}
PROD_USER=${2:-"root"}
PROD_UPLOADS_PATH="/path/to/production/uploads"
LOCAL_UPLOADS="./uploads"

if [ "$PROD_SERVER" = "your-production-server-ip" ]; then
    echo "❌ Please provide production server IP"
    echo "Usage: $0 [prod-server-ip] [username]"
    echo ""
    echo "Example: $0 123.456.789.0 root"
    exit 1
fi

echo "🚀 Syncing uploads to production server: $PROD_SERVER"
echo "📁 Local uploads: $LOCAL_UPLOADS"
echo "📁 Production uploads: $PROD_UPLOADS_PATH"
echo ""

# Check if local uploads exist
if [ ! -d "$LOCAL_UPLOADS" ]; then
    echo "❌ Local uploads directory not found: $LOCAL_UPLOADS"
    exit 1
fi

# Count local files
LOCAL_FILE_COUNT=$(find "$LOCAL_UPLOADS" -type f | wc -l)
echo "📊 Local files found: $LOCAL_FILE_COUNT"

# Create backup on production first
echo "🔄 Creating backup on production server..."
ssh "$PROD_USER@$PROD_SERVER" "cd $PROD_UPLOADS_PATH && tar -czf ../uploads_backup_$(date +%Y%m%d_%H%M%S).tar.gz ."

if [ $? -ne 0 ]; then
    echo "❌ Failed to create backup on production server"
    exit 1
fi

echo "✅ Production backup created"

# Sync files to production
echo "🔄 Syncing files to production..."
rsync -avz --progress --delete "$LOCAL_UPLOADS/" "$PROD_USER@$PROD_SERVER:$PROD_UPLOADS_PATH/"

if [ $? -eq 0 ]; then
    echo "✅ Sync completed successfully!"
    
    # Verify file count on production
    PROD_FILE_COUNT=$(ssh "$PROD_USER@$PROD_SERVER" "find $PROD_UPLOADS_PATH -type f | wc -l")
    echo "📊 Production files: $PROD_FILE_COUNT"
    echo "📊 Local files: $LOCAL_FILE_COUNT"
    
    if [ "$LOCAL_FILE_COUNT" -eq "$PROD_FILE_COUNT" ]; then
        echo "✅ File count matches!"
    else
        echo "⚠️  File count mismatch - please check manually"
    fi
else
    echo "❌ Sync failed!"
    exit 1
fi
