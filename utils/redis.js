import redis from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    // Create a client to Redis
    this.client = redis.createClient();

    // Handle Redis client error events
    this.client.on('error', (err) => console.error(`Redis client not connected: ${err.message}`));

    // Promisify the get, set, and del methods to use them asynchronously
    this.getAsync = promisify(this.client.get).bind(this.client);
    this.setAsync = promisify(this.client.set).bind(this.client);
    this.delAsync = promisify(this.client.del).bind(this.client);
  }

  // Check if Redis connection is alive
  isAlive() {
    return this.client.connected;
  }

  // Asynchronously get value from Redis by key
  async get(key) {
    return this.getAsync(key);
  }

  // Asynchronously set value in Redis with expiration time in seconds
  async set(key, value, duration) {
    await this.setAsync(key, value, 'EX', duration);
  }

  // Asynchronously delete value from Redis by key
  async del(key) {
    await this.delAsync(key);
  }
}

// Create and export an instance of RedisClient
const redisClient = new RedisClient();
export default redisClient;

