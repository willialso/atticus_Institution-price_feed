# 🚀 Cloud Deployment Guide - Price Feed Service

## Overview
Deploy your price feed service to the cloud for **24/7 availability** and **professional investor demos**.

## 🎯 Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)
**Free tier available, automatic deployments**

1. **Install Railway CLI:**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway:**
   ```bash
   railway login
   ```

3. **Deploy:**
   ```bash
   railway init
   railway up
   ```

4. **Set Environment Variables:**
   ```bash
   railway variables set BACKEND_CANISTER_ID=w2ssx-6aaaa-aaaam-qd3aa-cai
   railway variables set IC_HOST=https://ic0.app
   railway variables set NODE_ENV=production
   railway variables set LOG_LEVEL=info
   ```

5. **Get your URL:**
   ```bash
   railway domain
   ```

### Option 2: Render (Free Tier)
**Simple deployment with automatic scaling**

1. **Connect GitHub repository**
2. **Create new Web Service**
3. **Set build command:** `npm install`
4. **Set start command:** `npm start`
5. **Add environment variables:**
   - `BACKEND_CANISTER_ID=w2ssx-6aaaa-aaaam-qd3aa-cai`
   - `IC_HOST=https://ic0.app`
   - `NODE_ENV=production`

### Option 3: Heroku (Paid)
**Professional platform with monitoring**

1. **Install Heroku CLI:**
   ```bash
   # macOS
   brew tap heroku/brew && brew install heroku
   ```

2. **Deploy:**
   ```bash
   heroku create your-price-feed-app
   git add .
   git commit -m "Deploy price feed service"
   git push heroku main
   ```

3. **Set environment variables:**
   ```bash
   heroku config:set BACKEND_CANISTER_ID=w2ssx-6aaaa-aaaam-qd3aa-cai
   heroku config:set IC_HOST=https://ic0.app
   heroku config:set NODE_ENV=production
   ```

### Option 4: AWS EC2 (Professional)
**Full control, enterprise-grade**

1. **Launch EC2 instance (Ubuntu 22.04)**
2. **SSH into instance:**
   ```bash
   ssh -i your-key.pem ubuntu@your-ec2-ip
   ```

3. **Install dependencies:**
   ```bash
   sudo apt update
   sudo apt install -y nodejs npm git
   ```

4. **Clone and deploy:**
   ```bash
   git clone your-repo-url
   cd price_feed_service
   npm install
   ```

5. **Create systemd service:**
   ```bash
   sudo tee /etc/systemd/system/price-feed.service > /dev/null <<EOF
   [Unit]
   Description=Price Feed Service
   After=network.target

   [Service]
   Type=simple
   User=ubuntu
   WorkingDirectory=/home/ubuntu/price_feed_service
   Environment=BACKEND_CANISTER_ID=w2ssx-6aaaa-aaaam-qd3aa-cai
   Environment=IC_HOST=https://ic0.app
   Environment=NODE_ENV=production
   ExecStart=/usr/bin/node src/index.js
   Restart=always
   RestartSec=10

   [Install]
   WantedBy=multi-user.target
   EOF
   ```

6. **Start service:**
   ```bash
   sudo systemctl daemon-reload
   sudo systemctl enable price-feed
   sudo systemctl start price-feed
   ```

## 🔧 Environment Variables

All deployments need these environment variables:

```bash
BACKEND_CANISTER_ID=w2ssx-6aaaa-aaaam-qd3aa-cai
IC_HOST=https://ic0.app
NODE_ENV=production
LOG_LEVEL=info
PORT=3002
```

## 📊 Monitoring & Health Checks

### Health Check Endpoint
All deployments include a health check at `/health`:

```bash
curl https://your-app-url.railway.app/health
```

Response:
```json
{
  "status": "healthy",
  "timestamp": "2025-08-05T12:00:00.000Z",
  "service": "price-feed-service",
  "canister": "w2ssx-6aaaa-aaaam-qd3aa-cai",
  "priceData": {
    "BTC": true,
    "BTC-PERP": true
  }
}
```

### Logs
- **Railway:** `railway logs`
- **Render:** Dashboard → Logs
- **Heroku:** `heroku logs --tail`
- **AWS:** `sudo journalctl -u price-feed -f`

## 🎯 For Investors

### What This Provides
- ✅ **24/7 Live Price Feeds** - No dependency on your computer
- ✅ **Professional Reliability** - Cloud-grade uptime
- ✅ **Automatic Scaling** - Handles multiple users
- ✅ **Monitoring** - Health checks and alerts
- ✅ **Global Access** - Available worldwide

### Demo Readiness
- ✅ **Always Available** - Investors can access anytime
- ✅ **Live Data** - Real-time market updates
- ✅ **Professional** - Enterprise-grade infrastructure
- ✅ **Scalable** - Ready for institutional use

## 🚀 Recommended: Railway Deployment

**Why Railway?**
- ✅ Free tier available
- ✅ Automatic deployments from Git
- ✅ Built-in monitoring
- ✅ Easy environment variable management
- ✅ Professional reliability

**Deploy in 5 minutes:**
1. Push code to GitHub
2. Connect Railway to your repo
3. Set environment variables
4. Deploy automatically

---

**🎉 Your platform will be truly 24/7 and ready for institutional investors!** 