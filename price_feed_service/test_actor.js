import { HttpAgent, Actor } from '@dfinity/agent';
import { Principal } from '@dfinity/principal';
import { idlFactory } from '../src/declarations/institutional_options_backend/institutional_options_backend.did.mjs';

console.log('🚀 Starting Actor test...');

async function testActor() {
  try {
    // Initialize agent
    const { AnonymousIdentity } = await import('@dfinity/agent');
    const identity = new AnonymousIdentity();
    
    const agent = new HttpAgent({ 
      host: 'https://ic0.app',
      identity: identity
    });
    
    await agent.fetchRootKey();
    console.log('✅ Agent initialized');
    
    // Create Actor
    const canisterId = Principal.fromText('w2ssx-6aaaa-aaaam-qd3aa-cai');
    const backend = Actor.createActor(idlFactory, {
      agent,
      canisterId
    });
    
    console.log('✅ Actor created:', backend);
    
    // Test call
    const testMarketData = {
      symbol: 'BTC',
      price: 114856.18,
      change_24h: 0.0,
      volume_24h: 1000000.0,
      high_24h: 115000.0,
      low_24h: 114000.0,
      timestamp: BigInt(Date.now() * 1000000)
    };
    
    console.log('🔄 Testing update_market_data with:', testMarketData);
    const result = await backend.update_market_data(testMarketData);
    console.log('✅ Update result:', result);
    
    // Test get_market_summary
    console.log('🔄 Testing get_market_summary...');
    const summary = await backend.get_market_summary();
    console.log('✅ Market summary:', summary);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('❌ Stack:', error.stack);
  }
}

testActor(); 