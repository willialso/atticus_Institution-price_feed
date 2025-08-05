#!/bin/bash

# Stop Permanent Price Feed Service

echo "🛑 Stopping Price Feed Service..."

# Check if PID file exists
if [ -f "price_feed.pid" ]; then
    PID=$(cat price_feed.pid)
    echo "📋 Found process ID: $PID"
    
    # Kill the process
    if kill $PID 2>/dev/null; then
        echo "✅ Successfully stopped process $PID"
    else
        echo "⚠️  Process $PID not found or already stopped"
    fi
    
    # Remove PID file
    rm -f price_feed.pid
else
    echo "📋 No PID file found, killing any price feed processes..."
fi

# Also kill any remaining price feed processes
pkill -f "node.*src/index.js" || true

echo "✅ Price Feed Service stopped" 