#!/bin/bash

# Price Feed Service Status Check

echo "🔍 Price Feed Service Status Check"
echo "=================================="

# Check if process is running
if [ -f "price_feed.pid" ]; then
    PID=$(cat price_feed.pid)
    if ps -p $PID > /dev/null 2>&1; then
        echo "✅ Service is RUNNING (PID: $PID)"
    else
        echo "❌ Service is NOT RUNNING (PID file exists but process dead)"
    fi
else
    echo "❌ Service is NOT RUNNING (no PID file)"
fi

# Check recent logs
echo ""
echo "📊 Recent Log Activity:"
if [ -f "logs/price_feed.log" ]; then
    echo "Last 5 log entries:"
    tail -5 logs/price_feed.log
else
    echo "No log file found"
fi

# Check backend connection
echo ""
echo "🌐 Backend Connection:"
BACKEND_RESPONSE=$(dfx canister call --network ic w2ssx-6aaaa-aaaam-qd3aa-cai get_market_summary --query 2>/dev/null | grep -o 'price = [0-9.]*' | head -1)
if [ ! -z "$BACKEND_RESPONSE" ]; then
    echo "✅ Backend responding: $BACKEND_RESPONSE"
else
    echo "❌ Backend not responding"
fi

echo ""
echo "🔧 Commands:"
echo "  Start: ./start_permanent.sh"
echo "  Stop: ./stop_permanent.sh"
echo "  Monitor logs: tail -f logs/price_feed.log" 