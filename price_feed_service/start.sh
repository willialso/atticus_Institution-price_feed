#!/bin/bash

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

# Start the price feed service
echo "Starting Price Feed Service..."
echo "Backend Canister ID: $BACKEND_CANISTER_ID"
echo "IC Host: $IC_HOST"
echo "Port: $PORT"

npm start 