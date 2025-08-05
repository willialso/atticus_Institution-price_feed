# 🚀 Production Price Feed Service

## Overview
This service provides **permanent, real-time price feeds** for the Institutional Options Platform on the Internet Computer mainnet. It runs continuously and automatically restarts if interrupted.

## ✅ Current Status
- **Service**: ✅ RUNNING PERMANENTLY
- **Backend**: ✅ Connected to IC mainnet
- **Price Feeds**: ✅ Live data from Coinbase & OKX
- **Auto-restart**: ✅ Enabled

## 🔧 Management Commands

### Start Service (Permanent)
```bash
./start_permanent.sh
```
- Starts service in background
- Continues running after terminal closes
- Auto-restarts if process dies

### Stop Service
```bash
./stop_permanent.sh
```
- Gracefully stops the service
- Cleans up process files

### Check Status
```bash
./check_status.sh
```
- Shows if service is running
- Displays recent log activity
- Verifies backend connection

### Monitor Logs
```bash
tail -f logs/price_feed.log
```
- Real-time log monitoring
- Shows live price updates

## 📊 Service Information

### Process Details
- **PID File**: `price_feed.pid`
- **Log File**: `logs/price_feed.log`
- **Backend**: `w2ssx-6aaaa-aaaam-qd3aa-cai` (IC mainnet)
- **Port**: 3002

### Environment Variables
- `BACKEND_CANISTER_ID`: w2ssx-6aaaa-aaaam-qd3aa-cai
- `IC_HOST`: https://ic0.app
- `NODE_ENV`: production
- `LOG_LEVEL`: info

## 🎯 For Investors

### What This Provides
- **Real-time BTC prices** from multiple exchanges
- **Live option chain updates** with accurate Greeks
- **Continuous market data** for portfolio analytics
- **Professional demo experience** with live feeds

### Demo Readiness
- ✅ Service runs 24/7 without manual intervention
- ✅ Automatic recovery from network issues
- ✅ Professional logging and monitoring
- ✅ Ready for institutional presentations

## 🔄 Auto-Restart Features
- Service automatically restarts if it crashes
- Continues running after system reboots (if using systemd)
- Handles network interruptions gracefully
- Maintains persistent connection to IC mainnet

## 📈 Performance
- Updates every 2-3 seconds
- Multiple exchange feeds (Coinbase, OKX)
- Low latency IC mainnet integration
- Professional-grade reliability

---

**🚀 The platform is now production-ready for institutional investor demos!** 