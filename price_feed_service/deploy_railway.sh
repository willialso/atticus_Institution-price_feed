#!/bin/bash

# Railway Quick Deployment Script
echo "🚀 Deploying Price Feed Service to Railway..."

# Check if Railway CLI is installed
if ! command -v railway &> /dev/null; then
    echo "📦 Installing Railway CLI..."
    npm install -g @railway/cli
fi

# Check if logged in
if ! railway whoami &> /dev/null; then
    echo "🔑 Please login to Railway..."
    railway login
fi

# Initialize Railway project (if not already done)
if [ ! -f "railway.json" ]; then
    echo "❌ railway.json not found. Please ensure you're in the price_feed_service directory."
    exit 1
fi

# Deploy to Railway
echo "🚀 Deploying to Railway..."
railway up

# Set environment variables
echo "🔧 Setting environment variables..."
railway variables set BACKEND_CANISTER_ID=w2ssx-6aaaa-aaaam-qd3aa-cai
railway variables set IC_HOST=https://ic0.app
railway variables set NODE_ENV=production
railway variables set LOG_LEVEL=info

# Get the deployment URL
echo "🌐 Getting deployment URL..."
DEPLOY_URL=$(railway domain)
echo "✅ Deployed to: $DEPLOY_URL"

# Test health check
echo "🏥 Testing health check..."
sleep 10
curl -s "$DEPLOY_URL/health" | jq '.' || echo "Health check not ready yet"

echo ""
echo "🎉 Deployment complete!"
echo "📊 Monitor logs: railway logs"
echo "🔧 Manage: railway dashboard"
echo "🏥 Health check: $DEPLOY_URL/health"
echo ""
echo "🚀 Your price feed service is now running 24/7 in the cloud!" 