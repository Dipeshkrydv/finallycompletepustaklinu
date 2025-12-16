#!/bin/bash

# Configuration
HOST="46.202.139.33"
PORT="65002"
USER="u443145865"
# Try generic path first, then domain specific if needed
REMOTE_COMMANDS="
    echo '--- Connected to Server ---'
    if [ -d 'domains/peachpuff-antelope-325258.hostingersite.com/public_html' ]; then
        cd domains/peachpuff-antelope-325258.hostingersite.com/public_html
    else
        cd public_html
    fi
    echo 'Current Directory:'
    pwd
    echo '--- Installing Dependencies (this may take a minute) ---'
    npm install
    echo '--- Building Application (this takes 3-5 minutes) ---'
    npm run build
    echo '--- BUILD COMPLETE ---'
"

echo "=========================================="
echo "  Deploying to Hostinger via SSH"
echo "=========================================="
echo "Connecting to $USER@$HOST..."
echo "Please enter your SSH Password when prompted."

ssh -p $PORT $USER@$HOST "$REMOTE_COMMANDS"

echo "=========================================="
echo "  Deployment Script Finished"
echo "  Now Go to Hostinger Dashboard -> Node.js -> RESTART Server"
echo "=========================================="
