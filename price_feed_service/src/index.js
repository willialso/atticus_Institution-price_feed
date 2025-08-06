import WebSocket from 'ws';
import axios from 'axios';
import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import cron from 'node-cron';
import winston from 'winston';
import dotenv from 'dotenv';
import express from 'express';



dotenv.config();

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
});

// IC Canister Configuration
const CANISTER_ID = process.env.BACKEND_CANISTER_ID || 'w2ssx-6aaaa-aaaam-qd3aa-cai';
const IC_HOST = process.env.IC_HOST || 'https://ic0.app';

// Initialize IC Agent with proper identity handling for latest version
const { AnonymousIdentity } = await import('@dfinity/agent');
const identity = new AnonymousIdentity();

// Create agent with proper configuration
const agent = new HttpAgent({ 
  host: IC_HOST,
  identity: identity
});

// Wait for agent to be ready
await agent.fetchRootKey();

// Create canister interface using Actor pattern
const canisterId = Principal.fromText(CANISTER_ID);

// Import the generated IDL factory
const { idlFactory } = await import('../institutional_options_backend.did.mjs');

// Create Actor instance
const backend = Actor.createActor(idlFactory, {
  agent,
  canisterId
});

// Log the identity principal for debugging
logger.info(`🔑 Using identity: ${identity.getPrincipal().toText()}`);
logger.info(`🎯 Target canister: ${canisterId.toText()}`);

// Test canister connection on startup
async function testCanisterConnection() {
  try {
    logger.info(`🔍 Testing connection to canister ${canisterId.toText()}...`);
    const result = await backend.get_market_summary();
    logger.info(`✅ Canister connection successful! Current BTC price: $${result.Ok?.price || 'N/A'}`);
    return true;
  } catch (error) {
    logger.error(`❌ Canister connection failed: ${error.message}`);
    logger.error(`🔧 Please ensure canister is deployed and accessible`);
    return false;
  }
}

// Price data storage - ONLY live data, no fallbacks
let priceData = {
  BTC: {
    price: 0,
    change_24h: 0,
    volume_24h: 0,
    high_24h: 0,
    low_24h: 0,
    timestamp: 0,
    exchanges: {},
    lastUpdate: 0
  },
  'BTC-PERP': {
    price: 0,
    change_24h: 0,
    volume_24h: 0,
    high_24h: 0,
    low_24h: 0,
    timestamp: 0,
    exchanges: {},
    lastUpdate: 0
  }
};

// Express app for health checks
const app = express();
const PORT = process.env.PORT || 3002;

// Health check endpoint
app.get('/health', (req, res) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'price-feed-service',
    canister: CANISTER_ID,
    priceData: {
      BTC: priceData.BTC.price > 0,
      'BTC-PERP': priceData['BTC-PERP'].price > 0
    }
  };
  res.json(health);
});

// Start health check server
app.listen(PORT, () => {
  logger.info(`🏥 Health check server running on port ${PORT}`);
});

// Exchange WebSocket configurations - optimized for reliability
const exchanges = {
  okx: {
    name: 'okx',
    wsUrl: 'wss://ws.okx.com:8443/ws/v5/public',
    symbols: ['BTC', 'BTC-PERP'],
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },
  bybit: {
    name: 'bybit',
    wsUrl: 'wss://stream.bybit.com/v5/public/linear',
    symbols: ['BTC', 'BTC-PERP'],
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },
  kraken: {
    name: 'kraken',
    wsUrl: 'wss://ws.kraken.com',
    symbols: ['BTC'],
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  },
  coinbase: {
    name: 'coinbase',
    wsUrl: 'wss://ws-feed.exchange.coinbase.com',
    symbols: ['BTC'],
    reconnectInterval: 5000,
    maxReconnectAttempts: 10
  }
};

// WebSocket connections with reconnection tracking
const connections = {};
const reconnectAttempts = {};

// Initialize WebSocket connections with improved error handling
function initializeWebSockets() {
  Object.entries(exchanges).forEach(([key, exchange]) => {
    initializeExchangeWebSocket(exchange);
  });
}

function initializeExchangeWebSocket(exchange) {
  try {
    logger.info(`🔌 Initializing WebSocket for ${exchange.name}`);
    
    const ws = new WebSocket(exchange.wsUrl, {
      handshakeTimeout: 10000,
      perMessageDeflate: false
    });
    
    ws.on('open', () => {
      logger.info(`✅ Connected to ${exchange.name} WebSocket`);
      reconnectAttempts[exchange.name] = 0;
      subscribeToFeeds(ws, exchange);
    });
    
    ws.on('message', (data) => {
      try {
        const message = JSON.parse(data);
        processMessage(exchange.name, message);
      } catch (error) {
        logger.error(`❌ Error parsing message from ${exchange.name}:`, error);
      }
    });
    
    ws.on('error', (error) => {
      logger.error(`❌ WebSocket error for ${exchange.name}:`, error.message);
    });
    
    ws.on('close', (code, reason) => {
      logger.warn(`🔌 WebSocket closed for ${exchange.name} (${code}: ${reason})`);
      handleReconnection(exchange);
    });
    
    ws.on('ping', () => {
      ws.pong();
    });
    
    connections[exchange.name] = ws;
    
  } catch (error) {
    logger.error(`❌ Error initializing ${exchange.name} WebSocket:`, error);
    handleReconnection(exchange);
  }
}

function handleReconnection(exchange) {
  const attempts = reconnectAttempts[exchange.name] || 0;
  
  if (attempts < exchange.maxReconnectAttempts) {
    reconnectAttempts[exchange.name] = attempts + 1;
    const delay = exchange.reconnectInterval * Math.pow(2, attempts);
    
    logger.info(`🔄 Reconnecting to ${exchange.name} in ${delay}ms (attempt ${attempts + 1}/${exchange.maxReconnectAttempts})`);
    
    setTimeout(() => {
      initializeExchangeWebSocket(exchange);
    }, delay);
  } else {
    logger.error(`❌ Max reconnection attempts reached for ${exchange.name}`);
  }
}

// Subscribe to specific feeds based on exchange
function subscribeToFeeds(ws, exchange) {
  try {
    switch (exchange.name) {
      case 'okx':
        ws.send(JSON.stringify({
          op: 'subscribe',
          args: [
            { channel: 'tickers', instId: 'BTC-USDT' },
            { channel: 'tickers', instId: 'BTC-USDT-SWAP' }
          ]
        }));
        logger.info(`📡 Subscribed to OKX feeds: BTC-USDT, BTC-USDT-SWAP`);
        break;
        
      case 'bybit':
        ws.send(JSON.stringify({
          op: 'subscribe',
          args: ['tickers.BTCUSDT']
        }));
        logger.info(`📡 Subscribed to Bybit feed: BTCUSDT`);
        break;
        
      case 'kraken':
        ws.send(JSON.stringify({
          event: 'subscribe',
          pair: ['XBT/USDT'],
          subscription: { name: 'ticker' }
        }));
        logger.info(`📡 Subscribed to Kraken feed: XBT/USDT`);
        break;
        
      case 'coinbase':
        ws.send(JSON.stringify({
          type: 'subscribe',
          product_ids: ['BTC-USD'],
          channels: ['ticker']
        }));
        logger.info(`📡 Subscribed to Coinbase feed: BTC-USD`);
        break;
    }
  } catch (error) {
    logger.error(`❌ Error subscribing to ${exchange.name} feeds:`, error);
  }
}

// Process incoming messages from exchanges with improved parsing
function processMessage(exchangeName, message) {
  try {
    let price = 0;
    let volume = 0;
    let change = 0;
    let high = 0;
    let low = 0;
    let symbol = 'BTC';
    
    switch (exchangeName) {
      case 'okx':
        if (message.data && message.data[0]) {
          const data = message.data[0];
          price = parseFloat(data.last);
          volume = parseFloat(data.vol24h);
          change = parseFloat(data.change24h);
          high = parseFloat(data.high24h);
          low = parseFloat(data.low24h);
          symbol = data.instId.includes('SWAP') ? 'BTC-PERP' : 'BTC';
        }
        break;
        
      case 'bybit':
        if (message.data && message.data[0]) {
          const data = message.data[0];
          price = parseFloat(data.lastPrice);
          volume = parseFloat(data.volume24h);
          change = parseFloat(data.price24hPcnt) * 100;
          high = parseFloat(data.highPrice24h);
          low = parseFloat(data.lowPrice24h);
          symbol = 'BTC-PERP';
        }
        break;
        
      case 'kraken':
        if (message[1] && message[1].c) {
          price = parseFloat(message[1].c[0]);
          volume = parseFloat(message[1].v[1]);
          change = parseFloat(message[1].p[1]) - parseFloat(message[1].p[0]);
          high = parseFloat(message[1].h[1]);
          low = parseFloat(message[1].l[1]);
        }
        break;
        
      case 'coinbase':
        if (message.type === 'ticker' && message.price) {
          price = parseFloat(message.price);
          volume = parseFloat(message.size);
          change = parseFloat(message.price) - parseFloat(message.open_24h);
          high = parseFloat(message.high_24h);
          low = parseFloat(message.low_24h);
        }
        break;
    }
    
    if (price > 0) {
      updatePriceData(exchangeName, symbol, {
        price,
        volume,
        change,
        high,
        low,
        timestamp: Date.now()
      });
    }
    
  } catch (error) {
    logger.error(`❌ Error processing message from ${exchangeName}:`, error);
  }
}

// Update price data with live data only
function updatePriceData(exchangeName, symbol, data) {
  console.log(`🔍 [updatePriceData] Tick: received live price = $${data.price.toFixed(2)} for ${symbol} from ${exchangeName}`);
  
  if (!priceData[symbol]) {
    priceData[symbol] = {
      price: 0,
      change_24h: 0,
      volume_24h: 0,
      high_24h: 0,
      low_24h: 0,
      timestamp: 0,
      exchanges: {},
      lastUpdate: 0
    };
  }
  
  // Update exchange-specific data
  priceData[symbol].exchanges[exchangeName] = {
    exchange: exchangeName,
    symbol: symbol,
    bid: data.price * 0.9999,
    ask: data.price * 1.0001,
    last: data.price,
    volume: data.volume,
    timestamp: data.timestamp
  };
  
  // Calculate aggregated price data from live feeds only
  const exchangeData = Object.values(priceData[symbol].exchanges);
  if (exchangeData.length > 0) {
    const prices = exchangeData.map(e => e.last).filter(p => p > 0);
    const volumes = exchangeData.map(e => e.volume).filter(v => v > 0);
    const changes = exchangeData.map(e => e.change).filter(c => c !== 0);
    const highs = exchangeData.map(e => e.high).filter(h => h > 0);
    const lows = exchangeData.map(e => e.low).filter(l => l > 0);
    
    if (prices.length > 0) {
      priceData[symbol].price = prices.reduce((a, b) => a + b) / prices.length;
      priceData[symbol].volume_24h = volumes.reduce((a, b) => a + b, 0);
      priceData[symbol].change_24h = changes.reduce((a, b) => a + b, 0) / changes.length;
      priceData[symbol].high_24h = Math.max(...highs);
      priceData[symbol].low_24h = Math.min(...lows);
      priceData[symbol].timestamp = Date.now();
      priceData[symbol].lastUpdate = Date.now();
    }
  }
  
  // Log live data and update IC canister
  logger.info(`✅ LIVE DATA: ${symbol} = $${data.price.toFixed(2)} from ${exchangeName}`);
  
  // Update IC canister every 5 seconds
  console.log(`🔍 [updatePriceData] Checking IC update condition: ${Date.now() - lastICUpdate}ms since last update`);
  if (Date.now() - lastICUpdate > 5000) {
    console.log(`🔍 [updatePriceData] Calling updateICCanister() - condition met`);
    updateICCanister();
    lastICUpdate = Date.now();
  } else {
    console.log(`🔍 [updatePriceData] Skipping IC update - too soon`);
  }
}

let lastICUpdate = 0;

// Update IC canister with live data
async function updateICCanister() {
  console.log(`🔍 [updateICCanister] Function called`);
  try {
    lastICUpdate = Date.now();
    console.log(`🔍 [updateICCanister] Processing ${Object.keys(priceData).length} symbols`);
    
    // Update market data for symbols with live data
    for (const [symbol, data] of Object.entries(priceData)) {
      console.log(`🔍 [updateICCanister] Checking symbol ${symbol}: price=${data.price}, lastUpdate=${data.lastUpdate}, fresh=${data.lastUpdate > Date.now() - 60000}`);
      if (data.price > 0 && data.lastUpdate > Date.now() - 60000) { // Only update if data is fresh (within 1 minute)
        console.log(`🔍 [updateICCanister] Calling updateMarketData for ${symbol}`);
        await updateMarketData(symbol, data);
      } else {
        console.log(`🔍 [updateICCanister] Skipping ${symbol} - price=${data.price}, too old=${data.lastUpdate <= Date.now() - 60000}`);
      }
    }
    
    logger.info('🔄 Updated IC canister with live price data');
    
  } catch (error) {
    console.error('❌ [updateICCanister] CANISTER CALL ERROR:', error);
    logger.error('❌ Error updating IC canister:', error);
  }
}

// Update market data in IC canister using Actor pattern
async function updateMarketData(symbol, data) {
  console.log(`🔍 [updateMarketData] Function called with symbol=${symbol}, price=$${data.price.toFixed(2)}`);
  try {
    const marketSummary = {
      symbol,
      price: data.price,
      change_24h: data.change_24h || 0.0,
      volume_24h: data.volume_24h || 0.0,
      high_24h: data.high_24h || data.price,
      low_24h: data.low_24h || data.price,
      timestamp: BigInt(data.timestamp * 1000000) // Convert to nanoseconds
    };
    
    console.log(`🔍 [updateMarketData] Calling IC canister update_market_data with price = $${data.price.toFixed(2)}`);
    logger.info(`🔄 Calling IC canister update_market_data for ${symbol}: $${data.price.toFixed(2)}`);
    
    // Call IC canister update method using Actor pattern (modern API)
    const result = await backend.update_market_data(marketSummary);
    
    console.log(`🔍 [updateMarketData] Returned from IC update attempt. Result:`, result);
    logger.info(`✅ Successfully updated ${symbol} in IC canister: $${data.price.toFixed(2)}`);
    logger.info(`✅ IC canister update result:`, result);
    
  } catch (error) {
    console.error(`❌ [updateMarketData] CANISTER CALL ERROR for ${symbol}:`, error);
    logger.error(`❌ Error updating market data for ${symbol}:`, error.message);
    logger.error(`❌ Full error:`, error);
    
    // Enhanced error handling for common issues
    if (error.message.includes('getPrincipal')) {
      logger.error('🔧 Identity error detected - check agent setup');
      logger.error('🔧 Identity principal:', identity.getPrincipal().toText());
    } else if (error.message.includes('canister') || error.message.includes('not found')) {
      logger.error('🔧 Canister connection issue - may need to restart price feed service');
      logger.error('🔧 Current canister ID:', canisterId.toText());
    } else if (error.message.includes('timeout') || error.message.includes('network')) {
      logger.error('🔧 Network timeout - check IC network connectivity');
    }
    
    // Log current connection state
    logger.error('🔧 Current agent host:', IC_HOST);
    logger.error('🔧 Current canister ID:', canisterId.toText());
  }
}

// Health check endpoint
async function startHealthCheck() {
  const express = await import('express');
  const app = express.default();
  
  app.get('/health', (req, res) => {
    const activeConnections = Object.keys(connections).filter(name => 
      connections[name].readyState === WebSocket.OPEN
    );
    
    res.json({
      status: 'healthy',
      activeConnections,
      totalExchanges: Object.keys(exchanges),
      priceData: Object.keys(priceData).filter(symbol => priceData[symbol].price > 0),
      lastUpdate: Math.max(...Object.values(priceData).map(d => d.lastUpdate)),
      timestamp: Date.now()
    });
  });
  
  app.get('/prices', (req, res) => {
    res.json(priceData);
  });
  
  app.get('/connections', (req, res) => {
    const connectionStatus = {};
    Object.entries(connections).forEach(([name, ws]) => {
      connectionStatus[name] = {
        status: ws.readyState === WebSocket.OPEN ? 'connected' : 'disconnected',
        readyState: ws.readyState
      };
    });
    res.json(connectionStatus);
  });
  
  const port = process.env.PORT || 3003;
  app.listen(port, () => {
    logger.info(`🏥 Health check server running on port ${port}`);
  });
}

// Main execution
async function main() {
  console.log(`🔍 [main] STARTING price feed service at ${new Date().toISOString()}`);
  logger.info('🚀 Starting Price Feed Service with LIVE DATA ONLY...');
  
  // Test canister connection first
  logger.info('🔍 Testing canister connection...');
  const connectionTest = await testCanisterConnection();
  if (!connectionTest) {
    logger.error('❌ Cannot start price feed service - canister connection failed');
    logger.error('🔧 Please ensure canister is deployed and restart the service');
    process.exit(1);
  }
  
  // Initialize WebSocket connections
  initializeWebSockets();
  
  // Start health check server
  startHealthCheck();
  
  // Manual trigger test at startup
  console.log(`🔍 [main] Testing manual IC update trigger...`);
  setTimeout(async () => {
    console.log(`🔍 [main] Manual trigger: calling updateICCanister() after 10 seconds`);
    await updateICCanister();
  }, 10000);
  
  logger.info('✅ Price Feed Service started successfully');
  logger.info('📊 Monitoring live data from: ' + Object.keys(exchanges).join(', '));
  logger.info('🎯 Will update canister: ' + canisterId.toText());
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  logger.info('🛑 Shutting down Price Feed Service...');
  Object.values(connections).forEach(ws => ws.close());
  process.exit(0);
});

process.on('SIGTERM', () => {
  logger.info('🛑 Shutting down Price Feed Service...');
  Object.values(connections).forEach(ws => ws.close());
  process.exit(0);
});

// Start the service
main().catch(error => {
  logger.error('❌ Failed to start Price Feed Service:', error);
  process.exit(1);
}); // Render deployment fix
