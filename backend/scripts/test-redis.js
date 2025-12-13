#!/usr/bin/env node

/**
 * Redis Connection Test Script
 * Tests Redis connectivity for MediConnect 360
 */

const { createClient } = require('redis');

async function testRedisConnection() {
  console.log('🔍 Testing Redis Connection...\n');

  // Parse Redis URL from environment
  const redisUrl = process.env.REDIS_URL;
  
  if (!redisUrl) {
    console.log('❌ REDIS_URL not found in environment variables');
    console.log('💡 Set REDIS_URL=redis://default:password@host:port');
    process.exit(1);
  }

  console.log(`📡 Connecting to: ${redisUrl.replace(/:[^:@]*@/, ':***@')}`);

  let client;
  
  try {
    // Create Redis client
    client = createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        lazyConnect: true,
      },
    });

    // Handle connection events
    client.on('error', (err) => {
      console.log('❌ Redis Client Error:', err.message);
    });

    client.on('connect', () => {
      console.log('🔗 Redis client connected');
    });

    client.on('ready', () => {
      console.log('✅ Redis client ready');
    });

    // Connect to Redis
    await client.connect();

    // Test basic operations
    console.log('\n🧪 Testing Redis Operations:');
    
    // Set a test key
    await client.set('test:connection', 'success', { EX: 60 });
    console.log('✅ SET operation successful');

    // Get the test key
    const value = await client.get('test:connection');
    console.log(`✅ GET operation successful: ${value}`);

    // Test hash operations (used by sessions)
    await client.hSet('test:hash', { field1: 'value1', field2: 'value2' });
    console.log('✅ HSET operation successful');

    const hashValue = await client.hGetAll('test:hash');
    console.log('✅ HGETALL operation successful:', hashValue);

    // Test list operations (used by queues)
    await client.lPush('test:list', 'item1', 'item2');
    console.log('✅ LPUSH operation successful');

    const listLength = await client.lLen('test:list');
    console.log(`✅ LLEN operation successful: ${listLength} items`);

    // Clean up test keys
    await client.del('test:connection', 'test:hash', 'test:list');
    console.log('✅ Cleanup successful');

    // Get Redis info
    const info = await client.info('server');
    const lines = info.split('\r\n');
    const version = lines.find(line => line.startsWith('redis_version:'));
    console.log(`\n📊 Redis Server Info:`);
    console.log(`   ${version}`);

    console.log('\n🎉 Redis connection test PASSED!');
    console.log('✅ Your Redis instance is working correctly');

  } catch (error) {
    console.log('\n❌ Redis connection test FAILED!');
    console.log('Error:', error.message);
    
    if (error.code === 'ECONNREFUSED') {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check if Redis server is running');
      console.log('   2. Verify REDIS_URL is correct');
      console.log('   3. Check firewall/network settings');
    } else if (error.message.includes('WRONGPASS')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check Redis password in REDIS_URL');
      console.log('   2. Verify authentication credentials');
    } else if (error.message.includes('ENOTFOUND')) {
      console.log('\n💡 Troubleshooting:');
      console.log('   1. Check Redis hostname in REDIS_URL');
      console.log('   2. Verify DNS resolution');
    }
    
    process.exit(1);
  } finally {
    if (client) {
      await client.quit();
      console.log('🔌 Redis connection closed');
    }
  }
}

// Run the test
testRedisConnection().catch(console.error);