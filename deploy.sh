#!/bin/bash

# Production Deployment Script

echo "🚀 Starting Deployment..."

# 1. Pull latest changes
echo "📥 Pulling latest code..."
git pull origin main

# 2. Install Dependencies
echo "📦 Installing/Updating dependencies..."
npm install --production=false

# 3. Build Application
echo "🏗️ Building application..."
npm run build

# 4. Start/Restart Application
# Check if PM2 is installed
if command -v pm2 &> /dev/null
then
    echo "🔄 Restarting via PM2..."
    pm2 restart old-book-platform || pm2 start npm --name "old-book-platform" -- start
else
    echo "⚠️ PM2 not found. Starting with npm..."
    echo "ℹ️ Recommendation: Install PM2 for production (npm install -g pm2)"
    # Run in background if not using PM2 key
    nohup npm start > app.log 2>&1 &
fi

echo "✅ Deployment Complete!"
echo "----------------------------------------"
echo "🌐 App should be running on port 3000 (or configured PORT)."
