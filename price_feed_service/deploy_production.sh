#!/bin/bash

# Production Deployment Script for Price Feed Service
# This script ensures the service runs continuously with proper monitoring

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

# Create a systemd service file for permanent deployment
sudo tee /etc/systemd/system/price-feed-service.service > /dev/null <<EOF
[Unit]
Description=Institutional Options Price Feed Service
After=network.target

[Service]
Type=simple
User=$USER
WorkingDirectory=$(pwd)
Environment=BACKEND_CANISTER_ID=$BACKEND_CANISTER_ID
Environment=IC_HOST=$IC_HOST
Environment=PORT=$PORT
Environment=NODE_ENV=$NODE_ENV
Environment=LOG_LEVEL=$LOG_LEVEL
ExecStart=/usr/bin/node src/index.js
Restart=always
RestartSec=10
StandardOutput=append:/var/log/price-feed-service.log
StandardError=append:/var/log/price-feed-service.error.log

[Install]
WantedBy=multi-user.target
EOF

# Reload systemd and enable the service
sudo systemctl daemon-reload
sudo systemctl enable price-feed-service
sudo systemctl start price-feed-service

echo "✅ Price Feed Service deployed as systemd service"
echo "📊 Service Status:"
sudo systemctl status price-feed-service --no-pager

echo ""
echo "🔧 Useful Commands:"
echo "  Check status: sudo systemctl status price-feed-service"
echo "  View logs: sudo journalctl -u price-feed-service -f"
echo "  Restart: sudo systemctl restart price-feed-service"
echo "  Stop: sudo systemctl stop price-feed-service"
echo ""
echo "🚀 Service will now start automatically on boot and restart if it crashes!" 