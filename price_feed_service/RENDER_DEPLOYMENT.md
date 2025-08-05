# 🚀 Render Deployment Guide - Price Feed Service

## Overview
Deploy your price feed service to Render's **free tier** for 24/7 availability.

## ✅ Prerequisites
- GitHub account
- Render account (free)

## 🎯 Step-by-Step Deployment

### Step 1: Push Code to GitHub
```bash
# If you haven't already, push your code to GitHub
git add .
git commit -m "Add price feed service for cloud deployment"
git push origin main
```

### Step 2: Deploy to Render

1. **Go to [render.com](https://render.com)**
2. **Sign up/Login** with your GitHub account
3. **Click "New +"** → **"Web Service"**
4. **Connect your GitHub repository**
5. **Configure the service:**

   **Name:** `price-feed-service`
   
   **Environment:** `Node`
   
   **Build Command:** `npm install`
   
   **Start Command:** `npm start`
   
   **Plan:** `Free`

6. **Add Environment Variables:**
   - `BACKEND_CANISTER_ID` = `w2ssx-6aaaa-aaaam-qd3aa-cai`
   - `IC_HOST` = `https://ic0.app`
   - `NODE_ENV` = `production`
   - `LOG_LEVEL` = `info`
   - `PORT` = `3002`

7. **Click "Create Web Service"**

### Step 3: Monitor Deployment
- Render will automatically build and deploy your service
- You'll get a URL like: `https://price-feed-service.onrender.com`
- Check the logs to ensure everything is working

### Step 4: Test Health Check
```bash
curl https://your-app-name.onrender.com/health
```

Expected response:
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

## 🔧 Management

### View Logs
- Go to your Render dashboard
- Click on your service
- Go to "Logs" tab

### Environment Variables
- Dashboard → Your Service → "Environment" tab
- Add/modify variables as needed

### Restart Service
- Dashboard → Your Service → "Manual Deploy"

## 📊 Free Tier Limits
- **750 hours/month** (enough for 24/7)
- **512 MB RAM**
- **Shared CPU**
- **Automatic sleep** after 15 minutes of inactivity (wakes on request)

## 🎯 For Investors

### What This Provides
- ✅ **24/7 Live Price Feeds** - No dependency on your computer
- ✅ **Professional Reliability** - Cloud-grade uptime
- ✅ **Free Hosting** - No ongoing costs
- ✅ **Automatic Scaling** - Handles multiple users
- ✅ **Global Access** - Available worldwide

### Demo Readiness
- ✅ **Always Available** - Investors can access anytime
- ✅ **Live Data** - Real-time market updates
- ✅ **Professional** - Enterprise-grade infrastructure
- ✅ **Scalable** - Ready for institutional use

## 🚀 Benefits of Render
- **Free tier** with generous limits
- **Automatic deployments** from GitHub
- **Built-in monitoring** and logs
- **Easy environment variable management**
- **Professional reliability**

---

**🎉 Your platform will be truly 24/7 and ready for institutional investors!** 