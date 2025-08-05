#!/bin/bash

# Permanent Price Feed Service Deployment (No sudo required)
# This script keeps the service running in the background permanently

# Set environment variables
export BACKEND_CANISTER_ID=w2ssx-6aaaa-aaaam-qd3aa-cai
export IC_HOST=https://ic0.app
export PORT=3002
export NODE_ENV=production
export LOG_LEVEL=info

# Create logs directory
mkdir -p logs

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
fi

# Kill any existing price feed processes
echo "🛑 Stopping any existing price feed processes..."
pkill -f "node.*src/index.js" || true
sleep 2

# Start the service in the background with nohup
echo "🚀 Starting Price Feed Service permanently..."
nohup node src/index.js > logs/price_feed.log 2>&1 &

# Save the process ID
echo $! > price_feed.pid

echo "✅ Price Feed Service started with PID: $(cat price_feed.pid)"
echo "📊 Logs are being written to: logs/price_feed.log"
echo "🔍 To monitor logs: tail -f logs/price_feed.log"
echo "🛑 To stop service: ./stop_permanent.sh"
echo ""
echo "🚀 Service will continue running even if you close this terminal!" 